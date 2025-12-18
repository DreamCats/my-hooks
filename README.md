# Claude Code 项目配置

这是一个包含 Claude Code 自定义配置和技能的仓库。

## 项目结构

```
.
├── .claude/                    # Claude Code 配置目录
│   ├── settings.local.json     # 本地权限配置
│   └── skills/                 # 自定义技能
│       └── gcmsge/             # Git 提交助手技能
│           └── SKILL.md        # 技能说明文档
├── common/                     # 通用脚本
│   └── communicate-in-chinese.sh  # 中文沟通脚本
├── skills/                     # 技能脚本目录
│   ├── post-tool-use-tracker.sh
│   ├── skill-activation-prompt-tracked.sh
│   ├── skill-activation-prompt.sh
│   └── ...
└── README.md                   # 项目说明
```

## 功能特性

### 1. Git 提交助手 (gcmsge)
一个智能的 Git 提交工具，能够：
- 自动分析代码变更
- 生成符合 Conventional Commits 规范的提交信息
- 使用表情符号标记提交类型
- 智能建议拆分大型提交

使用方式：
```bash
skill: gcmsge
```

### 2. 中文沟通支持
自动检测用户是否需要中文回答，在需要时添加中文沟通要求。

### 3. 技能追踪
记录和追踪技能使用情况，帮助分析和优化工作流程。

## 最近更新

- ✨ 新增 gcmsge 技能，优化 Git 提交流程
- 🔧 添加中文沟通支持脚本
- 📝 完善项目文档和技能说明

## 使用说明

1. 将此仓库克隆到本地
2. 根据需要修改配置文件
3. 在 Claude Code 中使用相关技能

## 注意事项

- 所有技能脚本都需要适当的执行权限
- 使用前请确保已安装必要的依赖
- 建议定期更新技能以保持最佳体验