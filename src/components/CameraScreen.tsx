import React, { useState, useEffect, useRef } from 'react';
import { Camera as CameraIcon, X, Maximize, RotateCcw, Zap, Sparkles, Upload, Settings } from 'lucide-react';
import Image from 'next/image';

export default function CameraScreen({ onBack }: { onBack: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  
  // External Camera State
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const getCameras = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      
      // If we don't have a selected device but we found devices, don't auto-select yet
      // let it use facingMode first, then update selectedDeviceId to match what stream is using if possible
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  };

  const startCamera = React.useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId } } 
          : { facingMode: isFrontCamera ? 'user' : 'environment' }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setHasPermission(true);
      getCameras();
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
    }
  }, [isFrontCamera, selectedDeviceId]);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const toggleCamera = () => {
    setSelectedDeviceId(''); // Clear specific device ID to rely on facing mode
    setIsFrontCamera(!isFrontCamera);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white relative">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition">
          <X size={24} className="text-white" />
        </button>
        {!photo && (
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-3">
              {/* Upload Photo Button */}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-10 h-10 rounded-full glass flex items-center justify-center bg-[#0B0F17]/50 hover:bg-white/10 transition"
                title="Upload Photo"
              >
                <Upload size={18} className="text-white" />
              </button>

              <button className="w-10 h-10 rounded-full glass flex items-center justify-center bg-[#0B0F17]/50 hover:bg-white/10 transition">
                <Zap size={20} className="text-white" />
              </button>
              
              <button onClick={toggleCamera} className="w-10 h-10 rounded-full glass flex items-center justify-center bg-[#0B0F17]/50 hover:bg-white/10 transition">
                <RotateCcw size={20} className="text-white" />
              </button>
            </div>
            
            {/* Camera Selection Dropdown (if multiple devices like USB cameras are connected) */}
            {devices.length > 1 && (
              <div className="glass-panel p-2 rounded-xl flex flex-col gap-1 w-max border border-white/10 bg-[#0B0F17]/80 backdrop-blur-md">
                <span className="text-[10px] text-[#A2A9B3] px-2 mb-1 uppercase tracking-wider font-semibold">Select Camera</span>
                {devices.map((device, idx) => (
                  <button 
                    key={device.deviceId} 
                    onClick={() => setSelectedDeviceId(device.deviceId)}
                    className={`text-left px-3 py-1.5 text-xs rounded-md transition-colors ${selectedDeviceId === device.deviceId ? 'bg-[#D9A441] text-black font-semibold' : 'text-white hover:bg-white/10'}`}
                  >
                    {device.label || `External Camera ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Camera View */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {hasPermission === false ? (
          <div className="text-center p-6 max-w-md mx-auto">
            <CameraIcon size={48} className="mx-auto mb-4 text-[#A2A9B3]" />
            <h2 className="text-xl font-semibold mb-2">Camera Access Denied</h2>
            <p className="text-[#A2A9B3] text-sm mb-6">Please allow camera access in your browser settings to use this feature, or upload a photo manually.</p>
            <div className="flex flex-col gap-3">
              <button onClick={startCamera} className="bg-[#D9A441] text-black font-semibold px-6 py-3 rounded-full hover:scale-105 transition">
                Try Again
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="glass text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition">
                Upload Photo Instead
              </button>
            </div>
          </div>
        ) : photo ? (
          <img src={photo} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {/* Rule of Thirds Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>
          </>
        )}
      </div>
      
      {/* Hidden Canvas for capturing image */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom Controls */}
      <div className="h-32 bg-black pb-8 pt-4 px-6 flex justify-between items-center shrink-0">
        {photo ? (
          <>
            <button onClick={retakePhoto} className="text-white font-medium py-3 px-6 rounded-full glass hover:bg-white/10 transition">
              Retake
            </button>
            <button className="bg-[#D9A441] text-black font-semibold py-3 px-8 rounded-full flex items-center gap-2 glow-amber hover:scale-105 transition-transform">
              <Sparkles size={18} /> Enhance
            </button>
          </>
        ) : hasPermission ? (
          <>
            <button className="w-12 h-12 rounded-full overflow-hidden border border-white/20 hover:border-white/50 transition">
               {/* Gallery Preview Placeholder */}
               <div className="w-full h-full bg-[#161D2B]"></div>
            </button>
            
            {/* Shutter Button */}
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative p-1 active:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-white rounded-full"></div>
            </button>
            
            <button className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition">
              <Maximize size={20} className="text-white" />
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <span className="text-[#A2A9B3] text-sm animate-pulse">Waiting for permission...</span>
          </div>
        )}
      </div>
    </div>
  );
}
