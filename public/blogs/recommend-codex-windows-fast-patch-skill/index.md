如果你在 Windows 上使用 Codex Desktop，应该会遇到一种很烦的情况：软件升级以后，之前能用的 Fast Mode、浏览器控制、Chrome 控制、Computer Use、插件入口或者本地插件市场突然又失效了。

这类问题不是普通“重启一下”就能彻底解决的。因为 Store / MSIX 版本升级后，包内文件、ASAR 内容、本地 helper 路径、feature gate 和配置文件都有可能被覆盖或变动。这个时候，一个成体系的修复流程就很有价值。

我推荐收藏这个仓库：

[chen0416ccc-cpu/codex-windows-fast-patch-skill](https://github.com/chen0416ccc-cpu/codex-windows-fast-patch-skill)

## 1. 这个仓库是做什么的

这个仓库提供的是一个 `codex-windows-fast-patch` skill 的公开版本，主要目标是帮助智能体在 Windows 上恢复 Codex Desktop 升级后失效的本地补丁和能力开关。

它不是一个普通的小脚本集合，而是把一套 Windows Codex 修复经验整理成了可复用的 skill 工作流。里面包含主说明、agent 配置、PowerShell 参考脚本、补丁流程、Computer Use 修复流程、插件市场修复流程、备份管理脚本，以及一些限制解除场景的诊断资料。

简单说，它适合解决这种问题：

- Codex Desktop 升级后 Fast Mode 不见了。
- 请求没有带上 `service_tier=priority`。
- Browser、Chrome、browser_use 能力被门控关掉。
- Computer Use 提示插件不可用或 helper 路径坏了。
- 本地插件市场配置坏掉，插件列表或 marketplace manifest 出错。
- 已经配置好的语言或 locale 重启后又异常。

这些问题单独看都能修，但一个个手动排查很费时间。这个仓库的价值就在于，它把常见修复动作串成了相对完整的流程。

## 2. 为什么我觉得它值得推荐

第一，它解决的是高频痛点。

Windows 版 Codex Desktop 的很多能力依赖本地包、插件、helper、配置文件和 feature gate。升级之后，某个环节被覆盖，就可能导致体验倒退。这个仓库不是在讲抽象概念，而是在处理真实会发生的麻烦。

第二，它不是只给一个“万能命令”。

README 里明确说了，脚本是参考实现和操作模板，不是跨所有机器都能无脑运行的一键方案。正确用法是先读取 `SKILL.md`，检查当前机器的安装方式、MSIX 包路径、ASAR 内容、签名工具、插件目录和 Computer Use 文件状态，再决定执行、改写或借鉴步骤。

这点很重要。因为修 Codex Desktop 这种事情牵涉本地环境，盲目复制命令反而容易把问题弄复杂。

第三，它有备份意识。

仓库里提供了配置备份和恢复相关脚本。比如写入 `config.toml` 前会备份旧配置，也有 `manage-codex-backups.ps1` 用来管理 Codex 的关键状态。对这种会改本地配置和应用包的工作来说，备份不是装饰，而是安全底线。

## 3. 适合谁使用

这个仓库特别适合三类人。

第一类，是经常折腾 Codex Desktop 的 Windows 用户。你可能会装插件、开 Fast Mode、用 browser_use、接 Computer Use，升级后任何一个能力坏掉都会影响日常工作。

第二类，是习惯让智能体帮自己修环境的人。这个仓库本身就是 skill 形态，适合让支持 Agent Skills 的智能体读取后按流程处理，而不是让用户自己从一堆零散帖子里拼命令。

第三类，是想学习 Windows 桌面应用本地修复流程的人。它里面涉及 MSIX、ASAR、PowerShell、签名、插件目录、helper 路径、本地 marketplace 等内容，不只是 Codex 用户能看，喜欢研究桌面应用机制的人也能学到东西。

## 4. 使用时要注意什么

最重要的一点：这个仓库当前只支持 Windows。

它依赖 Windows Store / MSIX 包结构、PowerShell、`Get-AppxPackage`、`makeappx.exe`、`signtool.exe`、Windows 用户环境变量，以及 Windows Computer Use helper 路径。macOS 的应用包结构、签名方式和修复流程完全不同，不要拿它直接套到 macOS 上。

第二，不要跳过 README 里的“使用说明及注意事项”。

有些操作可以在当前 Codex Desktop 会话里处理，比如修插件市场配置、修 Computer Use 本地兼容文件。有些操作会涉及 Desktop 自身的 MSIX / ASAR 重打包和重装，最好让外部 PowerShell 或另一个 agent 处理，避免当前会话中断。

第三，涉及 Fast Mode 时，要看验证结果。

它不只是改 UI，还强调验证请求是否真的带上 `service_tier=priority`。这一点很实用，因为界面显示“开了”和请求真的走 priority 路径不是一回事。

## 5. 我建议怎么收藏

如果你只是普通用户，可以先收藏 GitHub 仓库，等 Codex Desktop 升级后出现能力失效时再用。

如果你已经在使用 Codex 的 skill 机制，可以按仓库 README 的安装方式，把 `SKILL.md`、`agents`、`scripts`、`references`、`assets` 复制到本地 `.codex/skills/codex-windows-fast-patch` 目录，然后重启 Codex 让它重新加载。

后面遇到问题时，可以直接对智能体说：

> 使用 codex-windows-fast-patch 这个 skill，检查并修复这台 Windows 机器上的 Codex Desktop Fast Mode、语言/locale、Chrome browser_use、插件市场和 Computer Use 可用性问题。

这样比自己临时翻命令更稳。

## 6. 总结

[codex-windows-fast-patch-skill](https://github.com/chen0416ccc-cpu/codex-windows-fast-patch-skill) 不是一个花哨项目，但很实用。

它解决的是 Windows 版 Codex Desktop 用户升级后经常遇到的“能力突然失效”问题，并且把修复流程、验证步骤和备份意识都整理进了一个 skill 仓库里。

如果你正在 Windows 上深度使用 Codex，尤其是依赖 Fast Mode、Browser、Chrome、Computer Use 或插件市场，这个仓库值得收藏。它不一定每天都用得上，但真正遇到问题时，会省下很多排查时间。
