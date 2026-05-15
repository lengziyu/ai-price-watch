# 服务器更新与 HTTPS（可复制执行）

以下命令默认：
- 项目目录：`/opt/apps/ai-price-watch`
- PM2 进程名：`ai-price-watch`
- 端口：`3014`
- 域名：`price.lengziyu.cn`

## 1) 首次准备

```bash
cd /opt/apps/ai-price-watch
chmod +x scripts/update-server.sh scripts/setup-https.sh
```

## 2) 日常更新（你每次提交后只跑这一条）

```bash
cd /opt/apps/ai-price-watch && ./scripts/update-server.sh
```

默认会在拉取前自动处理 `data/admin/operation-logs.json` 和 `data/admin/deal-articles.json` 的本地改动（先备份再重置），避免 `git pull` 因运行时数据文件冲突中断。

如果你还希望把其他运行时文件一起自动重置，可传环境变量：

```bash
cd /opt/apps/ai-price-watch && RUNTIME_MUTABLE_FILES="data/admin/operation-logs.json data/admin/source-reviews.json" ./scripts/update-server.sh
```

如果你不是 `main` 分支，例如 `master`：

```bash
cd /opt/apps/ai-price-watch && APP_BRANCH=master ./scripts/update-server.sh
```

## 3) 一次性配置 HTTPS（含自动续期）

带邮箱（推荐）：

```bash
cd /opt/apps/ai-price-watch && ./scripts/setup-https.sh price.lengziyu.cn you@example.com 3014
```

不带邮箱：

```bash
cd /opt/apps/ai-price-watch && ./scripts/setup-https.sh price.lengziyu.cn "" 3014
```

## 4) 查看运行状态

```bash
pm2 status ai-price-watch
pm2 logs ai-price-watch --lines 80
curl -I https://price.lengziyu.cn
```

## 5) 常见故障

- 端口冲突：改端口后执行  
  `APP_PORT=3016 ./scripts/update-server.sh`
- Nginx 配置报错：先看  
  `nginx -t`
- HTTPS 续期检查：  
  `sudo certbot renew --dry-run`
