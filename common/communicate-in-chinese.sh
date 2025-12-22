#!/bin/bash
# 这个脚本会在用户提交提示时自动添加中文沟通要求
# 方案一：简洁判断，无状态文件

# 获取用户输入的JSON内容
json_input=$(cat)

# 使用grep和sed提取prompt字段的内容
# 匹配 "prompt":"内容" 格式，并提取内容
prompt=$(echo "$json_input" | grep -o '"prompt":"[^"]*"' | sed 's/"prompt":"\(.*\)"/\1/')

# 如果提取失败，尝试整个输入作为备用
if [ -z "$prompt" ]; then
    prompt="$json_input"
fi

# 定义中文沟通要求的关键词
chinese_keywords=("请用中文" "请使用中文" "中文回答" "用中文" "Please communicate in Chinese" "Please use Chinese")

# 检查是否已经包含中文沟通要求
has_chinese_request=false
for keyword in "${chinese_keywords[@]}"; do
    if [[ "$prompt" == *"$keyword"* ]]; then
        has_chinese_request=true
        break
    fi
done

# 如果没有中文要求，输出中文沟通指示
if [ "$has_chinese_request" = false ]; then
    echo "请必须用中文回答。"
fi
# 如果已有中文要求，不输出任何内容（保持静默）