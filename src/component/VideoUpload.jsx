import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../service/firebase';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, DocumentCheckIcon, XMarkIcon, ClockIcon, CubeIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(300); // 5 minutes in seconds
  const [originalFilename, setOriginalFilename] = useState('');
  const [modelFound, setModelFound] = useState(false);
  const [originalVideoUrl, setOriginalVideoUrl] = useState('');
  const [showModelButton, setShowModelButton] = useState(false);
  const [modelUrl, setModelUrl] = useState('');
  const [modelType, setModelType] = useState('');

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
    }
  };

  const handleUpload = () => {
    if (!video) return;

    // Store original filename without extension
    const filename = video.name;
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    setOriginalFilename(nameWithoutExt);

    // Upload with original filename (no timestamp)
    const storageRef = ref(storage, `videos/${filename}`);
    const uploadTask = uploadBytesResumable(storageRef, video);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (error) => {
        console.error("Upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setOriginalVideoUrl(url);
          setDownloadUrl(url);
          setShowModelButton(true);
        });
      }
    );
  };

  const handleViewModel = () => {
    setIsProcessing(true);
    setProcessingTime(300);
    setModelFound(false);
  };

  // Check for model version
  const checkForModelVersion = async () => {
    if (!originalFilename) return;
    
    try {
      console.log("Checking for model version of:", originalFilename);
      const storageRef = ref(storage, 'videos');
      const result = await listAll(storageRef);
      
      console.log("Files in storage:", result.items.map(item => item.name));
      
      // Find the model version - check for both .usdz and .mp4 extensions
      const modelFile = result.items.find(item => {
        const name = item.name;
        const hasModel = name.includes('_model');
        const hasOriginalName = name.includes(originalFilename);
        const isUsdz = name.endsWith('.usdz');
        const isMp4 = name.endsWith('.mp4');
        
        console.log(`File: ${name}, hasModel: ${hasModel}, hasOriginalName: ${hasOriginalName}, isUsdz: ${isUsdz}, isMp4: ${isMp4}`);
        
        return hasModel && hasOriginalName && (isUsdz || isMp4);
      });
      
      if (modelFile) {
        console.log("Model file found:", modelFile.name);
        const modelUrl = await getDownloadURL(modelFile);
        setModelUrl(modelUrl);
        
        // Determine model type based on file extension
        if (modelFile.name.endsWith('.usdz')) {
          setModelType('usdz');
        } else if (modelFile.name.endsWith('.mp4')) {
          setModelType('mp4');
        }
        
        setModelFound(true);
        setIsProcessing(false);
        return true;
      } else {
        console.log("No model file found for:", originalFilename);
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for model:", error);
      return false;
    }
  };

  // Timer effect for processing
  useEffect(() => {
    let timer;
    let checkInterval;
    
    if (isProcessing && processingTime > 0) {
      // Countdown timer
      timer = setInterval(() => {
        setProcessingTime(prev => prev - 1);
      }, 1000);
      
      // Check for model every minute
      checkInterval = setInterval(async () => {
        const found = await checkForModelVersion();
        if (found) {
          clearInterval(timer);
          clearInterval(checkInterval);
        }
      }, 60000); // Check every minute
    }
    
    // Initial check after 5 minutes
    if (isProcessing && processingTime === 0) {
      checkForModelVersion();
    }
    
    return () => {
      clearInterval(timer);
      clearInterval(checkInterval);
    };
  }, [isProcessing, processingTime, originalFilename]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render 3D model based on type
  const renderModel = () => {
    if (modelType === 'usdz') {
      return (
        <div className="aspect-video w-full max-h-[400px] rounded-lg overflow-hidden bg-gray-900 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-4">
            <CubeIcon className="h-16 w-16 text-blue-400 mx-auto mb-2" />
            <h3 className="text-xl font-medium text-white">3D Model Ready</h3>
            <p className="text-gray-400 mt-1">Your video has been converted to a 3D model</p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <a 
              href={modelUrl} 
              download
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download 3D Model</span>
            </a>

            <a 
              href="https://www.usdz-viewer.net/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 text-white py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <EyeIcon className="h-5 w-5" />
              <span>View 3D Model</span>
            </a>
       
            <p className="text-sm text-gray-400">
              This 3D model can be viewed on iOS devices or compatible 3D viewers
            </p>
          </div>
        </div>
      );
    } else if (modelType === 'mp4') {
      return (
        <div className="aspect-video w-full max-h-[400px] rounded-lg overflow-hidden">
          <video 
            className="w-full h-full object-contain bg-gray-900"
            controls
            src={modelUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    return null;
  };

  return (
    <motion.div 
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className={`relative rounded-lg border-2 border-dashed p-12 text-center ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-blue-500" />
            </motion.div>
            
            <div className="text-gray-300">
              <p className="text-lg font-medium">
                {video ? video.name : 'Drag and drop your video here'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to browse files
              </p>
            </div>
          </div>
        </motion.div>

        {video && (
          <motion.div 
            className="mt-6 bg-gray-800 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <DocumentCheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-300">{video.name}</span>
              </div>
              <button
                onClick={() => setVideo(null)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <motion.button
              onClick={handleUpload}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Upload Video
            </motion.button>

            {progress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    className="bg-blue-600 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2 text-right">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}
          </motion.div>
        )}

        {isProcessing && (
          <motion.div 
            className="mt-6 bg-gray-800 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center space-x-3 text-blue-400">
              <ClockIcon className="h-6 w-6 animate-pulse" />
              <span className="text-lg font-medium">Processing 3D Model</span>
            </div>
            <div className="mt-2 text-center">
              <p className="text-gray-400">Estimated time remaining: {formatTime(processingTime)}</p>
              <p className="text-sm text-gray-500 mt-1">We're creating a detailed 3D model from your video</p>
            </div>
            
            <div className="mt-4 flex justify-center">
              <motion.button
                onClick={checkForModelVersion}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Check for Model Now
              </motion.button>
            </div>
          </motion.div>
        )}

        {originalVideoUrl && !isProcessing && (
          <motion.div 
            className="mt-6 bg-gray-800 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="aspect-video w-full max-h-[400px] rounded-lg overflow-hidden">
              <video 
                className="w-full h-full object-contain bg-gray-900"
                controls
                src={originalVideoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            {showModelButton && !modelFound && (
              <motion.button
                onClick={handleViewModel}
                className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CubeIcon className="h-5 w-5" />
                <span>View 3D Model</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {modelFound && (
          <motion.div 
            className="mt-6 bg-gray-800 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-400">
              <p className="font-medium">3D Model Ready!</p>
              <p className="text-sm">Your video has been successfully processed into a 3D model.</p>
            </div>
            
            {renderModel()}
            
            <div className="mt-4 flex justify-center">
              <motion.button
                onClick={() => setModelFound(false)}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Original Video
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoUpload;
