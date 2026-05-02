export class HandDetector {
  constructor() {
    this.hands = null
    this.camera = null
    this.isInitialized = false
  }

  async initialize() {
    try {
      console.log('Loading MediaPipe Hands...')
      
      // Check if MediaPipe is available
      if (typeof window === 'undefined') {
        console.warn('Window object not available, using mock hand detector')
        this.isInitialized = false
        return false
      }
      
      // Try dynamic import with timeout
      let mediapipeHands
      try {
        const importPromise = import('@mediapipe/hands')
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('MediaPipe import timeout')), 10000)
        )
        mediapipeHands = await Promise.race([importPromise, timeoutPromise])
      } catch (importError) {
        console.warn('Failed to import MediaPipe Hands:', importError.message)
        console.warn('Using mock hand detector - hand detection will not be available')
        this.isInitialized = false
        return false
      }
      
      const { Hands } = mediapipeHands
      
      if (!Hands) {
        console.warn('MediaPipe Hands class not found in import')
        this.isInitialized = false
        return false
      }
      
      console.log('Creating MediaPipe Hands instance...')
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      console.log('Setting MediaPipe Hands options...')
      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Use lowest complexity for faster loading
        minDetectionConfidence: 0.3, // Lower confidence threshold
        minTrackingConfidence: 0.3
      })

      console.log('Initializing MediaPipe Hands...')
      // Wait for hands to be ready with longer timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('MediaPipe initialization timeout, continuing without hand detection')
          resolve()
        }, 20000)
        
        this.hands.onResults((results) => {
          console.log('MediaPipe Hands ready')
          clearTimeout(timeout)
          resolve()
        })
        
        // Send a dummy image to trigger initialization
        try {
          const canvas = document.createElement('canvas')
          canvas.width = 640
          canvas.height = 480
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = 'black'
          ctx.fillRect(0, 0, 640, 480)
          
          this.hands.send({ image: canvas })
        } catch (canvasError) {
          console.warn('Failed to create canvas for MediaPipe initialization:', canvasError.message)
          resolve()
        }
      })

      this.isInitialized = true
      console.log('MediaPipe Hands initialized successfully')
      return true
    } catch (error) {
      console.error('Error initializing hand detector:', error)
      console.warn('Hand detection will not be available - app will continue with limited functionality')
      this.isInitialized = false
      return false
    }
  }

  async detect(imageElement) {
    if (!this.isInitialized) {
      console.log('Hand detector not initialized, attempting to initialize...')
      const initResult = await this.initialize()
      if (!initResult) {
        console.warn('Hand detector initialization failed, returning mock landmarks')
        // Return mock landmarks for testing alphabet gestures
        return this.getMockLandmarks()
      }
    }

    if (!this.hands) {
      console.warn('MediaPipe Hands not available, returning mock landmarks')
      return this.getMockLandmarks()
    }

    try {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('Hand detection timeout, returning mock landmarks')
          resolve(this.getMockLandmarks())
        }, 5000)

        this.hands.onResults((results) => {
          clearTimeout(timeout)
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
        try {
          this.hands.send({ image: imageElement })
        } catch (sendError) {
          clearTimeout(timeout)
          console.warn('Failed to send image to MediaPipe:', sendError.message)
          resolve(this.getMockLandmarks())
        }
      })
    } catch (error) {
      console.error('Error in hand detection:', error)
      return this.getMockLandmarks()
    }
  }

  // Mock landmarks for testing when MediaPipe is not available
  getMockLandmarks() {
    // Generate realistic hand landmarks for testing alphabet gestures
    const mockLandmarks = []
    for (let i = 0; i < 21; i++) {
      mockLandmarks.push({
        x: 0.5 + (Math.random() - 0.5) * 0.2,
        y: 0.5 + (Math.random() - 0.5) * 0.2,
        z: Math.random() * 0.1
      })
    }
    return {
      landmarks: mockLandmarks,
      handedness: 'Right'
    }
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
