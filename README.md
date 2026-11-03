# Financial Calculators

GitHub 仓库：[joshua880604-web/calculatorfree](https://github.com/joshua880604-web/calculatorfree)。Cloudflare Pages 生产分支：`static-preview-20261021`。

面向英文用户的本地金融计算器站。项目目录：`/workspace/financial-calculators`。

当前覆盖原金融区的全部 **71 个入口**：70 个具有计算功能的工具，以及原站本就没有计算表单的 Real Estate 目录。各工具有独立路由和计算函数，未放置 Coming soon 页面，也未用固定结果代替计算。

**此版本可以本地运行，但尚未完成 Calculator.net 全部交互、字段和视觉的一对一验收。** 不要把本地默认值测试通过解释为原站功能完全一致。精确状态见 `docs/financial-clone/progress.json`、`coverage.json` 和 `remaining-work.md`。

## 当前纯静态版本

全站计算在浏览器执行，无服务端接口、无外部 API 请求。汇率仅保留手动与带日期快照，BTC 仅手动输入。构建输出为 `out/`，可直接部署 Cloudflare Pages；步骤见 [DEPLOY.md](DEPLOY.md)。

## 本地运行

要求 Node.js 24+。当前环境已经安装依赖，并完成生产构建。开发：

```bash
cd /workspace/financial-calculators
npm run dev
```

生产运行：

```bash
npm run build
npm run start
```

在运行服务器的机器访问 `http://localhost:3000/financial-calculator.html`。当前目录在云端；用户电脑上的 localhost 不指向这台云端机器。远程查看需要宿主支持的端口预览或转发，不能把该地址当作已发布的网址。

在新环境恢复依赖：`npm ci`。依赖版本由 `package-lock.json` 固定。启动脚本使用 Node 24 的环境代理支持；保留宿主注入的代理和 CA 配置。

**未创建任何公开站点或执行部署。**

## 检查

```bash
npm run typecheck
npm test
npm run build
```

本地浏览器检查：先启动生产服务器，再运行 `node scripts/browser-qa.mjs`。脚本优先使用已安装的 Playwright，当前云端回退到宿主提供的模块。Chromium 默认 `/usr/bin/chromium`，可以用 `CHROMIUM_PATH` 指定。其他环境需提供自己的 Playwright 和 Chromium；不会自动下载浏览器。

检查报告和截图保存在 `docs/financial-clone/evidence/`。浏览器检查覆盖本地全部金融入口和模式，并抽查桌面/平板/手机布局、输入变更、重置、CSV、搜索和 404。原站视觉/提交检查另行记录，尚未完成。

## 结构

- `src/lib/finance.ts`：借贷、年金、利率换算、IRR、现金流等基础数学函数。
- `src/lib/calculators/`：按房产汽车、投资、退休、税薪、其他工具分别实现的具体业务模型。
- `src/lib/tax.ts`：2025/2026 联邦税估算、资本利得、社保计税、OBBBA 扣除与选定抵免。
- `src/components/`：英文目录、独立表单、结果摘要、图表、表格、分享和导出。
- `scripts/serve-static.mjs`：仅用于本地预览 `out/` 的静态文件服务器。
- `docs/financial-clone/research/`：逐工具研究、官方参数、参考案例和数据来源。
- `.agents/skills/financial-calculator-clone/SKILL.md`：已安装的项目专用 skill。

## 数据与模型

- IRS 2025/2026 税阶、标准扣除、选定扣除/抵免；SSA 2026 工资基数和退休年龄规则。
- IRS RMD Table III、完整 Table II 20–120+ 岁矩阵；不对出版物未提供的年龄插值。
- BLS CPI-U：1913 至 2026 年 9 月实际取得的数据。2026 年均尚不存在，2025 年 10 月官方缺失值不插补。
- 汇率：随构建打包的 Frankfurter 历史快照，明确显示各组成日期，不自动更新。
- BTC：仅手动汇率，不获取外部报价。
- 金额内部保留浮点精度，最终显示两位小数；还款测试检查本金守恒与末期截断。并未声称等同于所有银行的逐日/逐分舍入政策。

税务、养老、费用和比较模型的适用范围写在各结果注释与 `remaining-work.md`。没有把不明确的规则藏在任意常量里，也没有宣称未运行的检查已经通过。

本轮补充：贷款还款表支持按期／年度切换并导出对应 CSV；汽车贷款增加 8 个州的有来源税基规则（税率仍手动输入）；现金返还比较纳入税费和置换车辆；折旧增加实际日期分摊并修正余额递减法末年处理；债券修正月末付息日期。232 项自动检查通过，完整原站一致性仍待核对。

计算准确性审计：见 [详细报告](docs/financial-clone/calculation-audit.md)。本轮修正退休首期通胀时点、年度缴款口径、投资期限边界、特殊 IRR 漏根、RMD 年份/负余额、自雇税小额门槛及 MFS 合资格车贷扣除。247 项测试通过；原站完整同输入/同模式一致性仍未验证，401(k) 退休后分配等缺项已列明。

VAT 已改为四字段任填两个的统一表单，覆盖六种输入组合，Clear 清空全部字段，并处理零税率、无唯一解和不一致输入。273 项自动测试通过；具体原站默认值、异常提示和视觉对照仍未完全验证。

## SEO / AI 搜索准备

已增加 canonical、Open Graph、robots、sitemap、结构化数据和公开计算方法页；全部 75 个实际计算器（70 个金融工具及 5 个日常工具）有英文指南、问答及来源，全站共 107 个可复算算例。参见 [配置与验证说明](docs/financial-clone/seo-geo.md)。

**预览默认 noindex。** 正式上线时在构建环境同时设置 `SITE_URL=https://实际正式域名` 和 `SITE_INDEXABLE=true`，然后重新构建。未确认域名时不会生成虚构的 canonical/sitemap 地址；Vercel Preview 环境保持不收录。内容和技术检查通过不代表已获得排名或 AI 引用。

新增全球通用日常工具：百分比、小费与分账、日期、单位换算。目录的 Everyday Tools 分类可访问；适用规则见 [日常工具说明](docs/financial-clone/everyday-tools.md)。

科学计算器：`/scientific-calculator.html`，支持科学函数、按键面板及角度／弧度切换。当前本地开发完成，尚未同步公开仓库。详见 [实现说明](docs/financial-clone/scientific-calculator.md)。

退休计算更新：401(k) 增加退休提款表和 CSV、配比比例范围、提前提款资格；Retirement 支持独立年度缴款。详见 [说明](docs/financial-clone/retirement-parity-improvements.md)。本批次已获用户授权同步 GitHub。

最新金融功能对应：原站 71 个目录条目（70 个计算器）全部建立功能对应表；本地金融功能 160 模式，全站 173 模式。原站不可核验的细节按明确假设使用独立专家模型，不能将其视为原站结果已全部一致。详见 [本轮说明](docs/financial-clone/strict-functionality-policy.md) 和 [逐项对应表](docs/financial-clone/reference-function-map.json)。本轮尚未同步 GitHub。

全站 SEO 用途入口扩展：75 个计算器覆盖 79 个搜索任务，包含 67 个尚未核验搜索量的候选词；说明见 [本轮记录](docs/financial-clone/seo-expansion-2026-10-21.md)。默认仍 noindex，未声称自然排名或 AI 引用效果。


关键词数据落地（2026-10-21）：依据用户美国 Keyword Planner 数据调整 36 个页面标题，75 个工具有 99 个用途入口、149 个主词/辅助表达；新增独立债务雪球与成本加价率模式、2 个算例（全站 109 个）。483 项测试、静态构建、80 页 SEO 检查通过。仍纯静态、noindex，本轮未上传/部署。见 docs/financial-clone/keyword-demand-implementation.md（handoff 中相对路径按目录解析）。


结果解释优化（2026-10-21）：12 个重点工具提供结果释义与同口径比较步骤，75 个指南增加导航。7 个新增算例使全站达到 116 个，491 项测试与静态构建通过。域名与正式收录继续留到最后，仍无外部 API。详见 docs/financial-clone/result-guides-2026-10-21.md。


分享与 PNG（2026-10-21）：默认分享工具页，勾选后才分享可复算输入；摘要和图片明确提示含结果金额。Canvas 本地生成 PNG，无 API/新依赖。兼容旧参数链接，496 项测试、静态构建和全站 174 模式回归通过。见 docs/financial-clone/sharing-and-image-export.md。保持 noindex，未部署网站。

新增六个固定公式工具（2026-10-21）：Markup、CAGR、Emergency Fund、Break-Even、Investment Fee、Real Return，共19个模式。全站82个目录入口、81个工具、193个模式；新增13个可复算算例。纯静态、无外部API、无政策/行情更新需求，保持正式域名前noindex。模型和核验边界见 [新增工具说明](docs/financial-clone/evergreen-additions-2026-10-21.md)。
