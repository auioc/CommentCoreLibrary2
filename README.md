<h1 align="center">CommentCoreLibrary 2</h1>

<div align="center">

**弹幕核心通用构件 2**

此项目建立在 [Jim Chen](https://github.com/jabbany) 的作品 [CommentCoreLibrary](https://github.com/jabbany/CommentCoreLibrary) 之上

</div>

## 背景

原始项目长时间未更新且起步较早使用技术与新的技术树差距较大[^1]，所以我们决定使用新技术重构此项目并保持该副本更新。

由于迁移困难较大，除非我们得到了原作者的协助，此副本将不会合并入原始项目。

[^1]: <https://github.com/jabbany/CommentCoreLibrary/issues/94>

## 进度

**目前迁移重构正在进行中，项目暂时没有在 npm 上发布。**

- [x] 基础核心功能（`CommentManager`）
- [x] 弹幕过滤
- [x] 弹幕预处理
- [x] 高级弹幕效果
- [ ] 弹幕解析
  - [ ] CCLNative
  - [x] Bilibili XML
  - [ ] AcFun JSON
- [ ] 代码弹幕
- [ ] 文档
- [ ] 示例

## 使用

详情请参见项目文档（WIP）。

### 模块

#### `comment-core-library-2`

包含以下所有模块，且支持直接在浏览器中使用。

#### `@ccl2/core`

核心模块（`CommentManager`）与各种 API。

#### `@ccl2/parsers`

弹幕解析器：

- `BilibiliXmlParser`：哔哩哔哩 XML 格式弹幕

#### `@ccl2/filters`

多个内置的过滤器：

- `CommentTypeFilter`：弹幕类型过滤
- `RuleBasedFilter`：基于规则的高级过滤

#### `@ccl2/scripting`

代码弹幕引擎（重构尚未完成）。

## 致谢

## 许可证

CommentCoreLibrary 2 基于 [CommentCoreLibrary](https://github.com/jabbany/CommentCoreLibrary)（[LICENSE](/docs/ccl-license.txt)）。

CommentCoreLibrary 2 采用 **MIT 许可证** 授权，完整许可文件参见 [LICENSE](/LICENSE)。
