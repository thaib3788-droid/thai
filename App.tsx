
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import { analyzeVideo } from './services/geminiService';
import { useVideoProcessor } from './hooks/useVideoProcessor';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Describe the key events in this video in detail, including scene changes, text on screen, and the overall mood.');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { extractFrames } = useVideoProcessor();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoSrc(url);
        setError(null);
        setAnalysisResult('');
      } else {
        setError('Please select a valid video file.');
        setVideoFile(null);
        setVideoSrc(null);
      }
    }
  };

  const handleAnalysis = useCallback(async () => {
    if (!videoFile) {
      setError('Please select a video file first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    if (!process.env.API_KEY) {
      setError('API key is not configured. Please set the API_KEY environment variable.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    try {
      const frames = await extractFrames(videoFile, 1); // Extract 1 frame per second
      if (frames.length === 0) {
        throw new Error('Could not extract any frames from the video. It might be too short or corrupted.');
      }
      const result = await analyzeVideo(prompt, frames);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [videoFile, prompt, extractFrames]);
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
     if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoSrc(url);
        setError(null);
        setAnalysisResult('');
      } else {
        setError('Please select a valid video file.');
        setVideoFile(null);
        setVideoSrc(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm p-6 md:p-8 space-y-6 border border-gray-700">

          {!videoSrc && (
             <div 
              className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center text-center cursor-pointer hover:border-blue-500 hover:bg-gray-800 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
             >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400">
                <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop a video
              </p>
              <p className="text-xs text-gray-500 mt-1">MP4, MOV, WEBM, OGG</p>
            </div>
          )}

          {videoSrc && <VideoPlayer src={videoSrc} />}

          {videoSrc && (
             <button
                onClick={() => {
                    setVideoFile(null);
                    setVideoSrc(null);
                    setAnalysisResult('');
                    if(fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="w-full py-2 px-4 bg-red-600/50 hover:bg-red-600/80 text-white font-semibold rounded-lg transition-colors"
            >
                Remove Video
            </button>
          )}

          <div className="space-y-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-400">Analysis Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-200 resize-none h-28"
              placeholder="e.g., What is the main subject of this video?"
            />
          </div>

          <button
            onClick={handleAnalysis}
            disabled={isLoading || !videoFile}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-lg flex items-center justify-center space-x-2"
          >
             {isLoading ? <Loader /> : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Analyze Video</span>
                </>
             )}
          </button>
          
          {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

          {analysisResult && <ResultDisplay result={analysisResult} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
