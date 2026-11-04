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
