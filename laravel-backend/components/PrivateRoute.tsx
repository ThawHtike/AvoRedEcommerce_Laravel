import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { isAuth } from "../features/userLogin/userLoginSlice";

export const PrivateRoute = () => {
  // Check both Redux state AND localStorage token for persistence across refreshes
  const auth: boolean = useAppSelector(isAuth);
  const token: string | null = localStorage.getItem("auth_token");

  return auth || !!token ? <Outlet /> : <Navigate to="/login" replace />;
};


