#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var input, data, prompt_1, projectDir, rulesPath, rules, matchedSkills, _i, _a, _b, skillName, config, triggers, keywordMatch, intentMatch, output_1, critical, high, medium, low;
        return __generator(this, function (_c) {
            try {
                input = (0, fs_1.readFileSync)(0, "utf-8");
                data = JSON.parse(input);
                prompt_1 = data.prompt.toLowerCase();
                projectDir = process.env.CLAUDE_PROJECT_DIR || "$HOME/project";
                rulesPath = (0, path_1.join)(projectDir, ".claude", "skills", "skill-rules.json");
                rules = JSON.parse((0, fs_1.readFileSync)(rulesPath, "utf-8"));
                matchedSkills = [];
                // Check each skill for matches
                for (_i = 0, _a = Object.entries(rules.skills); _i < _a.length; _i++) {
                    _b = _a[_i], skillName = _b[0], config = _b[1];
                    triggers = config.promptTriggers;
                    if (!triggers) {
                        continue;
                    }
                    // Keyword matching
                    if (triggers.keywords) {
                        keywordMatch = triggers.keywords.some(function (kw) {
                            return prompt_1.includes(kw.toLowerCase());
                        });
                        if (keywordMatch) {
                            matchedSkills.push({ name: skillName, matchType: "keyword", config: config });
                            continue;
                        }
                    }
                    // Intent pattern matching
                    if (triggers.intentPatterns) {
                        intentMatch = triggers.intentPatterns.some(function (pattern) {
                            var regex = new RegExp(pattern, "i");
                            return regex.test(prompt_1);
                        });
                        if (intentMatch) {
                            matchedSkills.push({ name: skillName, matchType: "intent", config: config });
                        }
                    }
                }
                // Generate output if matches found
                if (matchedSkills.length > 0) {
                    output_1 = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
                    output_1 += "🎯 SKILL ACTIVATION CHECK\n";
                    output_1 += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
                    critical = matchedSkills.filter(function (s) { return s.config.priority === "critical"; });
                    high = matchedSkills.filter(function (s) { return s.config.priority === "high"; });
                    medium = matchedSkills.filter(function (s) { return s.config.priority === "medium"; });
                    low = matchedSkills.filter(function (s) { return s.config.priority === "low"; });
                    if (critical.length > 0) {
                        output_1 += "⚠️ CRITICAL SKILLS (REQUIRED):\n";
                        critical.forEach(function (s) { return (output_1 += "  \u2192 ".concat(s.name, "\n")); });
                        output_1 += "\n";
                    }
                    if (high.length > 0) {
                        output_1 += "📚 RECOMMENDED SKILLS:\n";
                        high.forEach(function (s) { return (output_1 += "  \u2192 ".concat(s.name, "\n")); });
                        output_1 += "\n";
                    }
                    if (medium.length > 0) {
                        output_1 += "💡 SUGGESTED SKILLS:\n";
                        medium.forEach(function (s) { return (output_1 += "  \u2192 ".concat(s.name, "\n")); });
                        output_1 += "\n";
                    }
                    if (low.length > 0) {
                        output_1 += "📌 OPTIONAL SKILLS:\n";
                        low.forEach(function (s) { return (output_1 += "  \u2192 ".concat(s.name, "\n")); });
                        output_1 += "\n";
                    }
                    output_1 += "ACTION: Use Skill tool BEFORE responding\n";
                    output_1 += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
                    console.log(output_1);
                }
                process.exit(0);
            }
            catch (err) {
                console.error("Error in skill-activation-prompt hook:", err);
                process.exit(1);
            }
            return [2 /*return*/];
        });
    });
}
main()["catch"](function (err) {
    console.error("Uncaught error:", err);
    process.exit(1);
});
