import Dexie from 'dexie'

export class DatabaseService extends Dexie {
  constructor() {
    super('Sign2VietDB')
    
    // Define schema
    this.version(1).stores({
      translations: '++id, gesture, vietnameseText, confidence, timestamp, imageData',
      trainingData: '++id, gesture, imageData, label, timestamp, filename',
      settings: 'key, value'
    })

    // Create typed collections
    this.translations = this.table('translations')
    this.trainingData = this.table('trainingData')
    this.settings = this.table('settings')
  }

  async initialize() {
    try {
      // Open database connection
      await this.open()
      console.log('Database initialized successfully')
      return true
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
    }
  }

  // Translation methods
  async saveTranslation(translationData) {
    try {
      const id = await this.translations.add({
        ...translationData,
        timestamp: new Date()
      })
      return id
    } catch (error) {
      console.error('Error saving translation:', error)
      throw error
    }
  }

  async getTranslations(limit = 50, offset = 0) {
    try {
      return await this.translations
        .orderBy('timestamp')
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Error getting translations:', error)
      throw error
    }
  }

  async getTranslationById(id) {
    try {
      return await this.translations.get(id)
    } catch (error) {
      console.error('Error getting translation:', error)
      throw error
    }
  }

  async deleteTranslation(id) {
    try {
      return await this.translations.delete(id)
    } catch (error) {
      console.error('Error deleting translation:', error)
      throw error
    }
  }

  async deleteAllTranslations() {
    try {
      return await this.translations.clear()
    } catch (error) {
      console.error('Error deleting all translations:', error)
      throw error
    }
  }

  async getTranslationStats() {
    try {
      const translations = await this.translations.toArray()
      const gestureCounts = {}
      
      translations.forEach(translation => {
        const gesture = translation.gesture || 'unknown'
        gestureCounts[gesture] = (gestureCounts[gesture] || 0) + 1
      })

      // Convert to array format for charts
      const topGestures = Object.entries(gestureCounts)
        .map(([gesture, count]) => ({ gesture, count }))
        .sort((a, b) => b.count - a.count)

      // Calculate last 24 hours
      const now = new Date()
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last24HoursCount = translations.filter(
        t => new Date(t.timestamp) > last24Hours
      ).length

      return {
        total: translations.length,
        last24Hours: last24HoursCount,
        gestureCounts,
        topGestures,
        lastTranslation: translations[0]?.timestamp || null
      }
    } catch (error) {
      console.error('Error getting translation stats:', error)
      throw error
    }
  }

  // Training data methods
  async saveTrainingData(trainingData) {
    try {
      const id = await this.trainingData.add({
        ...trainingData,
        timestamp: new Date()
      })
      return id
    } catch (error) {
      console.error('Error saving training data:', error)
      throw error
    }
  }

  async getTrainingData(gesture = null, limit = 50, offset = 0) {
    try {
      let query = this.trainingData.orderBy('timestamp').reverse()
      
      if (gesture) {
        query = query.filter(item => item.gesture === gesture)
      }
      
      return await query.offset(offset).limit(limit).toArray()
    } catch (error) {
      console.error('Error getting training data:', error)
      throw error
    }
  }

  async getTrainingDataById(id) {
    try {
      return await this.trainingData.get(id)
    } catch (error) {
      console.error('Error getting training data:', error)
      throw error
    }
  }

  async deleteTrainingData(id) {
    try {
      return await this.trainingData.delete(id)
    } catch (error) {
      console.error('Error deleting training data:', error)
      throw error
    }
  }

  async deleteAllTrainingData() {
    try {
      return await this.trainingData.clear()
    } catch (error) {
      console.error('Error deleting all training data:', error)
      throw error
    }
  }

  async getTrainingDataStats() {
    try {
      const trainingData = await this.trainingData.toArray()
      const gestureCounts = {}
      
      trainingData.forEach(data => {
        const gesture = data.gesture || 'unknown'
        gestureCounts[gesture] = (gestureCounts[gesture] || 0) + 1
      })

      return {
        total: trainingData.length,
        gestureCounts,
        lastUpload: trainingData[0]?.timestamp || null
      }
    } catch (error) {
      console.error('Error getting training data stats:', error)
      throw error
    }
  }

  // Settings methods
  async saveSetting(key, value) {
    try {
      await this.settings.put({ key, value })
    } catch (error) {
      console.error('Error saving setting:', error)
      throw error
    }
  }

  async getSetting(key, defaultValue = null) {
    try {
      const setting = await this.settings.get(key)
      return setting ? setting.value : defaultValue
    } catch (error) {
      console.error('Error getting setting:', error)
      return defaultValue
    }
  }

  async getAllSettings() {
    try {
      const settings = await this.settings.toArray()
      const settingsObj = {}
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })
      return settingsObj
    } catch (error) {
      console.error('Error getting all settings:', error)
      throw error
    }
  }

  async deleteSetting(key) {
    try {
      return await this.settings.delete(key)
    } catch (error) {
      console.error('Error deleting setting:', error)
      throw error
    }
  }

  // Export/Import methods
  async exportData() {
    try {
      const translations = await this.translations.toArray()
      const trainingData = await this.trainingData.toArray()
      const settings = await this.getAllSettings()

      return {
        translations,
        trainingData,
        settings,
        exportDate: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      throw error
    }
  }

  async importData(data) {
    try {
      if (data.translations && Array.isArray(data.translations)) {
        await this.translations.bulkAdd(data.translations)
      }

      if (data.trainingData && Array.isArray(data.trainingData)) {
        await this.trainingData.bulkAdd(data.trainingData)
      }

      if (data.settings && typeof data.settings === 'object') {
        for (const [key, value] of Object.entries(data.settings)) {
          await this.saveSetting(key, value)
        }
      }

      return true
    } catch (error) {
      console.error('Error importing data:', error)
      throw error
    }
  }

  // Cleanup methods
  async cleanupOldData(daysToKeep = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const deletedTranslations = await this.translations
        .where('timestamp')
        .below(cutoffDate)
        .delete()

      const deletedTrainingData = await this.trainingData
        .where('timestamp')
        .below(cutoffDate)
        .delete()

      return {
        deletedTranslations,
        deletedTrainingData
      }
    } catch (error) {
      console.error('Error cleaning up old data:', error)
      throw error
    }
  }

  // Database info
  async getDatabaseInfo() {
    try {
      const translationCount = await this.translations.count()
      const trainingDataCount = await this.trainingData.count()
      const settingCount = await this.settings.count()

      return {
        translationCount,
        trainingDataCount,
        settingCount,
        version: this.verno
      }
    } catch (error) {
      console.error('Error getting database info:', error)
      throw error
    }
  }
}

// Create singleton instance
export const db = new DatabaseService()
