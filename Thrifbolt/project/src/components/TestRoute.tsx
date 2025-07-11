import React from 'react';

const TestRoute = () => {
  console.log('TestRoute component is rendering!');
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'red'
    }}>
      Test Route is Working!
    </div>
  );
};

export default TestRoute;
