# 上线前检查清单 · Launch Checklist

> 南昌市东方特种磨具厂官网 · df-company.vercel.app  
> 最后更新：2026-08-21

---

## 一、内容与合规

- [ ] **成立年份一致**：全站统一为 1990 年创立，年限表述统一为「36 年」（2026−1990）
- [ ] **数据表述可核实**：已移除「20+ 出口市场」「逾千家客户」「40+ 产品」等难以核实的数字；上线前请确认剩余表述（如「数百家合作企业」）是否有依据
- [ ] **隐私政策**：[`privacy.html`](privacy.html) 已发布，页脚与联系表单已链接
- [ ] **ICP 备案**（若使用国内域名/服务器）：在页脚添加备案号并链接至工信部查询页
- [ ] **联系方式准确**：邮箱 `CJ711226@163.com`、地址、电话（如有）与对外名片一致
- [ ] **占位页面**：导航中「研发与技术」「新闻中心」仍为 `#` 占位 — 上线前隐藏或补充真实页面

## 二、功能与 API

- [ ] **询盘表单（Production）**：在 Vercel 项目 Settings → Environment Variables 配置 SMTP：
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `INQUIRY_TO`（收件邮箱）
- [ ] **生产环境实测**：在 `df-company.vercel.app/contact.html` 提交测试询盘，确认邮件送达
- [ ] **本地静态预览**：`python3 -m http.server 8765` 可浏览页面，但 `/api/inquiry` 需 Vercel 或 Node 环境
- [ ] **404 / 错误页**：可选添加简单 `404.html`

## 三、视觉与素材

- [ ] **工厂实景**：首页 Hero、关于页大门照片已替换为自有素材
- [ ] **产品图**：`images/products/*.png` 与目录一致；缺失项（如 fiber-oil-stone）仍为 SVG 占位
- [ ] **页头背景图**：Pexels 图用于 products/about/contact 页头 — 如需完全自有素材可后续替换
- [ ] **硬刷新 / 缓存**：重大 CSS/图片更新后检查 `?v=` 缓存参数是否 bump

## 四、SEO 与分享

- [ ] 各页 `<title>` 与 `<meta name="description">` 独特且准确
- [ ] 添加 Open Graph / 社交分享图（可选，`og:image`）
- [ ] 提交 sitemap 至 Google Search Console / 百度站长（如有国内推广需求）
- [ ] favicon `images/logo.svg` 在各浏览器显示正常

## 五、性能与安全

- [ ] HTTPS 由 Vercel 自动提供 — 确认自定义域名（如有）证书有效
- [ ] 第三方 CDN（Google Fonts、OpenCC-JS、jsDelivr）加载正常；国内访问慢时可考虑自托管字体
- [ ] 确认 `.env` / SMTP 密钥未提交至 Git（应在 `.gitignore` 中）
- [ ] 联系表单有基本必填校验（姓名、邮箱、留言）

## 六、部署与 Git

- [ ] 本地改动已 commit
- [ ] 推送到 `ScofieldChen1/DF-Company`（需 GitHub 认证）
- [ ] Vercel 自动部署成功，Production 分支为 `main`
- [ ] 部署后抽查：首页、产品筛选、语言切换、联系表单、隐私政策页

## 七、上线后（可选）

- [ ] 监控 Vercel Function 日志（询盘 API 错误）
- [ ] 定期更新产品目录与 GB/T 对照
- [ ] 补充 About 页 `image-placeholder` 区域的真实照片
- [ ] 添加英文/繁体 PDF 产品目录下载

---

## 快速命令

```bash
# 本地预览
cd /Users/huangna/Projects/Dessel && python3 -m http.server 8765

# 提交并推送（需用户授权）
git add -A && git status
git commit -m "Commercial launch prep: privacy policy, copy consistency"
git push origin main
```
