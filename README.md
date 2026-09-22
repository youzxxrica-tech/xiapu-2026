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

发布仓库只包含这个目录下的静态文件。当前页面按 9 月 29 日至 10 月 3 日游玩、
10 月 4 日一早返程浦江，10 月 5 日经义乌回杭州；霞浦酒店共住 5 晚。

## 路线图与图片

- 路线图使用本地 Leaflet 和 OpenStreetMap 瓦片；连线表示游玩顺序，不是实时导航。
- 大嵛山岛海上连线是班船顺序示意，实际船班以出发前电话确认为准。
- 景点和餐饮图片来自已核实的小红书笔记，采用懒加载，并在大图预览及页面来源区标注出处。
- 图片出处和授权备注见 [`PHOTO-SOURCES.md`](./PHOTO-SOURCES.md)。
