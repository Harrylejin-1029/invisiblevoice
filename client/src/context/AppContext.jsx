import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { aiService } from '../services/AIService.js'
import { db } from '../services/DatabaseService.js'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [translations, setTranslations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverStatus, setServerStatus] = useState({ backend: true, ai: false })
  const [appInitialized, setAppInitialized] = useState(false)

  // Initialize app and check AI service health
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize AI service
        const aiInitialized = await aiService.initialize()
        setServerStatus({ backend: true, ai: aiInitialized })
        
        // Initialize database
        await db.initialize()
        
        // Load initial data
        await fetchTranslations(10)
        await fetchStats()
        
        setAppInitialized(true)
      } catch (error) {
        console.error('Error initializing app:', error)
        setError('Failed to initialize app')
        setAppInitialized(true) // Allow app to continue even with errors
      }
    }

    initializeApp()
  }, [])

  // Fetch translations
  const fetchTranslations = useCallback(async (limit = 50) => {
    setLoading(true)
    setError(null)
    try {
      const translations = await db.getTranslations(limit)
      setTranslations(translations)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching translations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const stats = await db.getTranslationStats()
      setStats(stats)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  // Save translation
  const saveTranslation = useCallback(async (translationData) => {
    try {
      const id = await db.saveTranslation(translationData)
      // Update local state
      const newTranslation = { ...translationData, id, timestamp: new Date() }
      setTranslations(prev => [newTranslation, ...prev])
      return newTranslation
    } catch (err) {
      console.error('Error saving translation:', err)
      throw err
    }
  }, [])

  // Delete translation
  const deleteTranslation = useCallback(async (id) => {
    try {
      await db.deleteTranslation(id)
      setTranslations(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error deleting translation:', err)
      throw err
    }
  }, [])

  // Clear all translations
  const clearAllTranslations = useCallback(async () => {
    try {
      await db.deleteAllTranslations()
      setTranslations([])
    } catch (err) {
      console.error('Error clearing translations:', err)
      throw err
    }
  }, [])

  // Predict gesture from image
  const predictGesture = useCallback(async (imageData, saveToHistory = true) => {
    try {
      const result = await aiService.predictFromBase64(imageData)
      
      // Save to history if requested and gesture is detected
      if (saveToHistory && result.gesture && result.gesture !== 'no_hand' && result.gesture !== 'error') {
        await saveTranslation({
          gesture: result.gesture,
          vietnameseText: result.vietnamese_text,
          confidence: result.confidence,
          imageData: imageData
        })
      }
      
      return { prediction: result }
    } catch (err) {
      console.error('Prediction error:', err)
      throw err
    }
  }, [saveTranslation])

  // Upload training data
  const uploadTrainingData = useCallback(async (file, gesture, vietnameseText) => {
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      const id = await db.saveTrainingData({
        gesture,
        vietnameseText,
        imageData: base64,
        filename: file.name,
        label: vietnameseText
      })
      
      return { id, gesture, vietnameseText, filename: file.name }
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  }, [])

  // Text-to-speech
  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN' // Vietnamese
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1
      
      window.speechSynthesis.speak(utterance)
      return true
    }
    return false
  }, [])

  // Health check function
  const checkHealth = useCallback(async () => {
    try {
      const health = await aiService.healthCheck()
      setServerStatus(prev => ({
        ...prev,
        ai: health.status === 'healthy'
      }))
    } catch (error) {
      console.error('Health check failed:', error)
      setServerStatus(prev => ({
        ...prev,
        ai: false
      }))
    }
  }, [])

  // Check health on mount
  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [checkHealth])

  const value = {
    translations,
    stats,
    loading,
    error,
    serverStatus,
    fetchTranslations,
    fetchStats,
    saveTranslation,
    deleteTranslation,
    clearAllTranslations,
    predictGesture,
    uploadTrainingData,
    speakText,
    checkHealth
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
