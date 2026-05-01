export class HandDetector {
  constructor() {
    this.hands = null
    this.camera = null
    this.isInitialized = false
  }

  async initialize() {
    try {
      console.log('Loading MediaPipe Hands...')
      
      // Dynamic import to avoid build issues
      const { Hands } = await import('@mediapipe/hands')
      
      if (!Hands) {
        throw new Error('MediaPipe Hands not available')
      }
      
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      // Wait for hands to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('MediaPipe initialization timeout')), 10000)
        
        this.hands.onResults(() => {
          clearTimeout(timeout)
          resolve()
        })
        
        // Send a dummy image to trigger initialization
        const canvas = document.createElement('canvas')
        this.hands.send({ image: canvas })
      })

      this.isInitialized = true
      console.log('MediaPipe Hands initialized successfully')
      return true
    } catch (error) {
      console.error('Error initializing hand detector:', error)
      console.warn('Hand detection will not be available')
      this.isInitialized = false
      return false
    }
  }

  async detect(imageElement) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.hands) {
      return { landmarks: null, handedness: null }
    }

    return new Promise((resolve) => {
      this.hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0]
          resolve({
            landmarks: landmarks,
            handedness: results.multiHandedness?.[0]?.label || 'Unknown'
          })
        } else {
          resolve({ landmarks: null, handedness: null })
        }
      })

      // Send image to MediaPipe
      this.hands.send({ image: imageElement })
    })
  }

  isReady() {
    return this.isInitialized
  }

  dispose() {
    if (this.camera) {
      this.camera.stop()
    }
    if (this.hands) {
      this.hands.close()
    }
  }
}
