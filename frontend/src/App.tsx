import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/Login'
import Profile from './pages/Profile'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/signup' element={<Signup />}></Route>
          <Route path='/login' element={<LoginPage />}></Route>
          <Route path='/dashboard' element={<Dashboard />}></Route>
          <Route path='/profile' element={<Profile />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
