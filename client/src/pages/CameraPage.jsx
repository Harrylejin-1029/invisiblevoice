import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Volume2, 
  VolumeX, 
  Mic,
  MicOff,
  RefreshCw,
  Play,
  Square,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const CameraPage = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  
  const { predictGesture, speakText, saveTranslation, serverStatus } = useApp()
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)
  const [error, setError] = useState(null)
  const [isAutoTranslate, setIsAutoTranslate] = useState(true)
  const [lastSpokenText, setLastSpokenText] = useState('')
  const [cameraPermission, setCameraPermission] = useState('pending')

  // Request camera access
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setCameraPermission('pending')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsStreaming(true)
          setCameraPermission('granted')
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setCameraPermission('denied')
      setError('Không thể truy cập camera. Vui lòng cấp quyền camera và thử lại.')
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsStreaming(false)
    setIsProcessing(false)
  }, [])

  // Capture frame and send for prediction
  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !serverStatus.ai) {
      return
    }

    try {
      setIsProcessing(true)
      
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas (mirrored)
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      
      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      
      // Send to AI service
      const result = await predictGesture(imageData, true)
      
      if (result && result.prediction) {
        const { gesture, vietnamese_text, confidence } = result.prediction
        
        // Only update if gesture is detected (not no_hand or error)
        if (gesture && gesture !== 'no_hand' && gesture !== 'error') {
          setCurrentResult({
            gesture,
            vietnameseText: vietnamese_text,
            confidence,
            timestamp: new Date()
          })
          
          // Auto speak if enabled and text changed
          if (isAutoTranslate && vietnamese_text && vietnamese_text !== lastSpokenText) {
            speakText(vietnamese_text)
            setLastSpokenText(vietnamese_text)
          }
        }
      }
    } catch (err) {
      console.error('Prediction error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, serverStatus.ai, predictGesture, isAutoTranslate, lastSpokenText, speakText])

  // Start/stop auto detection
  const toggleAutoDetection = useCallback(() => {
    if (isAutoTranslate) {
      // Stop
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsAutoTranslate(false)
    } else {
      // Start
      setIsAutoTranslate(true)
      intervalRef.current = setInterval(captureAndPredict, 2000) // Check every 2 seconds
    }
  }, [isAutoTranslate, captureAndPredict])

  // Manual capture
  const handleManualCapture = async () => {
    await captureAndPredict()
  }

  // Speak current result
  const handleSpeak = () => {
    if (currentResult?.vietnameseText) {
      speakText(currentResult.vietnameseText)
    }
  }

  // Initialize camera on mount
  useEffect(() => {
    startCamera()
    
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  // Start auto detection when streaming begins
  useEffect(() => {
    if (isStreaming && isAutoTranslate && serverStatus.ai) {
      intervalRef.current = setInterval(captureAndPredict, 2000)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isStreaming, isAutoTranslate, serverStatus.ai, captureAndPredict])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dịch Ngôn Ngữ Ký Hiệu</h1>
          <p className="text-slate-600 mt-1">
            Sử dụng camera để nhận diện và dịch ngôn ngữ ký hiệu
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoDetection}
            disabled={!isStreaming}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              isAutoTranslate
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAutoTranslate ? (
              <><Square className="w-4 h-4 mr-2" /> Dừng tự động</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Tự động dịch</>
            )}
          </button>
          
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              isStreaming
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            {isStreaming ? (
              <><Square className="w-4 h-4 mr-2" /> Tắt camera</>
            ) : (
              <><Camera className="w-4 h-4 mr-2" /> Bật camera</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Permission Denied */}
      {cameraPermission === 'denied' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center"
        >
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Cần quyền truy cập camera
          </h3>
          <p className="text-amber-700 mb-4">
            Vui lòng cấp quyền camera trong cài đặt trình duyệt để sử dụng tính năng này.
          </p>
          <button
            onClick={startCamera}
            className="px-6 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
          >
            Thử lại
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 shadow-card"
        >
          <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover camera-mirror"
            />
            
            {/* Hidden Canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay when not streaming */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Camera đang tắt</p>
                  <button
                    onClick={startCamera}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Bật camera
                  </button>
                </div>
              </div>
            )}
            
            {/* Processing Indicator */}
            {isProcessing && (
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
            
            {/* Auto-detect indicator */}
            {isStreaming && isAutoTranslate && (
              <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-2 recording-indicator" />
                <span className="text-white text-sm font-medium">Đang dịch tự động</span>
              </div>
            )}
            
            {/* AI Service Status */}
            {!serverStatus.ai && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-sm text-center">
                  AI Service đang ngắt kết nối. Vui lòng kiểm tra server.
                </p>
              </div>
            )}
          </div>
          
          {/* Manual Capture Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleManualCapture}
              disabled={!isStreaming || isProcessing || !serverStatus.ai}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...</>
              ) : (
                <><Camera className="w-5 h-5 mr-2" /> Dịch ngay</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Translation Result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Current Translation Card */}
          <div className="glass rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Kết quả Dịch</h2>
              {currentResult && (
                <button
                  onClick={handleSpeak}
                  className="p-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
                  title="Đọc to"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {currentResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Detected Gesture */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-500">Cử chỉ nhận diện:</span>
                    <p className="text-lg font-medium text-slate-800 capitalize">
                      {currentResult.gesture.replace(/_/g, ' ')}
                    </p>
                  </div>
                  
                  {/* Vietnamese Translation */}
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                    <span className="text-sm text-primary-600">Tiếng Việt:</span>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {currentResult.vietnameseText}
                    </p>
                  </div>
                  
                  {/* Confidence */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Độ tin cậy:</span>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-slate-200 rounded-full mr-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentResult.confidence * 100}%` }}
                          className={`h-full rounded-full ${
                            currentResult.confidence > 0.8 
                              ? 'bg-green-500' 
                              : currentResult.confidence > 0.6 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {Math.round(currentResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <p className="text-xs text-slate-400 text-right">
                    {currentResult.timestamp.toLocaleTimeString('vi-VN')}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500">
                    {isStreaming 
                      ? 'Chưa có kết quả. Thực hiện cử chỉ để bắt đầu dịch.'
                      : 'Bật camera để bắt đầu dịch.'
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Instructions */}
          <div className="glass rounded-2xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Hướng dẫn</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">1</span>
                <span>Đảm bảo bàn tay của bạn nằm trong khung hình camera</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">2</span>
                <span>Thực hiện cử chỉ rõ ràng và giữ yên trong vài giây</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">3</span>
                <span>Hệ thống sẽ tự động nhận diện và dịch sang tiếng Việt</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">4</span>
                <span>Nhấn nút loa để nghe bản dịch được đọc to</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CameraPage
