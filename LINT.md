# Lint 工具使用指南

本项目已配置完整的代码质量检查工具链,包括 ESLint、Stylelint 和 Prettier。

## 工具说明

### ESLint

- **作用**: JavaScript/JSX 代码质量检查
- **配置文件**: `eslint.config.js`
- **主要规则**:
  - 未使用变量检测
  - React Hooks 规则检查
  - 代码风格一致性

### Stylelint

- **作用**: CSS 代码质量检查
- **配置文件**: `.stylelintrc.json`
- **主要规则**: CSS 语法和风格检查

### Prettier

- **作用**: 代码格式化工具
- **配置文件**: `.prettierrc.json`
- **忽略文件**: `.prettierignore`

### Husky + lint-staged

- **作用**: Git commit 前自动执行 lint
- **配置文件**: `.lintstagedrc.json`, `.husky/pre-commit`

## 可用命令

### 基础 Lint 命令

```bash
# 运行所有 lint 检查(JS + CSS)
npm run lint

# 只检查 JavaScript/JSX
npm run lint:js

# 只检查 CSS
npm run lint:css
```

### 自动修复命令

```bash
# 自动修复所有可修复的问题
npm run lint:fix

# 只修复 JavaScript/JSX 问题
npm run lint:js:fix

# 只修复 CSS 问题
npm run lint:css:fix
```

### Prettier 格式化

```bash
# 格式化所有支持的文件
npm run format

# 检查格式但不修改文件
npm run format:check
```

## 工作流程

### 1. 开发时检查

在开发过程中,你可以随时运行 lint 命令检查代码:

```bash
npm run lint
```

### 2. 修复问题

发现问题后,可以使用自动修复:

```bash
npm run lint:fix
npm run format
```

### 3. 提交代码

配置了 pre-commit hook,在 `git commit` 时会自动:

- 对暂存的文件运行 ESLint 并自动修复
- 对暂存的文件运行 Stylelint 并自动修复
- 对暂存的文件运行 Prettier 格式化

如果有无法自动修复的错误,commit 会被阻止,需要手动修复后再提交。

## 配置说明

### ESLint 规则级别

当前配置的规则级别较为宽松:

- `warn`: 警告,不会阻止代码运行和提交
- `error`: 错误,会阻止构建和提交
- `off`: 关闭规则

主要警告项:

- 未使用的变量和导入
- console.log 语句(允许 console.warn 和 console.error)
- React Hooks 依赖项检查

### 忽略文件

以下文件/目录会被自动忽略:

- `dist/` - 构建输出目录
- `node_modules/` - 依赖目录
- `*.config.js` - 配置文件

### 自定义规则

如需修改规则,可以编辑:

- JavaScript: `eslint.config.js`
- CSS: `.stylelintrc.json`
- 格式化: `.prettierrc.json`

## 常见问题

### Q: 如何临时禁用某个规则?

在代码中添加注释:

```javascript
// eslint-disable-next-line no-console
console.log('debug info')

/* stylelint-disable-next-line color-hex-length */
.class { color: #ffffff; }
```

### Q: 如何跳过 pre-commit hook?

```bash
git commit --no-verify
```

**注意**: 不建议经常使用,应该修复 lint 问题后再提交。

### Q: Prettier 和 ESLint 冲突怎么办?

当前配置已经尽量避免冲突,如果遇到冲突:

1. 优先运行 `npm run format`
2. 再运行 `npm run lint:fix`

## 持续集成

建议在 CI/CD 流程中添加 lint 检查:

```yaml
# 示例: GitHub Actions
- name: Lint
  run: |
    npm run lint
    npm run format:check
```

## 总结

遵循以下最佳实践:

1. 开发前运行 `npm install` 确保依赖安装完整
2. 开发中定期运行 `npm run lint` 检查代码
3. 提交前运行 `npm run lint:fix && npm run format` 自动修复问题
4. pre-commit hook 会自动执行检查,确保提交的代码符合规范
