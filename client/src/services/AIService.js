import { HandDetector } from './HandDetector.js'
import { GestureClassifier } from './GestureClassifier.js'

export class AIService {
  constructor() {
    this.handDetector = new HandDetector()
    this.gestureClassifier = new GestureClassifier()
    this.isInitialized = false
  }

  async initialize() {
    try {
      await Promise.all([
        this.handDetector.initialize(),
        this.gestureClassifier.initialize()
      ])
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Error initializing AI service:', error)
      return false
    }
  }

  async predictFromImage(imageElement) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Detect hands
      const handResults = await this.handDetector.detect(imageElement)
      
      if (!handResults.landmarks) {
        return {
          gesture: 'no_hand',
          confidence: 0.0,
          vietnamese_text: 'Không phát hiện bàn tay',
          landmarks: null
        }
      }

      // Classify gesture
      const classification = await this.gestureClassifier.classify(handResults.landmarks)
      
      return {
        gesture: classification.gesture,
        confidence: classification.confidence,
        vietnamese_text: this.gestureClassifier.getVietnameseText(classification.gesture),
        landmarks: handResults.landmarks
      }
    } catch (error) {
      console.error('Error in prediction:', error)
      return {
        gesture: 'error',
        confidence: 0.0,
        vietnamese_text: `Lỗi: ${error.message}`,
        landmarks: null
      }
    }
  }

  async predictFromCanvas(canvas) {
    // Create a temporary image element from canvas
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.predictFromImage(img).then(resolve)
      }
      img.onerror = () => {
        resolve({
          gesture: 'error',
          confidence: 0.0,
          vietnamese_text: 'Không thể xử lý hình ảnh',
          landmarks: null
        })
      }
      img.src = canvas.toDataURL()
    })
  }

  async predictFromBase64(base64Data) {
    // Create a temporary image element from base64
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.predictFromImage(img).then(resolve)
      }
      img.onerror = () => {
        resolve({
          gesture: 'error',
          confidence: 0.0,
          vietnamese_text: 'Không thể xử lý hình ảnh',
          landmarks: null
        })
      }
      img.src = base64Data
    })
  }

  isReady() {
    return this.isInitialized && 
           this.handDetector.isReady() && 
           this.gestureClassifier.isReady()
  }

  dispose() {
    this.handDetector.dispose()
    this.gestureClassifier.dispose()
    this.isInitialized = false
  }

  // Health check method
  async healthCheck() {
    return {
      status: this.isInitialized ? 'healthy' : 'unhealthy',
      hand_detector: this.handDetector.isReady(),
      gesture_classifier: this.gestureClassifier.isReady()
    }
  }

  // Get available gestures
  getAvailableGestures() {
    return Object.keys(this.gestureClassifier.translations)
  }

  // Get Vietnamese translation for a gesture
  getTranslation(gesture) {
    return this.gestureClassifier.getVietnameseText(gesture)
  }
}

// Create singleton instance
export const aiService = new AIService()
