# Land Shape 360°

A 3D Photogrammetry & Machine Learning Platform that transforms videos into 3D models.

## Project Overview

Land Shape 360° is a web application that allows users to upload videos, which are then processed using photogrammetry techniques to generate 3D models. The application provides a simple interface for uploading videos and viewing or downloading the resulting 3D models.

## Tech Stack

- **Frontend**: React 19.0.0
- **UI Framework**: Tailwind CSS 4.1.4
- **Animations**: Framer Motion 12.7.3
- **Build Tool**: Vite 6.3.0
- **Cloud Storage**: Firebase Storage
- **Icons**: Heroicons 2.2.0

## Features

- Drag and drop video upload
- Real-time upload progress tracking
- 3D model processing with progress monitoring
- Support for two model formats:
  - USDZ models (for iOS and compatible 3D viewers)
  - MP4 video reconstructions
- Model download and viewing options

## Getting Started

### Prerequisites

- Node.js (latest version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file with your Firebase configuration:
```
VITE_YOUR_API_KEY=your-api-key
VITE_YOUR_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_YOUR_PROJECT_ID=your-project-id
VITE_YOUR_BUCKET=your-project.firebasestorage.app
VITE_YOUR_MESSAGING_ID=your-messaging-id
VITE_YOUR_APP_ID=your-app-id
VITE_YOUR_MEASUREMENT_ID=your-measurement-id
```

### Development

Run the development server:
```
npm run dev
```

### Build

Create a production build:
```
npm run build
```

### Preview

Preview the production build:
```
npm run preview
```

## Deployment

The project is configured for Firebase Hosting deployment:

1. Build the project:
```
npm run build
```

2. Deploy to Firebase:
```
firebase deploy
```

## Firebase Configuration

The project uses Firebase Storage for storing videos and generated 3D models. The storage rules are configured to allow read and write access to all paths.

## Project Structure

- `src/`
  - `App.jsx` - Main application component
  - `component/` - React components
    - `VideoUpload.jsx` - Video upload and processing component
  - `service/` - Firebase configuration
    - `firebase.js` - Firebase initialization
  - `main.jsx` - Application entry point
  - `index.css` - Global styles with Tailwind CSS

## How It Works

1. Users upload a video through the interface
2. The video is stored in Firebase Storage
3. The system processes the video to create a 3D model (USDZ or MP4 format)
4. Users can check the status of processing and view/download the model when ready

## File Naming Convention

The system expects 3D model files to be named with the original video filename plus a "_model" suffix, with either ".usdz" or ".mp4" extension.