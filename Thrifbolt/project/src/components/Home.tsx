// components/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-white min-h-screen flex flex-col justify-center items-center bg-black">
      <h1 className="text-3xl font-bold mb-4">Welcome to ThrifBolt</h1>
      <Link
        to="/rides"
        className="bg-lavender-500 text-white px-6 py-3 rounded-lg hover:bg-lavender-600 transition"
      >
        Compare Rides
      </Link>
    </div>
  );
};

export default Home;
