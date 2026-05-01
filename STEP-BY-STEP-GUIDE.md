# 📋 HƯỚNG DẪN CHI TIẾT DEPLOY LÊN NETLIFY

## 🔥 BƯỚC 1: CHUẨN BỊ GITHUB REPOSITORY

### 1.1 Kiểm Tra Git Đã Cài Đặt Chưa

Mở terminal/command prompt và gõ:
```bash
git --version
```

Nếu chưa có Git, tải tại: https://git-scm.com/download/win

### 1.2 Đăng Nhập GitHub

1. Truy cập: https://github.com
2. Đăng nhập tài khoản của bạn
3. Nếu chưa có tài khoản, click "Sign up" để đăng ký miễn phí

### 1.3 Tạo Repository Mới Trên GitHub

1. Click dấu "+" góc trên phải → "New repository"
2. Điền thông tin:
   - **Repository name**: `sign2viet` (hoặc tên bạn muốn)
   - **Description**: `AI-powered Sign Language to Vietnamese Translation Web App`
   - **Visibility**: Chọn "Public" (miễn phí)
   - **Add a README file**: **KHÔNG** chọn (đã có sẵn)
   - **Add .gitignore**: **KHÔNG** chọn
   - **Choose a license**: **KHÔNG** chọn (đã có sẵn)
3. Click "Create repository"

### 1.4 Lấy Repository URL

Sau khi tạo xong, GitHub sẽ show trang với các dòng lệnh. Copy dòng:
```
https://github.com/username/sign2viet.git
```
(Thay `username` bằng tên GitHub của bạn)

---

## 🔥 BƯỚC 2: SETUP GIT LOCAL VÀ PUSH CODE

### 2.1 Mở Terminal/Command Prompt

1. Nhấn `Win + R`
2. Gõ `cmd` và Enter
3. Hoặc dùng Git Bash nếu đã cài

### 2.2 Navigate Đến Thư Mục Project

```bash
# Ví dụ project ở E:\NNKH\Sign2Viet
cd /d E:\NNKH\Sign2Viet
```

### 2.3 Khởi Tạo Git Repository

```bash
git init
```

Bạn sẽ thấy output:
```
Initialized empty Git repository in E:/NNKH/Sign2Viet/.git/
```

### 2.4 Kiểm Tra Trạng Thái Files

```bash
git status
```

Bạn sẽ thấy danh sách các file chưa được tracked (màu đỏ).

### 2.5 Tạo .gitignore File (Nếu Chưa Có)

```bash
# Tạo file .gitignore
echo node_modules/ > .gitignore
echo dist/ >> .gitignore
echo .DS_Store >> .gitignore
echo *.log >> .gitignore
echo package-lock.json >> .gitignore
echo .env* >> .gitignore
```

### 2.6 Add Tất Cả Files

```bash
git add .
```

### 2.7 Kiểm Tra Lại Files Đã Được Add

```bash
git status
```

Bây giờ files sẽ hiển thị màu xanh (staged).

### 2.8 Commit Lần Đầu

```bash
git commit -m "Initial commit - Sign2Viet Web App"
```

Bạn sẽ thấy output tương tự:
```
[master (root-commit) abc1234] Initial commit - Sign2Viet Web App
 45 files changed, 12345 insertions(+)
 create mode 100644 README-WEB.md
 create mode 100644 netlify.toml
 ...
```

### 2.9 Kết Nối Với GitHub Repository

```bash
# Thay username bằng tên GitHub của bạn
git remote add origin https://github.com/username/sign2viet.git
```

### 2.10 Kiểm Tra Remote Connection

```bash
git remote -v
```

Bạn sẽ thấy:
```
origin  https://github.com/username/sign2viet.git (fetch)
origin  https://github.com/username/sign2viet.git (push)
```

### 2.11 Push Code Lên GitHub

**Cách 1: Nếu lần đầu push (khuyến nghị):**
```bash
git push -u origin main
```

**Cách 2: Nếu gặp lỗi về branch:**
```bash
git branch -M main
git push -u origin main
```

### 2.12 Nhập Username và Password

Git sẽ yêu cầu:
- **Username**: Tên GitHub của bạn
- **Password**: **Dùng Personal Access Token**, không dùng password

**Tạo Personal Access Token:**
1. Vào GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Check "repo" (full control of private repositories)
4. Click "Generate token"
5. Copy token (không bao giờ chia sẻ cho người khác)

### 2.13 Kiểm Tra Kết Quả

1. Quay lại repository trên GitHub
2. Refresh trang (F5)
3. Bạn sẽ thấy tất cả files đã được upload

---

## 🔥 BƯỚC 3: KẾT NỐI NETLIFY VỚI GITHUB

### 3.1 Đăng Nhập Netlify

1. Truy cập: https://app.netlify.com
2. Click "Sign up" hoặc "Log in"
3. Chọn "Login with GitHub"
4. Authorize Netlify truy cập GitHub của bạn

### 3.2 Tạo Site Mới

1. Sau khi login, bạn sẽ ở dashboard
2. Click "Add new site" (góc trên phải)
3. Chọn "Import an existing project"

### 3.3 Chọn Git Provider

1. Click "GitHub" (hoặc GitLab/Bitbucket)
2. Nếu lần đầu, Netlify sẽ yêu cầu authorization
3. Click "Install Netlify" trên GitHub
4. Chọn "All repositories" hoặc chỉ repository của bạn
5. Click "Install"

### 3.4 Chọn Repository

1. Tìm repository `sign2viet` của bạn
2. Click vào repository đó
3. Click "Connect"

---

## 🔥 BƯỚC 4: CẤU HÌNH BUILD SETTINGS

### 4.1 Basic Build Settings

Netlify sẽ tự động detect project, nhưng bạn cần kiểm tra:

**Directory settings:**
```
Base directory: client
Build command: npm run build
Publish directory: dist
```

Nếu Netlify không detect đúng, hãy sửa thủ công:

1. **Base directory**: Gõ `client`
2. **Build command**: Gõ `npm run build`
3. **Publish directory**: Gõ `dist`

### 4.2 Advanced Build Settings

Click "Advanced build settings" (nếu cần):

**Add environment variable:**
- **Key**: `NODE_VERSION`
- **Value**: `18`
- **Scope**: Build & development

### 4.3 Review và Deploy

1. Kiểm tra lại tất cả settings
2. Click "Deploy site"
3. Chờ quá trình build (khoảng 2-3 phút)

---

## 🔥 BƯỚC 5: KIỂM TRA KẾT QUẢ DEPLOY

### 5.1 Theo Dõi Quá Trình Build

Netlify sẽ show:
- **Build log**: Các bước thực hiện
- **Dependencies**: npm install
- **Build process**: npm run build
- **Deploy**: Upload files

### 5.2 Kết Quả Thành Công

Nếu thành công, bạn sẽ thấy:
```
✅ Site is live
🔗 https://your-site-name.netlify.app
```

### 5.3 Test Website

1. Click vào URL của site
2. Kiểm tra các tính năng:
   - Trang chủ load
   - Camera page hoạt động
   - AI processing
   - History page

---

## 🔥 BƯỚC 6: TROUBLESHOOTING CÁC LỖI THƯỜNG GẶP

### 6.1 Lỗi Git Push

**Lỗi: "Authentication failed"**
```bash
# Giải pháp: Tạo Personal Access Token
# Settings → Developer settings → Personal access tokens
# Generate new token → Check "repo" → Copy token
# Dùng token làm password khi push
```

**Lỗi: "remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/username/sign2viet.git
```

### 6.2 Lỗi Build Netlify

**Lỗi: "Build command failed"**
- Kiểm tra `package.json` có script `build` không
- Kiểm tra `base directory` là `client`

**Lỗi: "Node version incompatible"**
- Thêm environment variable `NODE_VERSION = 18`

**Lỗi: "Build timeout"**
- Kiểm tra dependencies quá lớn
- Tối ưu build time

### 6.3 Lỗi Runtime

**Camera không hoạt động:**
- Kiểm tra URL có `https://` không
- Kiểm tra browser permissions

**404 errors:**
- Kiểm tra file `netlify.toml`
- Kiểm tra SPA routing

---

## 🔥 BƯỚC 7: CÁC TÍNH NĂNG NETLIFY HỮU ÍCH

### 7.1 Custom Domain (Miễn Phí)

1. Vào Site settings → Domain management
2. Click "Add custom domain"
3. Nhập domain của bạn
4. Cấu hình DNS theo hướng dẫn

### 7.2 Auto Deploy

Mỗi khi bạn push code lên GitHub:
- Netlify tự động build
- Tự động deploy
- Tạo preview cho mỗi pull request

### 7.3 Environment Variables

Thêm trong Site settings → Build & deploy → Environment:
```
NODE_VERSION = 18
VITE_API_URL = (không cần cho web-only)
```

### 7.4 Split Testing

Test các phiên bản khác nhau của ứng dụng:
- Site settings → Split testing
- Tạo A/B tests

---

## 🎉 KẾT QUẢ CUỐI CÙNG

Sau khi hoàn thành, bạn sẽ có:

✅ **Live website**: `https://tên-site.netlify.app`  
✅ **Auto HTTPS**: Bắt buộc cho camera  
✅ **Global CDN**: Tải nhanh toàn cầu  
✅ **Auto deploy**: Push code → tự động update  
✅ **Preview deploys**: Test trước khi publish  
✅ **Analytics**: Basic traffic stats  

**🚀 Sign2Viet của bạn đã sẵn sàng sử dụng trên toàn thế giới!**

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra lại từng bước trên
2. Đọc Netlify docs: https://docs.netlify.com/
3. Báo lỗi cụ thể cho tôi

**Chúc bạn deploy thành công! 🎉**
