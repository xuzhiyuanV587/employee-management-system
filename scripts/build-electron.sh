#!/bin/bash
set -e

cd "$(dirname "$0")/.."

APP_NAME="员工管理系统"
VERSION=$(node -p "require('./package.json').version")

echo "=== Step 1: 安装依赖 ==="
pnpm install

echo "=== Step 2: 构建前端（Electron 模式）==="
ELECTRON_BUILD=1 pnpm --filter frontend run build

echo "=== Step 3: 重编译原生模块 ==="
pnpm run rebuild:electron

echo "=== Step 4: 打包 .app ==="
npx electron-builder --config electron-builder.config.js --mac

echo "=== Step 5: 生成 DMG ==="
DMG_PATH="release/${APP_NAME}-${VERSION}-arm64.dmg"
DMG_TMP=$(mktemp -d)
cp -R "release/mac-arm64/${APP_NAME}.app" "$DMG_TMP/"
ln -s /Applications "$DMG_TMP/Applications"
hdiutil create -volname "$APP_NAME" -srcfolder "$DMG_TMP" -ov -format UDZO "$DMG_PATH"
rm -rf "$DMG_TMP"

echo "=== Step 6: 恢复 Node.js 原生模块 ==="
pnpm run rebuild:node

echo "=== 完成！==="
ls -lh "$DMG_PATH"
