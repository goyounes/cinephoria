import { useState } from 'react'
import { createContext, useContext } from 'react'
import axios from '../../api/axiosInstance.js';

// 1. Create the context
export const AuthContext = createContext()

// 2. Export a hook to access the context
export const useAuth = () => useContext(AuthContext)

// 3. Provider with hardcoded user
export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  )

  const login = async (inputs) => {
    const res = await axios.post("/api/auth/login", inputs, {
      withCredentials:true
    }) 
    setCurrentUser(res.data)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login  }}>
      {children}
    </AuthContext.Provider>
  )
}