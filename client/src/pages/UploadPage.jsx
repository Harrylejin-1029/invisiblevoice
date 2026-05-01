import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Video,
  FileText,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const UploadPage = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const fileInputRef = useRef(null)

  // Available gestures for labeling
  const availableGestures = [
    { value: 'hello', label: 'Xin chào', vietnamese: 'Xin chào' },
    { value: 'thank_you', label: 'Cảm ơn', vietnamese: 'Cảm ơn' },
    { value: 'goodbye', label: 'Tạm biệt', vietnamese: 'Tạm biệt' },
    { value: 'yes', label: 'Có / Đồng ý', vietnamese: 'Có' },
    { value: 'no', label: 'Không', vietnamese: 'Không' },
    { value: 'please', label: 'Làm ơn', vietnamese: 'Làm ơn' },
    { value: 'sorry', label: 'Xin lỗi', vietnamese: 'Xin lỗi' },
    { value: 'love', label: 'Yêu thương', vietnamese: 'Yêu' },
    { value: 'help', label: 'Giúp đỡ', vietnamese: 'Giúp tôi' },
    { value: 'eat', label: 'Ăn', vietnamese: 'Ăn' },
    { value: 'drink', label: 'Uống', vietnamese: 'Uống' },
    { value: 'water', label: 'Nước', vietnamese: 'Nước' },
    { value: 'food', label: 'Thức ăn', vietnamese: 'Thức ăn' },
    { value: 'home', label: 'Nhà', vietnamese: 'Nhà' },
    { value: 'family', label: 'Gia đình', vietnamese: 'Gia đình' },
    { value: 'friend', label: 'Bạn bè', vietnamese: 'Bạn' },
    { value: 'good', label: 'Tốt', vietnamese: 'Tốt' },
    { value: 'bad', label: 'Xấu', vietnamese: 'Xấu' },
    { value: 'happy', label: 'Vui vẻ', vietnamese: 'Vui' },
    { value: 'sad', label: 'Buồn', vietnamese: 'Buồn' },
    { value: 'i', label: 'Tôi', vietnamese: 'Tôi' },
    { value: 'you', label: 'Bạn', vietnamese: 'Bạn' },
    { value: 'what', label: 'Gì / Cái gì', vietnamese: 'Cái gì' },
    { value: 'where', label: 'Ở đâu', vietnamese: 'Ở đâu' },
    { value: 'when', label: 'Khi nào', vietnamese: 'Khi nào' },
    { value: 'why', label: 'Tại sao', vietnamese: 'Tại sao' },
    { value: 'how', label: 'Như thế nào', vietnamese: 'Như thế nào' },
    { value: 'name', label: 'Tên', vietnamese: 'Tên' },
  ]

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      return isImage || isVideo
    })

    const newFiles = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      gesture: '',
      vietnameseText: '',
      status: 'pending', // pending, uploading, success, error
      error: null
    }))

    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      return isImage || isVideo
    })

    const newFiles = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      gesture: '',
      vietnameseText: '',
      status: 'pending',
      error: null
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = (id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const updateFileLabel = (id, field, value) => {
    setFiles(prev => prev.map(file => {
      if (file.id === id) {
        const updates = { [field]: value }
        if (field === 'gesture') {
          const gesture = availableGestures.find(g => g.value === value)
          if (gesture) {
            updates.vietnameseText = gesture.vietnamese
          }
        }
        return { ...file, ...updates }
      }
      return file
    }))
  }

  const { uploadTrainingData } = useApp()

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.gesture && f.status === 'pending')
    if (validFiles.length === 0) return

    setUploading(true)
    setCurrentFileIndex(0)
    setUploadResults([])

    for (let i = 0; i < validFiles.length; i++) {
      const fileData = validFiles[i]
      setCurrentFileIndex(i)

      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'uploading' } : f
      ))

      try {
        const result = await uploadTrainingData(
          fileData.file,
          fileData.gesture,
          fileData.vietnameseText
        )

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'success' } : f
        ))

        setUploadResults(prev => [...prev, { 
          id: fileData.id, 
          success: true, 
          filename: fileData.file.name 
        }])
      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f
        ))

        setUploadResults(prev => [...prev, { 
          id: fileData.id, 
          success: false, 
          filename: fileData.file.name,
          error: error.message 
        }])
      }
    }

    setUploading(false)
  }

  const clearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
    setUploadResults([])
  }

  const pendingCount = files.filter(f => f.status === 'pending' && f.gesture).length
  const successCount = files.filter(f => f.status === 'success').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tải Dữ Liệu Huấn Luyện</h1>
          <p className="text-slate-600 mt-1">
            Tải lên hình ảnh hoặc video để mở rộng bộ dữ liệu huấn luyện
          </p>
        </div>
        
        {files.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa tất cả
          </button>
        )}
      </motion.div>

      {/* Upload Status Summary */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3"
        >
          <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
            <span className="font-medium">{files.length}</span> file đã chọn
          </div>
          {pendingCount > 0 && (
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
              <span className="font-medium">{pendingCount}</span> chờ tải lên
            </div>
          )}
          {successCount > 0 && (
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
              <span className="font-medium">{successCount}</span> thành công
            </div>
          )}
          {errorCount > 0 && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              <span className="font-medium">{errorCount}</span> lỗi
            </div>
          )}
        </motion.div>
      )}

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={`glass rounded-2xl p-8 border-2 border-dashed cursor-pointer transition-all ${
          files.length > 0 ? 'border-slate-300' : 'border-primary-300 hover:border-primary-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Kéo thả hoặc click để chọn file
          </h3>
          <p className="text-slate-500 text-sm mb-2">
            Hỗ trợ hình ảnh (JPG, PNG, GIF) và video (MP4, WebM)
          </p>
          <p className="text-slate-400 text-xs">
            Tối đa 50MB mỗi file
          </p>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-slate-800">Danh sách file</h3>
            
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`glass rounded-xl p-4 ${
                  file.status === 'success' ? 'border-green-200' : 
                  file.status === 'error' ? 'border-red-200' : 
                  file.status === 'uploading' ? 'border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {file.file.type.startsWith('video/') ? (
                          <Video className="w-8 h-8 text-slate-400" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* File Info & Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-800 truncate">
                        {file.file.name}
                      </p>
                      <button
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading'}
                        className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Status Badge */}
                    {file.status === 'success' && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Thành công
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {file.error || 'Lỗi'}
                      </span>
                    )}
                    {file.status === 'uploading' && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Đang tải...
                      </span>
                    )}

                    {/* Label Selection */}
                    {file.status !== 'success' && file.status !== 'uploading' && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Cử chỉ *
                          </label>
                          <select
                            value={file.gesture}
                            onChange={(e) => updateFileLabel(file.id, 'gesture', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Chọn cử chỉ...</option>
                            {availableGestures.map(gesture => (
                              <option key={gesture.value} value={gesture.value}>
                                {gesture.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Tiếng Việt
                          </label>
                          <input
                            type="text"
                            value={file.vietnameseText}
                            onChange={(e) => updateFileLabel(file.id, 'vietnameseText', e.target.value)}
                            placeholder="Nhập nghĩa tiếng Việt"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-slate-700">
              Đang tải lên... ({currentFileIndex + 1}/{pendingCount})
            </span>
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentFileIndex + 1) / pendingCount) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
            />
          </div>
        </motion.div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={handleUpload}
            disabled={uploading || pendingCount === 0}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl shadow-glow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {uploading ? (
              <span className="flex items-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang tải lên...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Tải lên {pendingCount} file
              </span>
            )}
          </button>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Hướng dẫn tải lên</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">1</div>
            <span>Chọn hình ảnh hoặc video rõ nét, có độ phân giải tốt</span>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">2</div>
            <span>Đảm bảo bàn tay nằm trong khung hình và dễ nhìn</span>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">3</div>
            <span>Gán nhãn cử chỉ chính xác cho mỗi file</span>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">4</div>
            <span>Dữ liệu sẽ được sử dụng để cải thiện mô hình AI</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadPage
