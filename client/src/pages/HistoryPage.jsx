import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  Volume2, 
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  BarChart3,
  RotateCcw
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const HistoryPage = () => {
  const { 
    translations, 
    stats, 
    loading, 
    fetchTranslations, 
    fetchStats, 
    deleteTranslation, 
    clearAllTranslations,
    speakText 
  } = useApp()
  
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchTranslations()
    fetchStats()
  }, [fetchTranslations, fetchStats])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteTranslation(id)
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllTranslations()
      setShowConfirmClear(false)
    } catch (err) {
      console.error('Failed to clear:', err)
    }
  }

  const handleSpeak = (text) => {
    speakText(text)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Lịch Sử Dịch</h1>
          <p className="text-slate-600 mt-1">
            Xem và quản lý các bản dịch trước đó của bạn
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { fetchTranslations(); fetchStats(); }}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          
          {translations.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa tất cả
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="glass rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng bản dịch</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">24 giờ qua</p>
                <p className="text-2xl font-bold text-accent-600">{stats.last24Hours}</p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-600" />
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Cử chỉ phổ biến nhất</p>
                <p className="text-lg font-bold text-slate-800 capitalize truncate">
                  {stats.topGestures?.[0]?.gesture?.replace(/_/g, ' ') || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Số cử chỉ khác nhau</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.topGestures?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Gestures Chart */}
      {stats?.topGestures && stats.topGestures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Cử Chỉ Phổ Biến</h2>
          <div className="space-y-3">
            {stats.topGestures.slice(0, 5).map((item, index) => (
              <div key={item.gesture} className="flex items-center">
                <span className="w-6 text-sm text-slate-400 font-medium">{index + 1}</span>
                <div className="flex-1 mx-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {item.gesture.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-slate-500">{item.count} lần</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / stats.total) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Translation List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 shadow-card"
      >
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Danh Sách Bản Dịch
        </h2>
        
        {translations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Chưa có bản dịch nào</h3>
            <p className="text-slate-500">
              Bắt đầu sử dụng camera để tạo bản dịch đầu tiên của bạn.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {translations.map((translation, index) => (
                <motion.div
                  key={translation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center p-4 bg-white rounded-xl border border-slate-100 hover:border-primary-200 transition-colors group"
                >
                  {/* Gesture Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary-600 capitalize">
                      {translation.gesture.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center">
                      <h4 className="font-medium text-slate-800 capitalize truncate">
                        {translation.gesture.replace(/_/g, ' ')}
                      </h4>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getConfidenceColor(translation.confidence)}`}>
                        {Math.round(translation.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-slate-600 truncate">
                      {translation.vietnameseText}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(translation.timestamp)}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleSpeak(translation.vietnameseText)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Đọc to"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(translation.id)}
                      disabled={deletingId === translation.id}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Xóa"
                    >
                      {deletingId === translation.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Confirm Clear Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">
                Xác nhận xóa tất cả
              </h3>
              <p className="text-slate-600 text-center mb-6">
                Bạn có chắc chắn muốn xóa tất cả {translations.length} bản dịch? Hành động này không thể hoàn tác.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HistoryPage
