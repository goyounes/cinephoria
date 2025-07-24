import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../pages/Auth/AuthProvider'

const ProtectedRoutes = ({ requiredRoleId }) => {
  const location = useLocation()
  
  const {currentUser} = useAuth()

  const isAuthorized = currentUser && currentUser.role_id >= requiredRoleId
  console.log(currentUser,requiredRoleId,isAuthorized)
  return isAuthorized ? <Outlet /> : <Navigate to="/auth/login" replace state={{ from: location }}/>
}

export default ProtectedRoutes