# 霞浦移动端预览

这是从 TREK 霞浦行程中整理出的无登录静态预览，专门用于微信分享。它不依赖 TREK
后端，不包含账号、Cookie 或私有令牌。

## 本地预览

```bash
python3 -m http.server 4173 --directory mobile-preview
```

访问 `http://127.0.0.1:4173/`。

## 发布地址

<https://youzxxrica-tech.github.io/xiapu-2026/>

发布仓库只包含这个目录下的静态文件。修改行程后，应同步更新本页和 TREK 数据库，
避免分享页与主行程不一致。
