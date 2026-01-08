#!/bin/bash

# 加密密码设置脚本
# 用于在开发环境中设置加密密码环境变量

echo "🔐 设置加密密码环境变量"
echo "================================"
echo ""
echo "这将设置 PPAGE_ENCRYPT_PASSWORD 环境变量，"
echo "使得 npm run dev 和 npm run build 可以自动加密。"
echo ""
echo "⚠️  注意：密码将在当前终端会话中有效"
echo ""

# 读取密码
read -sp "请输入加密密码: " PASSWORD
echo ""

if [ -z "$PASSWORD" ]; then
  echo "❌ 密码不能为空"
  exit 1
fi

# 设置环境变量
export PPAGE_ENCRYPT_PASSWORD="$PASSWORD"

echo "✅ 密码已设置！"
echo ""
echo "现在可以运行："
echo "  npm run dev    # 自动加密后启动开发服务器"
echo "  npm run build  # 自动加密后构建"
echo ""
echo "💡 提示：如果想要长期保存，可以将密码添加到 .env 文件："
echo "  echo 'PPAGE_ENCRYPT_PASSWORD=你的密码' >> .env.local"
echo ""
