import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

export class HandDetector {
  constructor() {
    this.hands = null
    this.camera = null
    this.isInitialized = false
  }

  async initialize() {
    try {
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

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Error initializing hand detector:', error)
      return false
    }
  }

  async detect(imageElement) {
    if (!this.isInitialized) {
      await this.initialize()
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
