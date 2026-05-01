# Sign2Viet

**AI-powered Sign Language to Vietnamese Translation Application**

Sign2Viet is a modern full-stack application that uses computer vision and AI to translate sign language gestures into Vietnamese text and speech in real-time.

![Sign2Viet Demo](demo-screenshot.png)

## Features

### Core Features
- **Real-time Camera Translation** - Access live camera feed for continuous hand detection
- **Sign Language Recognition** - Recognize gestures using MediaPipe and AI classification
- **Vietnamese Translation** - Convert gestures to Vietnamese text
- **Text-to-Speech** - Read translations aloud using browser's speech synthesis
- **Translation History** - Save and review past translations with MongoDB
- **Training Data Upload** - Upload images/videos to expand the training dataset

### UI Features
- **Futuristic Dashboard** - Clean, modern glass-morphism design
- **Responsive Design** - Works on mobile and desktop
- **Smooth Animations** - Framer Motion powered transitions
- **Real-time Feedback** - Visual indicators for detection status

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Multer** - File upload handling

### AI / Computer Vision
- **Python 3.8+** - Programming language
- **FastAPI** - High-performance API framework
- **MediaPipe** - Hand detection and landmark extraction
- **OpenCV** - Image processing
- **TensorFlow** - Deep learning (placeholder for custom models)

## Project Structure

```
Sign2Viet/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CameraPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── UploadPage.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── server/                 # Node.js Backend
│   ├── models/
│   │   ├── Translation.js
│   │   └── TrainingData.js
│   ├── routes/
│   │   ├── translations.js
│   │   ├── uploads.js
│   │   └── ai-proxy.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── ai-service/             # Python AI Microservice
│   ├── hand_detector.py
│   ├── gesture_classifier.py
│   ├── main.py
│   └── requirements.txt
│
├── package.json            # Root package with scripts
├── .env.example            # Environment variables template
├── .gitignore
└── README.md
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** (local or cloud instance)

## Installation

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd Sign2Viet
```

### 2. Install All Dependencies

```bash
# Install root dependencies + client + server
npm run install:all
```

Or install manually:

```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install && cd ..

# Server dependencies
cd server && npm install && cd ..

# AI Service dependencies
cd ai-service && pip install -r requirements.txt && cd ..
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sign2viet
AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Windows (as service)
net start MongoDB

# Or use MongoDB Atlas cloud instance
```

## Running the Application

### Option 1: Run All Services Concurrently (Recommended for Development)

```bash
npm run dev
```

This starts:
- AI Service on port 8000
- Backend Server on port 5000
- Frontend Client on port 5173

### Option 2: Run Services Separately

Terminal 1 - AI Service:
```bash
cd ai-service
python -m uvicorn main:app --reload --port 8000
```

Terminal 2 - Backend:
```bash
cd server
npm run dev
```

Terminal 3 - Frontend:
```bash
cd client
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000

## Usage Guide

### 1. Dashboard
- View system status and statistics
- Quick access to all features
- Overview of recent translations

### 2. Camera Translation
- Allow camera access when prompted
- Position your hand in the frame
- System automatically detects gestures every 2 seconds
- View Vietnamese translation and confidence score
- Click the speaker icon to hear the translation

### 3. View History
- Browse all past translations
- Play audio for any translation
- Delete individual entries or clear all
- View gesture usage statistics

### 4. Upload Training Data
- Select images or videos
- Label each with the correct gesture
- Upload to expand the training dataset
- Supports batch uploads

## API Documentation

### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/translations` | Get translation history |
| POST | `/api/translations` | Save new translation |
| DELETE | `/api/translations/:id` | Delete translation |
| GET | `/api/uploads` | Get uploaded training data |
| POST | `/api/uploads` | Upload new training file |
| POST | `/api/ai/predict` | Proxy to AI prediction |

### AI Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/predict` | Predict from image file |
| POST | `/predict/base64` | Predict from base64 image |
| WS | `/ws` | WebSocket for real-time detection |

## Available Gestures

The system currently supports these gestures with Vietnamese translations:

| Gesture | Vietnamese |
|---------|------------|
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

## Development

### Adding New Gestures

1. Update `gesture_classifier.py` in the AI service:
   ```python
   GESTURE_PATTERNS = [
       # ... existing gestures
       "new_gesture",  # Add here
   ]
   
   TRANSLATIONS = {
       # ... existing translations
       "new_gesture": "Vietnamese translation",
   }
   ```

2. Update the gesture list in the frontend:
   - Edit `UploadPage.jsx` to add to `availableGestures`

3. Train or collect data for the new gesture
4. Upload training data through the Upload page

### Training Custom Models

To replace mock classification with a real ML model:

1. Collect training data using the upload feature
2. Train a TensorFlow/PyTorch model on the gesture landmarks
3. Save the model to `ai-service/models/`
4. Update `GestureClassifier` to load your model:
   ```python
   classifier = GestureClassifier(model_path='models/your_model.h5')
   ```

## Deployment

### Deploy to Heroku

```bash
# Create Heroku apps
heroku create sign2viet-api
heroku create sign2viet-ai

# Set environment variables
heroku config:set MONGODB_URI=<your-mongodb-uri> --app sign2viet-api
heroku config:set AI_SERVICE_URL=<ai-service-url> --app sign2viet-api

# Deploy
git subtree push --prefix server heroku main --app sign2viet-api
git subtree push --prefix ai-service heroku main --app sign2viet-ai
```

### Deploy Frontend to Vercel/Netlify

```bash
cd client
npm run build

# Deploy dist/ folder to Vercel or Netlify
```

### Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - PORT=8000

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://mongodb:27017/sign2viet
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - mongodb
      - ai-service

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  mongo_data:
```

## Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS or localhost (browsers block camera on insecure origins)
- Check browser permissions for camera access
- Try a different browser (Chrome/Edge recommended)

### AI Service Connection Failed
- Verify AI service is running on port 8000
- Check `AI_SERVICE_URL` environment variable
- Ensure Python dependencies are installed

### MongoDB Connection Failed
- Verify MongoDB is running
- Check `MONGODB_URI` environment variable
- For cloud MongoDB, ensure IP whitelist includes your server

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for hand tracking
- [FastAPI](https://fastapi.tiangolo.com/) for the AI service framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

## Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for the Vietnamese deaf community**
