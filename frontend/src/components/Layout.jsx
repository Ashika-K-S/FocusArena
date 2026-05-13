import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container"
        style={{ flex: 1 }}
      >
        {children}
      </motion.main>
      
      <footer style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: 'var(--text-muted)', 
        fontSize: '0.875rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: '2rem'
      }}>
        <p>&copy; {new Date().getFullYear()} FocusArena. Elevate your coding focus.</p>
      </footer>
    </div>
  );
};

export default Layout;
