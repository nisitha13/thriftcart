import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DirectTest: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('DirectTest component mounted');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#4CAF50',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      zIndex: 9999
    }}>
      <h1>Direct Test Component</h1>
      <p>If you can see this, the routing is working!</p>
      <button 
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '18px',
          backgroundColor: 'white',
          color: '#4CAF50',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go to Home
      </button>
    </div>
  );
};

export default DirectTest;
