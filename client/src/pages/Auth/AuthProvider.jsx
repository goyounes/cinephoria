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
    try {
      const res = await axios.post("/api/auth/login", inputs, {
        withCredentials:true
      }) 
      setCurrentUser(res.data)
      res?.data && localStorage.setItem('user', JSON.stringify(res));
      return res.data
    } catch (error) {
      console.log("login failed")
    }
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setCurrentUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}