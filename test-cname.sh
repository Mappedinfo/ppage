#!/bin/bash

# 测试 CNAME 生成脚本

echo "📋 测试 CNAME 生成功能"
echo "================================"

# 读取配置
CUSTOM_DOMAIN=$(grep -A 5 '^deploy:' public/config.yml | grep 'customDomain:' | awk -F: '{print $2}' | sed 's/[" ]//g' | cut -d'#' -f1 | tr -d '\r')

echo "读取到的 customDomain: [$CUSTOM_DOMAIN]"

if [ -n "$CUSTOM_DOMAIN" ]; then
  echo "✅ customDomain 有值"
  echo "生成 CNAME 文件内容: $CUSTOM_DOMAIN"
  
  # 测试生成 CNAME
  mkdir -p test-dist
  echo "$CUSTOM_DOMAIN" > test-dist/CNAME
  echo ""
  echo "📄 生成的 CNAME 文件内容："
  cat test-dist/CNAME
  echo ""
  echo "✅ 测试成功！"
  rm -rf test-dist
else
  echo "❌ customDomain 为空"
  echo "请检查 public/config.yml 中的配置"
fi
