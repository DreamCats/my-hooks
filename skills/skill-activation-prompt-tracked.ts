#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  prompt: string;
}

interface PromptTriggers {
  keywords?: string[];
  intentPatterns?: string[];
}

interface SkillRule {
  type: "guardrail" | "domain";
  enforcement: "block" | "suggest" | "warn";
  priority: "critical" | "high" | "medium" | "low";
  description?: string;
  promptTriggers?: PromptTriggers;
}

interface SkillRules {
  version: string;
  skills: Record<string, SkillRule>;
}

interface MatchedSkill {
  name: string;
  matchType: "keyword" | "intent";
  config: SkillRule;
}

interface SkillActivationRecord {
  timestamp: number;
  sessionId: string;
  prompt: string;
  matchedSkills: Array<{
    name: string;
    priority: string;
    matchType: string;
    description?: string;
  }>;
  totalMatches: number;
}

// 追踪功能函数
function trackSkillActivation(
  sessionId: string,
  prompt: string,
  matchedSkills: MatchedSkill[]
): void {
  try {
    const homeDir = homedir();
    const trackDir = join(homeDir, ".claude", "skill-tracking");
    const trackFile = join(trackDir, "activations.jsonl");

    // 确保目录存在
    if (!existsSync(trackDir)) {
      mkdirSync(trackDir, { recursive: true });
    }

    const record: SkillActivationRecord = {
      timestamp: Date.now(),
      sessionId,
      prompt: prompt.substring(0, 200), // 限制prompt长度
      matchedSkills: matchedSkills.map(s => ({
        name: s.name,
        priority: s.config.priority,
        matchType: s.matchType,
        description: s.config.description
      })),
      totalMatches: matchedSkills.length
    };

    // 追加写入JSONL格式（每行一个JSON对象）
    const recordLine = JSON.stringify(record) + "\n";
    writeFileSync(trackFile, recordLine, { flag: "a" });

    // 同时更新会话特定的追踪文件
    const sessionTrackFile = join(trackDir, `${sessionId}.json`);
    let sessionData: SkillActivationRecord[] = [];

    if (existsSync(sessionTrackFile)) {
      try {
        const content = readFileSync(sessionTrackFile, "utf-8");
        sessionData = JSON.parse(content);
      } catch (e) {
        // 如果解析失败，重新开始
        sessionData = [];
      }
    }

    sessionData.push(record);

    // 限制每个会话的追踪记录数量（最多100条）
    if (sessionData.length > 100) {
      sessionData = sessionData.slice(-100);
    }

    writeFileSync(sessionTrackFile, JSON.stringify(sessionData, null, 2));

  } catch (error) {
    console.error("Error tracking skill activation:", error);
    // 追踪失败不应该影响主流程
  }
}

// 生成统计信息
function generateStats(matchedSkills: MatchedSkill[]): string {
  const stats = {
    total: matchedSkills.length,
    byPriority: {} as Record<string, number>,
    byMatchType: {} as Record<string, number>,
    skills: [] as string[]
  };

  matchedSkills.forEach(skill => {
    const priority = skill.config.priority;
    const matchType = skill.matchType;

    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    stats.byMatchType[matchType] = (stats.byMatchType[matchType] || 0) + 1;
    stats.skills.push(skill.name);
  });

  return `Stats: ${stats.total} skills matched (${stats.byMatchType.keyword || 0} keyword, ${stats.byMatchType.intent || 0} intent)`;
}

async function main() {
  try {
    // Read input from stdin
    const input = readFileSync(0, "utf-8");
    const data: HookInput = JSON.parse(input);
    const prompt = data.prompt.toLowerCase();

    // Load skill rules
    const homeDir = homedir();
    const rulesPath = join(homeDir, ".claude", "skills", "skill-rules.json");
    const rules: SkillRules = JSON.parse(readFileSync(rulesPath, "utf-8"));

    const matchedSkills: MatchedSkill[] = [];

    // Check each skill for matches
    for (const [skillName, config] of Object.entries(rules.skills)) {
      const triggers = config.promptTriggers;
      if (!triggers) {
        continue;
      }

      // Keyword matching
      if (triggers.keywords) {
        const keywordMatch = triggers.keywords.some((kw) =>
          prompt.includes(kw.toLowerCase()),
        );
        if (keywordMatch) {
          matchedSkills.push({ name: skillName, matchType: "keyword", config });
          continue;
        }
      }

      // Intent pattern matching
      if (triggers.intentPatterns) {
        const intentMatch = triggers.intentPatterns.some((pattern) => {
          const regex = new RegExp(pattern, "i");
          return regex.test(prompt);
        });
        if (intentMatch) {
          matchedSkills.push({ name: skillName, matchType: "intent", config });
        }
      }
    }

    // 追踪技能激活（无论是否匹配到）
    trackSkillActivation(data.session_id, data.prompt, matchedSkills);

    // Generate enhanced output with tracking info
    if (matchedSkills.length > 0) {
      let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      output += '🎯 SKILL ACTIVATION CHECK\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

      // Group by priority
      const critical = matchedSkills.filter(s => s.config.priority === 'critical');
      const high = matchedSkills.filter(s => s.config.priority === 'high');
      const medium = matchedSkills.filter(s => s.config.priority === 'medium');
      const low = matchedSkills.filter(s => s.config.priority === 'low');

      if (critical.length > 0) {
        output += '⚠️ CRITICAL SKILLS (REQUIRED):\n';
        critical.forEach(s => output += `  → ${s.name}\n`);
        output += '\n';
      }

      if (high.length > 0) {
        output += '📚 RECOMMENDED SKILLS:\n';
        high.forEach(s => output += `  → ${s.name}\n`);
        output += '\n';
      }

      if (medium.length > 0) {
        output += '💡 SUGGESTED SKILLS:\n';
        medium.forEach(s => output += `  → ${s.name}\n`);
        output += '\n';
      }

      if (low.length > 0) {
        output += '📌 OPTIONAL SKILLS:\n';
        low.forEach(s => output += `  → ${s.name}\n`);
        output += '\n';
      }

      output += `📊 ${generateStats(matchedSkills)}\n`;
      output += `📝 Tracked for session: ${data.session_id}\n\n`;
      output += 'ACTION: Use Skill tool BEFORE responding\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

      console.log(output);
    } else {
      // 没有匹配到技能时也记录追踪信息
      console.log(`📊 No skills matched (tracked for session: ${data.session_id})`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error in skill-activation-prompt hook:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Uncaught error:", err);
  process.exit(1);
});