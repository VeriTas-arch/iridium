# Iridium

**AI 辅助论文写作：原则、判断与表达。**

围绕科研写作中的读者、问题、证据、结构与表达，讨论 AI 如何参与起草、审读和修改。正文为中文，包含真实稿件节选、历史修改指令与标明来源的教学示范。

[阅读网站](https://veritas-arch.github.io/iridium/)

## 内容

| 页面 | 内容 |
| --- | --- |
| [写作原则](https://veritas-arch.github.io/iridium/) | 从研究问题与读者出发，讨论概念、论证、结构、语言和修订判断。 |
| [写作案例](https://veritas-arch.github.io/iridium/case.html) | 从代码与结果到附录和正文，展示内容取舍、审稿补充、多轮修改与全文检查。 |
| [与 Astra 协作](https://veritas-arch.github.io/iridium/astra.html) | 讨论任务目标、取舍原则、长期约定和不同视角的审查。 |

页面提供目录进度、打印、稿件对照、指令复制与 TXT 下载。关闭 JavaScript 后仍可阅读正文和稿件版本。网站不调用模型 API，也不收集访客输入。

## 本地预览

这是无构建依赖的静态网站，HTML、CSS、JavaScript 与资源均位于仓库根目录。

```sh
python3 -m http.server 4388 --bind 127.0.0.1
```

打开 <http://127.0.0.1:4388/>。也可以直接打开 `index.html`；剪贴板不可用时，复制按钮会改为选中文本。

## 发布

GitHub Pages 从 `main` 分支的根目录发布，`.nojekyll` 使静态文件直接提供。推送到 `main` 后，GitHub 会自动更新网站。

页面之间及资源引用使用相对路径，以支持 `/iridium/` 项目路径。本项目使用独立仓库维护，个人网站不需要增加导航或文章入口。

## 材料与维护

写作原则参考 `GM_2025_Autumn.pdf` 与易莉《学术写作原来是这样》整理；阅读页面直接展开原则。案例依据 Schema 代码、ICLR 稿件、NeurIPS 目录中的审稿记录和历史修改对话。真实节选、教学重构与过程归纳分别标明，具体稿件版本见案例页末尾。仓库不包含完整课程、书籍、论文、审稿记录或对话日志。

控制实验与主线的案例对应稿件提交 `f718e52`；恢复与整合过程核对了 2026 年 9 月 25 日的原始对话及稿件版本 `c23d541`。示例说明写作判断，不以版本先后证明质量。

Astra 协作页的工具行为与提示建议于 2026 年 11 月 4 日核对官方资料：[Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)、[GPT-6 prompting best practices](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra#prompting-best-practices)、[AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)。用于论文写作的具体判断来自本项目实践，中文提示示例不作为经官方验证的效果案例。

长文呈现参考 [Sparks of Weight-Space Programming](https://rikiyat.github.io/blog/weight-space-programming/)。前端改进采用 [Impeccable](https://github.com/pbakaus/impeccable) 的审查与排版方法，没有引入运行时依赖。名称取自化学元素铱（Iridium，Ir，77）；铱合金与笔尖的联系见[英国皇家化学学会](https://periodic-table.rsc.org/element/77/iridium)。
