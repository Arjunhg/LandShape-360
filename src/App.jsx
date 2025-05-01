import React from 'react';
import VideoUpload from './component/VideoUpload';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-white mb-2">Land Shape 360°</h1>
        <p className="text-gray-400 text-center mb-8">3D Photogrammetry & Machine Learning Platform</p>
        <VideoUpload />
      </div>
    </div>
  );
}

export default App;
