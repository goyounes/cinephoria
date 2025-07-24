import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'

const ProtectedRoutes = ({ requiredRoleId }) => {
  const location = useLocation()

  const user = {username:"tim", role_id:1}

  const isAuthorized = user && user.role_id >= requiredRoleId
  console.log(user,requiredRoleId,isAuthorized)
  return isAuthorized ? <Outlet /> : <Navigate to="/auth/login" replace state={{ from: location }}/>
}

export default ProtectedRoutes