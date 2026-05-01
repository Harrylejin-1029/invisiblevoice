import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Camera, 
  History, 
  Upload, 
  Settings, 
  Home,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'

// Pages
import Dashboard from './pages/Dashboard'
import CameraPage from './pages/CameraPage'
import HistoryPage from './pages/HistoryPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/LoginPage'

// Components
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App component with authentication
function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/camera', label: 'Camera', icon: Camera },
    { path: '/history', label: 'Lịch sử', icon: History },
    { path: '/upload', label: 'Tải lên', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">S2V</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Sign2Viet
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              {/* User Menu */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <User size={18} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">{user?.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut size={18} className="text-slate-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-slate-200"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              {/* Mobile User Menu */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-slate-200 mt-2 pt-2">
                    <div className="flex items-center space-x-3 px-4 py-3">
                      <User size={20} className="text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">{user?.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg w-full"
                    >
                      <LogOut size={20} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/camera" element={
              <ProtectedRoute>
                <CameraPage />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>Sign2Viet - Dịch Ngôn Ngữ Ký Hiệu sang Tiếng Việt</p>
          <p className="mt-1">Powered by AI & Machine Learning</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App
