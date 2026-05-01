import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  History, 
  Volume2, 
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { stats, serverStatus, fetchStats, checkHealth } = useApp()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const features = [
    {
      icon: Camera,
      title: 'Dịch Thời Gian Thực',
      description: 'Sử dụng camera để nhận diện ngôn ngữ ký hiệu và dịch sang tiếng Việt ngay lập tức',
      link: '/camera',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Volume2,
      title: 'Đọc Văn Bản',
      description: 'Nghe bản dịch được đọc to bằng tiếng Việt với chất lượng tổng hợp giọng nói cao',
      link: '/camera',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: History,
      title: 'Lịch Sử Dịch',
      description: 'Xem lại và quản lý lịch sử các bản dịch trước đó của bạn',
      link: '/history',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Chào mừng đến với{' '}
          <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Sign2Viet
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Ứng dụng AI giúp dịch ngôn ngữ ký hiệu sang tiếng Việt trong thời gian thực. 
          Kết nối cộng đồng người khiếm thính và người nghe qua công nghệ hiện đại.
        </p>
      </motion.div>

      {/* Server Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 shadow-card"
      >
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary-500" />
          Trạng thái Hệ thống
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <span className="text-slate-600">Backend Server</span>
            <div className="flex items-center">
              {serverStatus.backend ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-600 font-medium">Hoạt động</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-600 font-medium">Ngắt kết nối</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <span className="text-slate-600">AI Service</span>
            <div className="flex items-center">
              {serverStatus.ai ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-600 font-medium">Hoạt động</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-600 font-medium">Ngắt kết nối</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glass rounded-2xl p-6 text-center shadow-card">
            <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
            <div className="text-slate-600 mt-1">Tổng số bản dịch</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center shadow-card">
            <div className="text-3xl font-bold text-accent-600">{stats.last24Hours}</div>
            <div className="text-slate-600 mt-1">Trong 24 giờ qua</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center shadow-card">
            <div className="text-3xl font-bold text-green-600">
              {stats.topGestures?.length || 0}
            </div>
            <div className="text-slate-600 mt-1">Số cử chỉ khác nhau</div>
          </div>
        </motion.div>
      )}

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => (
          <Link
            key={feature.title}
            to={feature.link}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow h-full"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Bắt đầu</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-8 text-center shadow-card"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Sẵn sàng để dịch?
        </h2>
        <p className="text-slate-600 mb-6 max-w-xl mx-auto">
          Truy cập trang Camera để bắt đầu dịch ngôn ngữ ký hiệu sang tiếng Việt trong thời gian thực.
        </p>
        <Link
          to="/camera"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl shadow-glow hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <Camera className="w-5 h-5 mr-2" />
          Mở Camera
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </motion.div>
    </div>
  )
}

export default Dashboard
