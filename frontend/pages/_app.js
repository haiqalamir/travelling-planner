// pages/_app.js
import React, { useEffect } from 'react';
import axios from 'axios';
import 'antd/dist/antd.css';
import '../styles/global.css';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  return <Component {...pageProps} />;
}
