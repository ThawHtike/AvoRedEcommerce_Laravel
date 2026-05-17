import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks';
import { performUserLogout } from '../../features/userLogin/userLoginSlice';

export const UserLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(performUserLogout()); // ← no argument, was: performUserLogout(true)
    navigate("/login");
  }, []);

  return <p>Logging out…</p>;
};