# Sign2Viet - Web Version

**AI-powered Sign Language to Vietnamese Translation Web Application**

Sign2Viet Web là phiên bản hoàn toàn chạy trên trình duyệt, sử dụng công nghệ AI hiện đại để dịch ngôn ngữ ký hiệu sang tiếng Việt trong thời gian thực mà không cần server.

## ✨ Tính Năng Chính

### 🎯 Core Features
- **Real-time Camera Translation** - Sử dụng camera để nhận diện cử chỉ liên tục
- **Browser-based AI Processing** - Chạy hoàn toàn trên trình duyệt với TensorFlow.js và MediaPipe
- **Vietnamese Translation** - Dịch cử chỉ sang tiếng Việt chính xác
- **Text-to-Speech** - Đọc to bản dịch bằng giọng nói tiếng Việt
- **Local Storage** - Lưu lịch sử dịch trên trình duyệt với IndexedDB
- **Training Data Upload** - Tải lên dữ liệu huấn luyện để cải thiện mô hình

### 🎨 UI Features
- **Modern Glass-morphism Design** - Giao diện hiện đại, trong suốt
- **Responsive Design** - Hoạt động tốt trên mobile và desktop
- **Smooth Animations** - Hiệu ứng chuyển động mượt mà với Framer Motion
- **Real-time Feedback** - Hiển thị trạng thái nhận diện theo thời gian thực

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool và dev server
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### AI / Computer Vision (Browser-based)
- **TensorFlow.js** - Machine learning trên browser
- **MediaPipe** - Hand detection và landmark extraction
- **WebGL** - Hardware acceleration cho AI processing

### Data Storage
- **IndexedDB (via Dexie)** - Client-side database
- **LocalStorage** - Settings và preferences

## 📁 Cấu Trúc Project

```
Sign2Viet/
├── client/                 # React Frontend (Web-only)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CameraPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── UploadPage.jsx
│   │   ├── context/        # React Context
│   │   │   ├── AppContext.jsx
│   │   │   └── AuthContext.jsx
│   │   ├── services/       # Browser-based services
│   │   │   ├── AIService.js      # Main AI service
│   │   │   ├── HandDetector.js   # MediaPipe hand detection
│   │   │   ├── GestureClassifier.js # Gesture classification
│   │   │   └── DatabaseService.js # IndexedDB operations
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── package.json            # Root package with web scripts
└── README-WEB.md          # This file
```

## 🚀 Cài Đặt và Chạy

### 1. Clone và Navigate
```bash
git clone <repository-url>
cd Sign2Viet
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Chạy Development Server
```bash
npm run dev
```

Ứng dụng sẽ mở tại http://localhost:5173

### 4. Build cho Production
```bash
npm run build
```

Files sẽ được build vào thư mục `client/dist/`

## 🌐 Deployment

### Deploy đến GitHub Pages
```bash
# Build ứng dụng
npm run build

# Push đến gh-pages branch
cd client
git subtree push --prefix dist origin gh-pages
```

### Deploy đến Netlify
1. Connect repository của bạn đến Netlify
2. Set build command: `npm run build`
3. Set publish directory: `client/dist`
4. Deploy!

### Deploy đến Vercel
1. Import project vào Vercel
2. Set build command: `npm run build`
3. Set output directory: `client/dist`
4. Deploy!

## 📱 Sử Dụng

### 1. Dashboard
- Xem trạng thái hệ thống và thống kê
- Truy cập nhanh tất cả tính năng
- Tổng quan về các bản dịch gần đây

### 2. Camera Translation
- Cho phép truy cập camera khi được yêu cầu
- Định vị bàn tay trong khung hình
- Hệ thống tự động nhận diện cử chỉ mỗi 2 giây
- Xem bản dịch tiếng Việt và độ tin cậy
- Nhấn biểu tượng loa để nghe bản dịch

### 3. View History
- Xem tất cả các bản dịch trước đó
- Phát âm cho bất kỳ bản dịch nào
- Xóa các mục riêng lẻ hoặc xóa tất cả
- Xem thống kê sử dụng cử chỉ

### 4. Upload Training Data
- Chọn ảnh hoặc video
- Gán nhãn mỗi cử chỉ đúng
- Tải lên để mở rộng dataset huấn luyện
- Hỗ trợ tải lên hàng loạt

## 🎯 Các Cử Chỉ Hỗ Trợ

Hệ thống hiện tại hỗ trợ các cử chỉ sau với bản dịch tiếng Việt:

| Cử chỉ | Tiếng Việt |
|--------|------------|
| hello | Xin chào |
| thank_you | Cảm ơn |
| goodbye | Tạm biệt |
| yes | Có / Đồng ý |
| no | Không |
| please | Làm ơn |
| sorry | Xin lỗi |
| love | Yêu thương |
| help | Giúp đỡ |
| eat | Ăn |
| drink | Uống |
| water | Nước |
| food | Thức ăn |
| home | Nhà |
| family | Gia đình |
| friend | Bạn bè |
| good | Tốt |
| bad | Xấu / Không tốt |
| happy | Vui vẻ |
| sad | Buồn |

## 🔧 Tùy Chính

### Thêm Cử Chỉ Mới
1. Cập nhật `GestureClassifier.js` trong AI service:
```javascript
GESTURE_PATTERNS = [
  // ... existing gestures
  "new_gesture",  // Add here
]

TRANSLATIONS = {
  // ... existing translations
  "new_gesture": "Vietnamese translation",
}
```

2. Cập nhật danh sách cử chỉ trong frontend:
   - Sửa `UploadPage.jsx` để thêm vào `availableGestures`

### Training Custom Models
Để thay thế classification bằng mô hình ML thực tế:

1. Thu thập training data sử dụng tính năng upload
2. Train TensorFlow/PyTorch model trên gesture landmarks
3. Lưu model vào `client/src/models/`
4. Cập nhật `GestureClassifier` để load model:
```javascript
classifier = GestureClassifier(modelPath='models/your_model.json')
```

## 🔍 Troubleshooting

### Camera Không Hoạt Động
- Đảm bảo bạn sử dụng HTTPS hoặc localhost
- Kiểm tra quyền camera trên trình duyệt
- Thử trình duyệt khác (Chrome/Edge được khuyến nghị)

### AI Service Không Khởi Động
- Kiểm tra console browser có lỗi gì không
- Đảm bảo WebGL được hỗ trợ và enabled
- Kiểm tra kết nối internet cho MediaPipe CDN

### Database Không Lưu Dữ Liệu
- Kiểm tra browser có hỗ trợ IndexedDB không
- Xóa cache và reload trang
- Kiểm tra quota storage của browser

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push đến branch: `git push origin feature/amazing-feature`
5. Mở Pull Request

## 📄 License

MIT License - xem [LICENSE](LICENSE) file để biết chi tiết

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) cho hand tracking
- [TensorFlow.js](https://www.tensorflow.org/js) cho browser ML
- [TailwindCSS](https://tailwindcss.com/) cho styling
- [Framer Motion](https://www.framer.com/motion/) cho animations

## 📞 Liên Hệ

Để hỏi hoặc hỗ trợ, vui lòng mở issue trên GitHub.

---

**Made with ❤️ for the Vietnamese deaf community - Web Version**
