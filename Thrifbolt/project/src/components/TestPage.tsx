import React, { useEffect } from 'react';

const TestPage: React.FC = () => {
  useEffect(() => {
    console.log('TestPage component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Test Page</h1>
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border-l-4 border-green-500">
            <p className="text-green-700">If you can see this, the test page is working!</p>
          </div>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500">
            <p className="text-yellow-700">Check the browser console for the mount log message.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
