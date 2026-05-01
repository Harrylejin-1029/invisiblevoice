import * as tf from '@tensorflow/tfjs'

export class GestureClassifier {
  constructor() {
    this.model = null
    this.isInitialized = false
    
    // Vietnamese translations for gestures
    this.translations = {
      hello: 'Xin chào',
      thank_you: 'Cảm ơn',
      goodbye: 'Tạm biệt',
      yes: 'Có',
      no: 'Không',
      please: 'Làm ơn',
      sorry: 'Xin lỗi',
      love: 'Yêu thương',
      help: 'Giúp đỡ',
      eat: 'Ăn',
      drink: 'Uống',
      water: 'Nước',
      food: 'Thức ăn',
      home: 'Nhà',
      family: 'Gia đình',
      friend: 'Bạn bè',
      good: 'Tốt',
      bad: 'Xấu',
      happy: 'Vui vẻ',
      sad: 'Buồn'
    }

    // Simple gesture patterns based on hand landmarks
    this.gesturePatterns = {
      hello: this.checkHelloGesture.bind(this),
      thank_you: this.checkThankYouGesture.bind(this),
      goodbye: this.checkGoodbyeGesture.bind(this),
      yes: this.checkYesGesture.bind(this),
      no: this.checkNoGesture.bind(this),
      please: this.checkPleaseGesture.bind(this),
      sorry: this.checkSorryGesture.bind(this),
      love: this.checkLoveGesture.bind(this),
      help: this.checkHelpGesture.bind(this),
      eat: this.checkEatGesture.bind(this),
      drink: this.checkDrinkGesture.bind(this),
      water: this.checkWaterGesture.bind(this),
      food: this.checkFoodGesture.bind(this),
      home: this.checkHomeGesture.bind(this),
      family: this.checkFamilyGesture.bind(this),
      friend: this.checkFriendGesture.bind(this),
      good: this.checkGoodGesture.bind(this),
      bad: this.checkBadGesture.bind(this),
      happy: this.checkHappyGesture.bind(this),
      sad: this.checkSadGesture.bind(this)
    }
  }

  async initialize() {
    try {
      // Initialize TensorFlow.js backend
      await tf.ready()
      
      // For now, we'll use rule-based classification
      // In a production environment, you would load a trained model here
      // this.model = await tf.loadLayersModel('models/gesture-model/model.json')
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Error initializing gesture classifier:', error)
      return false
    }
  }

  async classify(landmarks) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!landmarks || landmarks.length === 0) {
      return { gesture: 'no_hand', confidence: 0.0 }
    }

    let bestMatch = { gesture: 'unknown', confidence: 0.0 }

    // Check each gesture pattern
    for (const [gestureName, checkFunction] of Object.entries(this.gesturePatterns)) {
      const confidence = checkFunction(landmarks)
      if (confidence > bestMatch.confidence) {
        bestMatch = { gesture: gestureName, confidence }
      }
    }

    return bestMatch
  }

  getVietnameseText(gesture) {
    return this.translations[gesture] || gesture
  }

  // Gesture recognition methods
  checkHelloGesture(landmarks) {
    // Open hand with fingers extended
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const pinkyTip = landmarks[20]
    
    const wrist = landmarks[0]
    
    // Check if all fingertips are above the wrist (open hand)
    const allFingersUp = 
      thumbTip.y < wrist.y &&
      indexTip.y < wrist.y &&
      middleTip.y < wrist.y &&
      ringTip.y < wrist.y &&
      pinkyTip.y < wrist.y
    
    return allFingersUp ? 0.8 : 0.1
  }

  checkThankYouGesture(landmarks) {
    // Hand moving towards chest (simplified check)
    const wrist = landmarks[0]
    const middleTip = landmarks[12]
    
    // Check if hand is in a position that could represent "thank you"
    const handNearChest = wrist.y > 0.6 && middleTip.y > 0.5
    
    return handNearChest ? 0.7 : 0.1
  }

  checkGoodbyeGesture(landmarks) {
    // Waving motion would be detected over multiple frames
    // For single frame, check for open hand
    return this.checkHelloGesture(landmarks) * 0.6
  }

  checkYesGesture(landmarks) {
    // Fist or closed hand
    const fingerTips = [4, 8, 12, 16, 20].map(i => landmarks[i])
    const fingerBases = [2, 5, 9, 13, 17].map(i => landmarks[i])
    
    let closedFingers = 0
    for (let i = 0; i < 5; i++) {
      if (fingerTips[i].y > fingerBases[i].y) {
        closedFingers++
      }
    }
    
    return closedFingers >= 4 ? 0.8 : 0.1
  }

  checkNoGesture(landmarks) {
    // Index finger extended horizontally
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    
    const indexExtended = indexTip.y < indexBase.y
    const middleDown = middleTip.y > indexBase.y
    
    return indexExtended && middleDown ? 0.7 : 0.1
  }

  checkPleaseGesture(landmarks) {
    // Flat hand, palm up
    const wrist = landmarks[0]
    const fingerTips = [8, 12, 16, 20].map(i => landmarks[i])
    
    const flatHand = fingerTips.every(tip => Math.abs(tip.y - wrist.y) < 0.1)
    
    return flatHand ? 0.7 : 0.1
  }

  checkSorryGesture(landmarks) {
    // Hand on chest area
    const wrist = landmarks[0]
    const handOnChest = wrist.y > 0.5
    
    return handOnChest ? 0.6 : 0.1
  }

  checkLoveGesture(landmarks) {
    // Heart shape with hands (simplified - check for thumb and index touching)
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    )
    
    return distance < 0.1 ? 0.8 : 0.1
  }

  checkHelpGesture(landmarks) {
    // Open hand raised
    const wrist = landmarks[0]
    const middleTip = landmarks[12]
    
    const handRaised = wrist.y < 0.4 && middleTip.y < wrist.y
    
    return handRaised ? 0.7 : 0.1
  }

  checkEatGesture(landmarks) {
    // Fingers near mouth area
    const indexTip = landmarks[8]
    const mouthY = 0.3 // Approximate mouth position
    
    const fingersNearMouth = Math.abs(indexTip.y - mouthY) < 0.15
    
    return fingersNearMouth ? 0.7 : 0.1
  }

  checkDrinkGesture(landmarks) {
    // Fist near mouth (like holding a cup)
    const wrist = landmarks[0]
    const mouthY = 0.3
    
    const fistNearMouth = Math.abs(wrist.y - mouthY) < 0.15
    
    return fistNearMouth ? 0.7 : 0.1
  }

  checkWaterGesture(landmarks) {
    // Similar to drink but with different hand shape
    return this.checkDrinkGesture(landmarks) * 0.8
  }

  checkFoodGesture(landmarks) {
    // Similar to eat but with different finger configuration
    return this.checkEatGesture(landmarks) * 0.8
  }

  checkHomeGesture(landmarks) {
    // Hands making roof shape (simplified)
    const wrist = landmarks[0]
    const middleTip = landmarks[12]
    
    const roofShape = wrist.y < 0.5 && middleTip.y > wrist.y
    
    return roofShape ? 0.6 : 0.1
  }

  checkFamilyGesture(landmarks) {
    // Multiple fingers up
    const fingerTips = [8, 12, 16, 20].map(i => landmarks[i])
    const fingerBases = [5, 9, 13, 17].map(i => landmarks[i])
    
    let fingersUp = 0
    for (let i = 0; i < 4; i++) {
      if (fingerTips[i].y < fingerBases[i].y) {
        fingersUp++
      }
    }
    
    return fingersUp >= 3 ? 0.7 : 0.1
  }

  checkFriendGesture(landmarks) {
    // Two fingers up (peace sign)
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const indexBase = landmarks[5]
    const middleBase = landmarks[9]
    
    const twoFingersUp = 
      indexTip.y < indexBase.y && 
      middleTip.y < middleBase.y
    
    return twoFingersUp ? 0.8 : 0.1
  }

  checkGoodGesture(landmarks) {
    // Thumbs up
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const thumbsUp = thumbTip.y < thumbBase.y
    
    return thumbsUp ? 0.9 : 0.1
  }

  checkBadGesture(landmarks) {
    // Thumbs down
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const thumbsDown = thumbTip.y > thumbBase.y
    
    return thumbsDown ? 0.9 : 0.1
  }

  checkHappyGesture(landmarks) {
    // Open hand with movement (simplified)
    return this.checkHelloGesture(landmarks) * 0.7
  }

  checkSadGesture(landmarks) {
    // Hand down, fingers curled
    const wrist = landmarks[0]
    const middleTip = landmarks[12]
    
    const handDown = wrist.y > 0.6 && middleTip.y > wrist.y
    
    return handDown ? 0.7 : 0.1
  }

  isReady() {
    return this.isInitialized
  }

  dispose() {
    if (this.model) {
      this.model.dispose()
    }
  }
}
