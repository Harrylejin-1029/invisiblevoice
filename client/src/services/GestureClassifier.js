import * as tf from '@tensorflow/tfjs'

export class GestureClassifier {
  constructor() {
    this.model = null
    this.isInitialized = false
    
    // Temporal analysis for gesture tracking
    this.gestureHistory = []
    this.maxHistoryLength = 10
    this.lastGestureTime = 0
    this.gestureStability = {}
    
    // Vietnamese translations for gestures
    this.translations = {
      // Alphabet gestures A-Z
      a: 'A',
      b: 'B', 
      c: 'C',
      d: 'D',
      e: 'E',
      f: 'F',
      g: 'G',
      h: 'H',
      i: 'I',
      j: 'J',
      k: 'K',
      l: 'L',
      m: 'M',
      n: 'N',
      o: 'O',
      p: 'P',
      q: 'Q',
      r: 'R',
      s: 'S',
      t: 'T',
      u: 'U',
      v: 'V',
      w: 'W',
      x: 'X',
      y: 'Y',
      z: 'Z',
      // Simple number gestures
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      // Common gestures
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
      // Alphabet gestures A-Z
      a: this.checkAGesture.bind(this),
      b: this.checkBGesture.bind(this),
      c: this.checkCGesture.bind(this),
      d: this.checkDGesture.bind(this),
      e: this.checkEGesture.bind(this),
      f: this.checkFGesture.bind(this),
      g: this.checkGGesture.bind(this),
      h: this.checkHGesture.bind(this),
      i: this.checkIGesture.bind(this),
      j: this.checkJGesture.bind(this),
      k: this.checkKGesture.bind(this),
      l: this.checkLGesture.bind(this),
      m: this.checkMGesture.bind(this),
      n: this.checkNGesture.bind(this),
      o: this.checkOGesture.bind(this),
      p: this.checkPGesture.bind(this),
      q: this.checkQGesture.bind(this),
      r: this.checkRGesture.bind(this),
      s: this.checkSGesture.bind(this),
      t: this.checkTGesture.bind(this),
      u: this.checkUGesture.bind(this),
      v: this.checkVGesture.bind(this),
      w: this.checkWGesture.bind(this),
      x: this.checkXGesture.bind(this),
      y: this.checkYGesture.bind(this),
      z: this.checkZGesture.bind(this),
      // Number gestures
      one: this.checkOneGesture.bind(this),
      two: this.checkTwoGesture.bind(this),
      three: this.checkThreeGesture.bind(this),
      four: this.checkFourGesture.bind(this),
      five: this.checkFiveGesture.bind(this),
      // Common gestures
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

    if (!landmarks || landmarks.length !== 21) {
      return { gesture: 'error', confidence: 0.0 }
    }

    // Fast early exit for common gestures (optimization)
    const quickCheck = this.quickGestureCheck(landmarks)
    if (quickCheck.confidence > 0.8) {
      this.updateGestureHistory(quickCheck.gesture, quickCheck.confidence)
      return quickCheck
    }

    let bestMatch = { gesture: 'unknown', confidence: 0.0 }
    const gestureScores = {}

    // Check only top 10 most likely gestures first (performance optimization)
    const priorityGestures = ['l', 'v', 'a', 'b', 'one', 'two', 'three', 'four', 'five', 'hello', 'good']
    const otherGestures = Object.keys(this.gesturePatterns).filter(g => !priorityGestures.includes(g))
    
    // Check priority gestures first
    for (const gestureName of priorityGestures) {
      if (!this.gesturePatterns[gestureName]) continue
      
      try {
        const confidence = this.gesturePatterns[gestureName](landmarks)
        gestureScores[gestureName] = confidence
        
        if (confidence > bestMatch.confidence) {
          bestMatch = { gesture: gestureName, confidence }
        }
        
        // Early exit if we found a high confidence match
        if (confidence > 0.7) break
      } catch (error) {
        // Silently continue for performance
      }
    }

    // If no good match found, check other gestures
    if (bestMatch.confidence < 0.5) {
      for (const gestureName of otherGestures) {
        try {
          const confidence = this.gesturePatterns[gestureName](landmarks)
          gestureScores[gestureName] = confidence
          
          if (confidence > bestMatch.confidence) {
            bestMatch = { gesture: gestureName, confidence }
          }
        } catch (error) {
          // Silently continue for performance
        }
      }
    }

    // Apply temporal analysis (optimized)
    const stabilized = this.getStabilizedGesture(bestMatch.gesture, bestMatch.confidence)
    this.updateGestureHistory(stabilized.gesture, stabilized.confidence)

    // Fast confidence calculation
    const velocity = this.calculateGestureVelocity()
    const isStable = this.isGestureStable(stabilized.gesture)
    
    let finalConfidence = stabilized.confidence
    if (isStable) finalConfidence = Math.min(finalConfidence + 0.1, 1.0)
    if (velocity > 0.5) finalConfidence = Math.max(finalConfidence - 0.2, 0.0)

    // Reduced logging for performance
    if (finalConfidence > 0.3) {
      console.log('Detected:', stabilized.gesture, 'confidence:', finalConfidence.toFixed(2))
    }

    return finalConfidence < 0.3 
      ? { gesture: 'unknown', confidence: finalConfidence }
      : { gesture: stabilized.gesture, confidence: finalConfidence }
  }

  // Quick gesture check for common patterns (performance optimization)
  quickGestureCheck(landmarks) {
    const wrist = landmarks[0]
    const fingerTips = [4, 8, 12, 16, 20]
    const fingerBases = [2, 5, 9, 13, 17]
    
    let upCount = 0
    for (let i = 0; i < 5; i++) {
      if (landmarks[fingerTips[i]].y < landmarks[fingerBases[i]].y - 0.02) {
        upCount++
      }
    }

    // Fast L gesture detection
    if (upCount === 2 && landmarks[4].y < landmarks[2].y && landmarks[8].y < landmarks[5].y) {
      return { gesture: 'l', confidence: 0.9 }
    }

    // Fast V gesture detection
    if (upCount === 2 && landmarks[8].y < landmarks[5].y && landmarks[12].y < landmarks[9].y) {
      const spread = Math.abs(landmarks[8].x - landmarks[12].x)
      if (spread > 0.1) {
        return { gesture: 'v', confidence: 0.9 }
      }
    }

    // Fast open hand detection
    if (upCount >= 4) {
      return { gesture: 'hello', confidence: 0.8 }
    }

    // Fast fist detection
    if (upCount <= 1) {
      return { gesture: 'good', confidence: 0.7 }
    }

    return { gesture: 'unknown', confidence: 0.0 }
  }

  getVietnameseText(gesture) {
    return this.translations[gesture] || gesture
  }

  // Optimized gesture feature extraction (faster version)
  extractFeatures(landmarks) {
    if (!landmarks || landmarks.length !== 21) {
      return null
    }

    const features = {}
    const wrist = landmarks[0]

    // 1. Fast finger states (optimized)
    features.fingerStates = {}
    const fingerTips = [4, 8, 12, 16, 20]
    const fingerBases = [2, 5, 9, 13, 17]
    
    for (let i = 0; i < 5; i++) {
      const tip = landmarks[fingerTips[i]]
      const base = landmarks[fingerBases[i]]
      features.fingerStates[`finger${i}`] = (tip.y < base.y - 0.02 && tip.y < wrist.y - 0.01) ? 1 : 0
    }

    // 2. Simple hand orientation (optimized)
    const middleTip = landmarks[12]
    const direction = { x: middleTip.x - wrist.x, y: middleTip.y - wrist.y }
    features.orientation = {
      angle: Math.atan2(direction.y, direction.x) * 180 / Math.PI,
      isPalmUp: direction.y < 0
    }

    // 3. Key finger distances (only essential ones)
    features.fingerDistances = {
      thumbIndex: Math.sqrt(Math.pow(landmarks[4].x - landmarks[8].x, 2) + Math.pow(landmarks[4].y - landmarks[8].y, 2)),
      indexMiddle: Math.sqrt(Math.pow(landmarks[8].x - landmarks[12].x, 2) + Math.pow(landmarks[8].y - landmarks[12].y, 2))
    }

    // 4. Simple hand shape (optimized)
    let minX = wrist.x, maxX = wrist.x
    let minY = wrist.y, maxY = wrist.y
    
    for (const tipIndex of fingerTips) {
      const tip = landmarks[tipIndex]
      minX = Math.min(minX, tip.x)
      maxX = Math.max(maxX, tip.x)
      minY = Math.min(minY, tip.y)
      maxY = Math.max(maxY, tip.y)
    }
    
    features.handShape = {
      width: maxX - minX,
      height: maxY - minY,
      aspectRatio: (maxX - minX) / (maxY - minY)
    }

    return features
  }

  getFingerStates(landmarks) {
    const fingerTips = [4, 8, 12, 16, 20] // thumb, index, middle, ring, pinky
    const fingerBases = [2, 5, 9, 13, 17]
    const wrist = landmarks[0]

    const states = {}
    for (let i = 0; i < 5; i++) {
      const tip = landmarks[fingerTips[i]]
      const base = landmarks[fingerBases[i]]
      
      // Finger is up if tip is higher than base and wrist
      const isUp = tip.y < base.y - 0.02 && tip.y < wrist.y - 0.01
      states[`finger${i}`] = isUp ? 1 : 0
    }

    return states
  }

  getFingerAngles(landmarks) {
    const angles = {}

    // Thumb angle (relative to index)
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    const indexTip = landmarks[8]
    
    const thumbVector = { x: thumbTip.x - thumbBase.x, y: thumbTip.y - thumbBase.y }
    const indexVector = { x: indexTip.x - thumbBase.x, y: indexTip.y - thumbBase.y }
    
    angles.thumbIndex = this.calculateAngle(thumbVector, indexVector)

    // Finger spread angles
    const fingerTips = [8, 12, 16, 20] // index, middle, ring, pinky
    for (let i = 0; i < fingerTips.length - 1; i++) {
      const tip1 = landmarks[fingerTips[i]]
      const tip2 = landmarks[fingerTips[i + 1]]
      const wrist = landmarks[0]
      
      const vector1 = { x: tip1.x - wrist.x, y: tip1.y - wrist.y }
      const vector2 = { x: tip2.x - wrist.x, y: tip2.y - wrist.y }
      
      angles[`spread${i}${i + 1}`] = this.calculateAngle(vector1, vector2)
    }

    return angles
  }

  calculateAngle(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
    
    if (mag1 === 0 || mag2 === 0) return 0
    
    const cosAngle = dot / (mag1 * mag2)
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
  }

  getHandOrientation(landmarks) {
    const wrist = landmarks[0]
    const middleTip = landmarks[12]
    
    // Calculate hand direction vector
    const direction = { x: middleTip.x - wrist.x, y: middleTip.y - wrist.y }
    
    // Calculate rotation angle
    const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI
    
    return {
      angle: angle,
      isPalmUp: direction.y < 0,
      isPalmDown: direction.y > 0,
      isPalmLeft: direction.x < 0,
      isPalmRight: direction.x > 0
    }
  }

  getFingerDistances(landmarks) {
    const distances = {}
    const fingerTips = [4, 8, 12, 16, 20]
    
    // Calculate distances between all finger tips
    for (let i = 0; i < fingerTips.length; i++) {
      for (let j = i + 1; j < fingerTips.length; j++) {
        const tip1 = landmarks[fingerTips[i]]
        const tip2 = landmarks[fingerTips[j]]
        
        const distance = Math.sqrt(
          Math.pow(tip1.x - tip2.x, 2) + 
          Math.pow(tip1.y - tip2.y, 2)
        )
        
        distances[`dist${i}${j}`] = distance
      }
    }

    return distances
  }

  getHandShapeMetrics(landmarks) {
    const wrist = landmarks[0]
    const fingerTips = [4, 8, 12, 16, 20]
    
    // Calculate hand bounding box
    let minX = wrist.x, maxX = wrist.x
    let minY = wrist.y, maxY = wrist.y
    
    for (const tipIndex of fingerTips) {
      const tip = landmarks[tipIndex]
      minX = Math.min(minX, tip.x)
      maxX = Math.max(maxX, tip.x)
      minY = Math.min(minY, tip.y)
      maxY = Math.max(maxY, tip.y)
    }
    
    const width = maxX - minX
    const height = maxY - minY
    const aspectRatio = width / height
    
    // Calculate hand area (simplified)
    let area = 0
    for (let i = 0; i < landmarks.length - 1; i++) {
      const p1 = landmarks[i]
      const p2 = landmarks[i + 1]
      area += (p1.x * p2.y - p2.x * p1.y)
    }
    area = Math.abs(area) / 2
    
    return {
      width,
      height,
      aspectRatio,
      area,
      isCompact: area < 0.1,
      isSpread: area > 0.3
    }
  }

  normalizeLandmarks(landmarks) {
    // Normalize landmarks to be position and scale independent
    const wrist = landmarks[0]
    const middleTip = landmarks[12]
    
    // Calculate scale based on hand size
    const handScale = Math.sqrt(
      Math.pow(middleTip.x - wrist.x, 2) + 
      Math.pow(middleTip.y - wrist.y, 2)
    )
    
    // Normalize all landmarks
    const normalized = landmarks.map(landmark => ({
      x: (landmark.x - wrist.x) / handScale,
      y: (landmark.y - wrist.y) / handScale,
      z: (landmark.z || 0) / handScale
    }))
    
    return normalized
  }

  // Temporal gesture analysis methods
  updateGestureHistory(gesture, confidence, timestamp = Date.now()) {
    // Add new gesture to history
    this.gestureHistory.push({
      gesture,
      confidence,
      timestamp
    })

    // Keep only recent history
    if (this.gestureHistory.length > this.maxHistoryLength) {
      this.gestureHistory.shift()
    }

    // Update gesture stability
    this.updateGestureStability(gesture)

    this.lastGestureTime = timestamp
  }

  updateGestureStability(currentGesture) {
    // Count occurrences of each gesture in recent history
    const gestureCounts = {}
    for (const entry of this.gestureHistory) {
      gestureCounts[entry.gesture] = (gestureCounts[entry.gesture] || 0) + 1
    }

    // Update stability for all gestures
    for (const [gesture, count] of Object.entries(gestureCounts)) {
      this.gestureStability[gesture] = count / this.gestureHistory.length
    }
  }

  getStabilizedGesture(rawGesture, confidence) {
    // Get the most stable gesture from recent history
    let bestGesture = rawGesture
    let bestScore = confidence

    // Check if we have enough history
    if (this.gestureHistory.length >= 3) {
      // Find most frequent gesture in recent history
      const recentGestures = this.gestureHistory.slice(-5)
      const gestureCounts = {}
      
      for (const entry of recentGestures) {
        gestureCounts[entry.gesture] = (gestureCounts[entry.gesture] || 0) + 1
      }

      // Find most frequent gesture
      let maxCount = 0
      let mostFrequent = rawGesture
      
      for (const [gesture, count] of Object.entries(gestureCounts)) {
        if (count > maxCount) {
          maxCount = count
          mostFrequent = gesture
        }
      }

      // If most frequent gesture appears consistently, use it
      if (maxCount >= 3 && this.gestureStability[mostFrequent] > 0.6) {
        bestGesture = mostFrequent
        bestScore = Math.min(confidence + 0.2, 1.0) // Boost confidence
      }
    }

    return { gesture: bestGesture, confidence: bestScore }
  }

  calculateGestureVelocity() {
    if (this.gestureHistory.length < 2) {
      return 0
    }

    const recent = this.gestureHistory[this.gestureHistory.length - 1]
    const previous = this.gestureHistory[this.gestureHistory.length - 2]

    // Simple velocity based on gesture changes
    const gestureChanged = recent.gesture !== previous.gesture
    const timeDiff = recent.timestamp - previous.timestamp

    if (timeDiff === 0) return 0

    return gestureChanged ? 1.0 / timeDiff : 0
  }

  isGestureStable(gesture, minStability = 0.7) {
    return (this.gestureStability[gesture] || 0) >= minStability
  }

  // Enhanced gesture recognition methods
  checkHelloGesture(landmarks) {
    // Open hand with fingers extended - reduced score
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const pinkyTip = landmarks[20]
    
    const wrist = landmarks[0]
    
    // Check if all fingertips are above the wrist (open hand)
    const allFingersUp = 
      thumbTip.y < wrist.y - 0.05 &&
      indexTip.y < wrist.y - 0.05 &&
      middleTip.y < wrist.y - 0.05 &&
      ringTip.y < wrist.y - 0.05 &&
      pinkyTip.y < wrist.y - 0.05
    
    return allFingersUp ? 0.4 : 0.1
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
    // Thumbs up - reduced score to avoid interference with alphabet
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const thumbsUp = thumbTip.y < thumbBase.y - 0.05
    
    return thumbsUp ? 0.3 : 0.1
  }

  checkBadGesture(landmarks) {
    // Thumbs down - reduced score to avoid interference with alphabet
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const thumbsDown = thumbTip.y > thumbBase.y + 0.05
    
    return thumbsDown ? 0.3 : 0.1
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

  // Alphabet gesture recognition methods
  checkAGesture(landmarks) {
    // Fist with thumb up (A in ASL) - more flexible
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const ringTip = landmarks[16]
    const pinkyTip = landmarks[20]
    
    const thumbUp = thumbTip.y < thumbBase.y - 0.02
    const indexDown = indexTip.y > indexBase.y
    const middleDown = middleTip.y > middleBase.y
    const ringDown = ringTip.y > landmarks[13].y
    const pinkyDown = pinkyTip.y > landmarks[17].y
    
    const score = (thumbUp ? 0.3 : 0) + (indexDown ? 0.2 : 0) + (middleDown ? 0.2 : 0) + (ringDown ? 0.2 : 0) + (pinkyDown ? 0.1 : 0)
    return Math.min(score, 1.0)
  }

  checkBGesture(landmarks) {
    // Fingers extended straight up, thumb tucked (B in ASL)
    const fingerTips = [8, 12, 16, 20].map(i => landmarks[i])
    const fingerBases = [5, 9, 13, 17].map(i => landmarks[i])
    const thumbTip = landmarks[4]
    const indexBase = landmarks[5]
    
    let fingersUpScore = 0
    for (let i = 0; i < 4; i++) {
      if (fingerTips[i].y < fingerBases[i].y - 0.03) {
        fingersUpScore += 0.25
      }
    }
    
    const thumbTucked = thumbTip.x > indexBase.x + 0.05
    const thumbScore = thumbTucked ? 0.25 : 0
    
    return Math.min(fingersUpScore + thumbScore, 1.0)
  }

  checkCGesture(landmarks) {
    // C shape with thumb and index (C in ASL) - more flexible
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const wrist = landmarks[0]
    
    const thumbIndexClose = Math.abs(thumbTip.x - indexTip.x) < 0.2
    const thumbIndexVertical = Math.abs(thumbTip.y - indexTip.y) < 0.2
    const bothFromWrist = thumbTip.y > wrist.y - 0.1 && indexTip.y > wrist.y - 0.1
    const middleCurved = middleTip.y > wrist.y
    
    const score = (thumbIndexClose ? 0.3 : 0) + (thumbIndexVertical ? 0.3 : 0) + (bothFromWrist ? 0.2 : 0) + (middleCurved ? 0.2 : 0)
    return Math.min(score, 1.0)
  }

  checkDGesture(landmarks) {
    // Index finger extended, other fingers curled, thumb up (D in ASL) - more flexible
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const ringTip = landmarks[16]
    const ringBase = landmarks[13]
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const indexUp = indexTip.y < indexBase.y - 0.02
    const middleDown = middleTip.y > middleBase.y
    const ringDown = ringTip.y > ringBase.y
    const thumbUp = thumbTip.y < thumbBase.y
    
    const score = (indexUp ? 0.4 : 0) + (middleDown ? 0.2 : 0) + (ringDown ? 0.2 : 0) + (thumbUp ? 0.2 : 0)
    return Math.min(score, 1.0)
  }

  checkEGesture(landmarks) {
    // Fingers curled, thumb across fingers (E in ASL)
    const fingerTips = [8, 12, 16, 20].map(i => landmarks[i])
    const fingerBases = [5, 9, 13, 17].map(i => landmarks[i])
    const thumbTip = landmarks[4]
    const indexBase = landmarks[5]
    
    const allFingersDown = fingerTips.every((tip, i) => tip.y > fingerBases[i].y)
    const thumbAcross = thumbTip.x < indexBase.x
    
    return allFingersDown && thumbAcross ? 0.8 : 0.1
  }

  checkFGesture(landmarks) {
    // Index and thumb touching, other fingers up (F in ASL)
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    
    const thumbIndexTouch = Math.abs(thumbTip.x - indexTip.x) < 0.1 && Math.abs(thumbTip.y - indexTip.y) < 0.1
    const middleUp = middleTip.y < middleBase.y
    
    return thumbIndexTouch && middleUp ? 0.8 : 0.1
  }

  checkGGesture(landmarks) {
    // Fist with index and thumb extended (G in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    
    const indexUp = indexTip.y < indexBase.y
    const thumbUp = thumbTip.y < thumbBase.y
    const middleDown = middleTip.y > middleBase.y
    
    return indexUp && thumbUp && middleDown ? 0.8 : 0.1
  }

  checkHGesture(landmarks) {
    // Index and middle fingers extended, palm facing (H in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const ringTip = landmarks[16]
    const ringBase = landmarks[13]
    
    const indexUp = indexTip.y < indexBase.y
    const middleUp = middleTip.y < middleBase.y
    const ringDown = ringTip.y > ringBase.y
    
    return indexUp && middleUp && ringDown ? 0.8 : 0.1
  }

  checkIGesture(landmarks) {
    // Pinky finger extended (I in ASL)
    const pinkyTip = landmarks[20]
    const pinkyBase = landmarks[17]
    const ringTip = landmarks[16]
    const ringBase = landmarks[13]
    
    const pinkyUp = pinkyTip.y < pinkyBase.y
    const ringDown = ringTip.y > ringBase.y
    
    return pinkyUp && ringDown ? 0.8 : 0.1
  }

  checkJGesture(landmarks) {
    // Pinky extended with hook motion (J in ASL) - simplified as pinky up
    const pinkyTip = landmarks[20]
    const pinkyBase = landmarks[17]
    const wrist = landmarks[0]
    
    const pinkyUp = pinkyTip.y < pinkyBase.y
    const wristPosition = wrist.y > 0.4
    
    return pinkyUp && wristPosition ? 0.7 : 0.1
  }

  checkKGesture(landmarks) {
    // Index and middle up, thumb between (K in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const thumbTip = landmarks[4]
    
    const indexUp = indexTip.y < indexBase.y
    const middleUp = middleTip.y < middleBase.y
    const thumbBetween = thumbTip.x > indexBase.x && thumbTip.x < middleBase.x
    
    return indexUp && middleUp && thumbBetween ? 0.8 : 0.1
  }

  checkLGesture(landmarks) {
    // Enhanced L gesture recognition using advanced features
    const features = this.extractFeatures(landmarks)
    if (!features) return 0.1

    let score = 0

    // 1. Finger states (thumb and index up, others down)
    const { fingerStates } = features
    if (fingerStates.finger0 === 1) score += 0.3  // thumb up
    if (fingerStates.finger1 === 1) score += 0.3  // index up
    if (fingerStates.finger2 === 0) score += 0.2  // middle down
    if (fingerStates.finger3 === 0) score += 0.1  // ring down
    if (fingerStates.finger4 === 0) score += 0.1  // pinky down

    // 2. Thumb-index angle (should be around 90 degrees for L)
    const { fingerAngles } = features
    const thumbIndexAngle = fingerAngles.thumbIndex || 0
    if (thumbIndexAngle > 60 && thumbIndexAngle < 120) {
      score += 0.2
    }

    // 3. Hand orientation (should be palm facing forward)
    const { orientation } = features
    if (orientation.isPalmUp || orientation.isPalmDown) {
      score += 0.1
    }

    // 4. Finger distances (thumb and index should be spread)
    const { fingerDistances } = features
    const thumbIndexDist = fingerDistances.dist01 || 0
    if (thumbIndexDist > 0.15) {
      score += 0.1
    }

    // 5. Hand shape (should be somewhat spread)
    const { handShape } = features
    if (handShape.aspectRatio > 0.8 && handShape.aspectRatio < 2.0) {
      score += 0.1
    }

    return Math.min(score, 1.0)
  }

  checkMGesture(landmarks) {
    // Three fingers down over thumb (M in ASL)
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const thumbTip = landmarks[4]
    
    const fingersDown = indexTip.y > 0.5 && middleTip.y > 0.5 && ringTip.y > 0.5
    const thumbUp = thumbTip.y < 0.4
    
    return fingersDown && thumbUp ? 0.7 : 0.1
  }

  checkNGesture(landmarks) {
    // Two fingers down over thumb (N in ASL)
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const thumbTip = landmarks[4]
    
    const fingersDown = indexTip.y > 0.5 && middleTip.y > 0.5
    const thumbUp = thumbTip.y < 0.4
    
    return fingersDown && thumbUp ? 0.7 : 0.1
  }

  checkOGesture(landmarks) {
    // All fingers and thumb touching to make O (O in ASL)
    const fingerTips = [4, 8, 12, 16, 20].map(i => landmarks[i])
    const thumbBase = landmarks[2]
    
    const allFingersClose = fingerTips.every(tip => 
      Math.abs(tip.x - thumbBase.x) < 0.15 && Math.abs(tip.y - thumbBase.y) < 0.15
    )
    
    return allFingersClose ? 0.8 : 0.1
  }

  checkPGesture(landmarks) {
    // Index down, other fingers up, thumb out (P in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const thumbTip = landmarks[4]
    
    const indexDown = indexTip.y > indexBase.y
    const middleUp = middleTip.y < middleBase.y
    const thumbOut = thumbTip.x < indexBase.x
    
    return indexDown && middleUp && thumbOut ? 0.7 : 0.1
  }

  checkQGesture(landmarks) {
    // Index down, thumb forward (Q in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const indexDown = indexTip.y > indexBase.y
    const thumbForward = thumbTip.x < thumbBase.x
    
    return indexDown && thumbForward ? 0.7 : 0.1
  }

  checkRGesture(landmarks) {
    // Index and middle crossed, thumb up (R in ASL)
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const fingersCrossed = Math.abs(indexTip.x - middleTip.x) < 0.1
    const thumbUp = thumbTip.y < thumbBase.y
    
    return fingersCrossed && thumbUp ? 0.7 : 0.1
  }

  checkSGesture(landmarks) {
    // Fist with thumb over fingers (S in ASL)
    const fingerTips = [8, 12, 16, 20].map(i => landmarks[i])
    const fingerBases = [5, 9, 13, 17].map(i => landmarks[i])
    const thumbTip = landmarks[4]
    const indexBase = landmarks[5]
    
    const allFingersDown = fingerTips.every((tip, i) => tip.y > fingerBases[i].y)
    const thumbOver = thumbTip.y < indexBase.y
    
    return allFingersDown && thumbOver ? 0.8 : 0.1
  }

  checkTGesture(landmarks) {
    // Thumb between index and middle (T in ASL)
    const thumbTip = landmarks[4]
    const indexBase = landmarks[5]
    const middleBase = landmarks[9]
    
    const thumbBetween = thumbTip.x > indexBase.x && thumbTip.x < middleBase.x
    const thumbForward = thumbTip.y < 0.5
    
    return thumbBetween && thumbForward ? 0.7 : 0.1
  }

  checkUGesture(landmarks) {
    // Index and middle up, ring and pinky down (U in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const ringTip = landmarks[16]
    const ringBase = landmarks[13]
    
    const indexUp = indexTip.y < indexBase.y
    const middleUp = middleTip.y < middleBase.y
    const ringDown = ringTip.y > ringBase.y
    
    return indexUp && middleUp && ringDown ? 0.8 : 0.1
  }

  checkVGesture(landmarks) {
    // Enhanced V gesture recognition with advanced features
    const features = this.extractFeatures(landmarks)
    if (!features) return 0.1

    let score = 0

    // 1. Finger states (index and middle up, others down)
    const { fingerStates } = features
    if (fingerStates.finger1 === 1) score += 0.3  // index up
    if (fingerStates.finger2 === 1) score += 0.3  // middle up
    if (fingerStates.finger3 === 0) score += 0.2  // ring down
    if (fingerStates.finger4 === 0) score += 0.1  // pinky down
    if (fingerStates.finger0 === 0) score += 0.1  // thumb down

    // 2. Finger spread angle (index and middle should be spread)
    const { fingerAngles } = features
    const spreadAngle = fingerAngles.spread01 || 0
    if (spreadAngle > 20 && spreadAngle < 60) {
      score += 0.3
    }

    // 3. Finger distances (index and middle should be well separated)
    const { fingerDistances } = features
    const indexMiddleDist = fingerDistances.dist12 || 0
    if (indexMiddleDist > 0.12) {
      score += 0.2
    }

    // 4. Hand orientation (should be palm facing forward)
    const { orientation } = features
    if (orientation.isPalmUp || orientation.isPalmDown) {
      score += 0.1
    }

    // 5. Hand shape (should be spread but not too wide)
    const { handShape } = features
    if (handShape.aspectRatio > 0.6 && handShape.aspectRatio < 1.5) {
      score += 0.1
    }

    return Math.min(score, 1.0)
  }

  checkWGesture(landmarks) {
    // Index, middle, ring up in W shape (W in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const ringTip = landmarks[16]
    const ringBase = landmarks[13]
    const pinkyTip = landmarks[20]
    const pinkyBase = landmarks[17]
    
    const indexUp = indexTip.y < indexBase.y
    const middleUp = middleTip.y < middleBase.y
    const ringUp = ringTip.y < ringBase.y
    const pinkyDown = pinkyTip.y > pinkyBase.y
    
    return indexUp && middleUp && ringUp && pinkyDown ? 0.8 : 0.1
  }

  checkXGesture(landmarks) {
    // Index finger bent, thumb up (X in ASL)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleBase = landmarks[9]
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    
    const indexBent = indexTip.x > middleBase.x
    const thumbUp = thumbTip.y < thumbBase.y
    
    return indexBent && thumbUp ? 0.7 : 0.1
  }

  checkYGesture(landmarks) {
    // Thumb and pinky up, other fingers down (Y in ASL)
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    const pinkyTip = landmarks[20]
    const pinkyBase = landmarks[17]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    
    const thumbUp = thumbTip.y < thumbBase.y
    const pinkyUp = pinkyTip.y < pinkyBase.y
    const middleDown = middleTip.y > middleBase.y
    
    return thumbUp && pinkyUp && middleDown ? 0.8 : 0.1
  }

  checkZGesture(landmarks) {
    // Index finger drawing Z shape (Z in ASL) - simplified as index up
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    
    const indexUp = indexTip.y < indexBase.y
    const middleDown = middleTip.y > middleBase.y
    
    return indexUp && middleDown ? 0.6 : 0.1
  }

  // Number gesture recognition methods
  checkOneGesture(landmarks) {
    // Index finger up (1)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    
    const indexUp = indexTip.y < indexBase.y - 0.02
    const middleDown = middleTip.y > middleBase.y
    
    const score = (indexUp ? 0.6 : 0) + (middleDown ? 0.4 : 0)
    return Math.min(score, 1.0)
  }

  checkTwoGesture(landmarks) {
    // Index and middle fingers up (2)
    const indexTip = landmarks[8]
    const indexBase = landmarks[5]
    const middleTip = landmarks[12]
    const middleBase = landmarks[9]
    const ringTip = landmarks[16]
    const ringBase = landmarks[13]
    
    const indexUp = indexTip.y < indexBase.y - 0.02
    const middleUp = middleTip.y < middleBase.y - 0.02
    const ringDown = ringTip.y > ringBase.y
    
    const score = (indexUp ? 0.4 : 0) + (middleUp ? 0.4 : 0) + (ringDown ? 0.2 : 0)
    return Math.min(score, 1.0)
  }

  checkThreeGesture(landmarks) {
    // Index, middle, ring fingers up (3)
    const fingerTips = [8, 12, 16].map(i => landmarks[i])
    const fingerBases = [5, 9, 13].map(i => landmarks[i])
    const pinkyTip = landmarks[20]
    const pinkyBase = landmarks[17]
    
    let fingersUpScore = 0
    for (let i = 0; i < 3; i++) {
      if (fingerTips[i].y < fingerBases[i].y - 0.02) {
        fingersUpScore += 0.3
      }
    }
    
    const pinkyDown = pinkyTip.y > pinkyBase.y
    
    return Math.min(fingersUpScore + (pinkyDown ? 0.1 : 0), 1.0)
  }

  checkFourGesture(landmarks) {
    // All fingers except thumb up (4)
    const fingerTips = [8, 12, 16, 20].map(i => landmarks[i])
    const fingerBases = [5, 9, 13, 17].map(i => landmarks[i])
    
    let fingersUpScore = 0
    for (let i = 0; i < 4; i++) {
      if (fingerTips[i].y < fingerBases[i].y - 0.02) {
        fingersUpScore += 0.25
      }
    }
    
    return Math.min(fingersUpScore, 1.0)
  }

  checkFiveGesture(landmarks) {
    // All fingers up (5) - open hand
    const fingerTips = [4, 8, 12, 16, 20].map(i => landmarks[i])
    const fingerBases = [2, 5, 9, 13, 17].map(i => landmarks[i])
    
    let fingersUpScore = 0
    for (let i = 0; i < 5; i++) {
      if (fingerTips[i].y < fingerBases[i].y - 0.02) {
        fingersUpScore += 0.2
      }
    }
    
    return Math.min(fingersUpScore, 1.0)
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
