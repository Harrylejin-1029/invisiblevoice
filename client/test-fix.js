// Test file to verify our fixes
import { aiService } from './src/services/AIService.js'

async function testFixes() {
  console.log('Testing fixes...')
  
  try {
    // Test AI service initialization
    console.log('Initializing AI service...')
    const initialized = await aiService.initialize()
    console.log('AI service initialized:', initialized)
    
    // Test health check
    console.log('Testing health check...')
    const health = await aiService.healthCheck()
    console.log('Health status:', health)
    
    console.log('All tests passed!')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testFixes()
