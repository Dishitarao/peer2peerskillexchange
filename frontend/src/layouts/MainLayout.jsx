import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { selectAuth, getMe } from '../redux/slices/authSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector(selectAuth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
      dispatch(fetchNotifications({ limit: 10 }));
    }
  }, [dispatch, token]);

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
