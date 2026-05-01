# 🚀 Deploy Sign2Viet lên Netlify

## 📋 Yêu Cầu Trước Khi Deploy

1. **GitHub Repository** - Code đã được push lên GitHub
2. **Netlify Account** - Đăng ký tài khoản miễn phí tại [netlify.com](https://netlify.com)
3. **Git Installed** - Để push code lên repository

---

## 🛠️ CÁCH 1: DEPLOY TỪ GITHUB (KHUYẾN NGHỊ)

### Bước 1: Push Code Lên GitHub

```bash
# Nếu chưa có Git repository
git init
git add .
git commit -m "Initial commit - Sign2Viet Web App"

# Thêm remote repository
git remote add origin https://github.com/username/sign2viet.git
git branch -M main
git push -u origin main
```

### Bước 2: Kết Nối Netlify với GitHub

1. **Đăng nhập Netlify**
   - Truy cập [app.netlify.com](https://app.netlify.com)
   - Đăng nhập bằng GitHub

2. **Tạo Site Mới**
   - Click "Add new site" → "Import an existing project"
   - Chọn GitHub repository của bạn

3. **Cấu Hình Build Settings**
   ```
   Build command: npm run build
   Publish directory: client/dist
   Base directory: client
   ```

4. **Environment Variables** (Không bắt buộc)
   ```
   NODE_VERSION: 18
   ```

5. **Deploy**
   - Click "Deploy site"
   - Chờ vài phút để build hoàn tất

### Bước 3: Cấu Hình Advanced (Tùy chọn)

Netlify sẽ tự động đọc file `netlify.toml` đã được tạo sẵn với:
- **SPA Routing** - Tự động redirect về index.html
- **Security Headers** - Bảo mật cơ bản
- **Asset Caching** - Tối ưu performance

---

## 🛠️ CÁCH 2: DEPLOY TỪ LOCAL

### Bước 1: Build Ứng Dụng

```bash
# Cài đặt dependencies
npm install

# Build production
npm run build
```

### Bước 2: Deploy với Netlify CLI

```bash
# Cài đặt Netlify CLI
npm install -g netlify-cli

# Login vào Netlify
netlify login

# Deploy
cd client
netlify deploy --prod --dir=dist
```

---

## 🔧 Cấu Hình Chi Tiết

### File netlify.toml (Đã được tạo sẵn)

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

| Variable | Value | Mô tả |
|----------|-------|-------|
| `NODE_VERSION` | `18` | Node.js version cho build |
| `VITE_API_URL` | (không cần) | Không dùng server |

---

## 🌐 Testing Sau Deploy

### Kiểm Tra Chức Năng

1. **Camera Access**
   - Mở trang camera
   - Cho phép truy cập camera
   - Kiểm tra hand detection

2. **AI Processing**
   - Thử các cử chỉ: hello, thank_you, goodbye
   - Kiểm tra kết quả translation

3. **Database**
   - Tạo vài bản dịch
   - Kiểm tra history page
   - Test delete functionality

4. **Responsive**
   - Test trên mobile browser
   - Test trên desktop
   - Test tablet view

### Troubleshooting

#### Camera Không Hoạt Động
```
Nguyên nhân: HTTPS không được bật
Giải pháp: Netlify tự động cung cấp HTTPS, kiểm tra URL có https://
```

#### Build Error
```
Nguyên nhân: Node.js version không compatible
Giải pháp: Set NODE_VERSION = 18 trong Netlify settings
```

#### 404 Errors
```
Nguyên nhân: SPA routing không được config
Giải pháp: Kiểm tra file netlify.toml đã có redirects
```

---

## 📊 Performance Optimization

### Netlify Features Đã Sử Dụng

✅ **Automatic HTTPS** - Bắt buộc cho camera access  
✅ **Global CDN** - Fast content delivery  
✅ **Automatic Deploys** - Auto deploy khi push code  
✅ **Split Testing** - A/B testing (nếu cần)  
✅ **Form Handling** - Contact forms (nếu cần)  

### Custom Domain (Tùy chọn)

1. **Mua domain** hoặc dùng domain có sẵn
2. **Add domain** trong Netlify dashboard
3. **DNS settings** - Netlify sẽ cung cấp records
4. **SSL certificate** - Tự động được tạo

---

## 🔄 CI/CD Pipeline

### Auto Deploy Settings

```yaml
# .github/workflows/netlify.yml (tùy chọn)
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=client/dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📱 Mobile App (Tùy chọn)

### Progressive Web App

Để convert thành PWA:

1. **Create manifest.json**
2. **Add service worker**
3. **Install prompts**
4. **Offline functionality**

```bash
# Thêm PWA dependencies
cd client
npm install workbox-webpack-plugin
```

---

## 🎉 Kết Quả

Sau khi deploy thành công, bạn sẽ có:

✅ **Live URL**: `https://your-app-name.netlify.app`  
✅ **HTTPS enabled**: Tự động SSL certificate  
✅ **Global CDN**: Fast loading worldwide  
✅ **Auto deploys**: Mỗi khi push code  
✅ **Preview deploys**: Cho mỗi pull request  
✅ **Analytics**: Basic site analytics  

---

## 🆘 Hỗ Trợ

### Common Issues

1. **Build timeout**: Tối ưu build time
2. **Memory limit**: Split dependencies
3. **Camera permissions**: Kiểm tra HTTPS
4. **Browser compatibility**: Test trên browsers khác nhau

### Resources

- [Netlify Docs](https://docs.netlify.com/)
- [React + Netlify Guide](https://www.netlify.com/blog/2020/getting-started-with-react-on-netlify)
- [Vite + Netlify](https://vitejs.dev/guide/static-deploy.html#netlify)

---

**🚀 Sign2Viet đã sẵn sàng deploy lên Netlify!**

**URL của bạn sẽ là**: `https://sign2viet-tên-của-bạn.netlify.app`
