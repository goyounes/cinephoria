import { createContext, useContext } from 'react'

// 1. Create the context
const AuthContext = createContext()

// 2. Export a hook to access the context
export const useAuth = () => useContext(AuthContext)

// 3. Provider with hardcoded user
export const AuthProvider = ({ children }) => {
  const user = {
    username: 'tim',
    role_id: 1,
    email: 'tim@for whatever reason i"m writing this',
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}