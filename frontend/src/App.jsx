import React, { useEffect } from 'react'
import NavBar from './components/NavBar'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import { useAuthStore } from './store/useAuthStore'

import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'
import { useChatStore } from './store/useChatStore'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth,onlineUsers } = useAuthStore();
  const { getUsers, subscribeToMessages } = useChatStore();
  const { theme } = useThemeStore()
  // console.log("getonline users",onlineUsers)
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
  if (authUser) {
    useChatStore.getState().getUsers();
    useChatStore.getState().subscribeToMessages();

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }
}, [authUser]);

  // console.log("Auth User:", authUser);

  if (isCheckingAuth && !authUser) return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className='size-10 animate-spin' />
    </div>
  );

  return (
    <div data-theme={theme}>

      <NavBar />
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div >
  )
}

export default App
