import { HandDetector } from './HandDetector.js'
import { GestureClassifier } from './GestureClassifier.js'

export class AIService {
  constructor() {
    this.handDetector = new HandDetector()
    this.gestureClassifier = new GestureClassifier()
    this.isInitialized = false
    this.initializationPromise = null
  }

  async initialize() {
    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    // Return immediately if already initialized
    if (this.isInitialized) {
      return true
    }

    // Create initialization promise
    this.initializationPromise = this._doInitialize()
    return this.initializationPromise
  }

  async _doInitialize() {
    try {
      console.log('Initializing AI service...')
      
      // Initialize with longer timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI service initialization timeout')), 20000)
      )

      // Initialize services separately to avoid one failure blocking the other
      try {
        await Promise.race([
          this.handDetector.initialize(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Hand detector timeout')), 15000))
        ])
        console.log('Hand detector initialized successfully')
      } catch (error) {
        console.warn('Hand detector initialization failed:', error.message)
      }

      try {
        await Promise.race([
          this.gestureClassifier.initialize(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Gesture classifier timeout')), 15000))
        ])
        console.log('Gesture classifier initialized successfully')
      } catch (error) {
        console.warn('Gesture classifier initialization failed:', error.message)
      }

      this.isInitialized = true
      console.log('AI service initialized successfully')
      return true
    } catch (error) {
      console.error('Error initializing AI service:', error)
      // Don't throw error, allow app to continue with limited functionality
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
