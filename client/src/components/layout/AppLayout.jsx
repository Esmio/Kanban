import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import authUtils from '../../utils/authUtils';
import Loading from '../common/Loading';
import Sidebar from '../common/Sidebar';
import { setUser } from '../../redux/features/userSlice';

const AppLayout = () => {
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authUtils.isAuthenticated();
      if (!user) {
        navigate('/login');
      } else {
        // save user
        dispatch(setUser(user));
        setLoading(false);
      }
    };
    checkAuth();
  }, [dispatch, navigate]);
  return loading ? (
    <Loading fullHeight />
  ) : (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 1, width: 'max-content' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
