import React, { useState, useEffect, useRef } from 'react';
import { Moon, Telescope, Settings, Hexagon, Image as ImageIcon, Camera, Trash2, Plus, X } from 'lucide-react';
import Image from 'next/image';

interface Observation {
  id: string;
  name: string;
  date: string;
  image: string; // Base64 compressed image
}

export default function ProfileScreen({ user }: { user?: { name: string, email: string, phone?: string } }) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('apoggee_observations');
    if (saved) {
      try {
        setObservations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse observations');
      }
    }
  }, []);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality compression
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const compressed = await compressImage(base64);
        setUploadImage(compressed);
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveObservation = () => {
    if (!uploadImage || !uploadName.trim()) return;
    const newObs: Observation = {
      id: Date.now().toString(),
      name: uploadName,
      date: uploadDate,
      image: uploadImage,
    };
    const updated = [newObs, ...observations];
    setObservations(updated);
    localStorage.setItem('apoggee_observations', JSON.stringify(updated));
    
    // Reset Form
    setUploadName('');
    setUploadImage(null);
    setShowUploadModal(false);
  };

  const handleDeleteObservation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = observations.filter(obs => obs.id !== id);
    setObservations(updated);
    localStorage.setItem('apoggee_observations', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white overflow-y-auto no-scrollbar pb-24 md:pb-8 relative">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-14 md:pt-8 pb-6 md:pb-10">
          <h2 className="text-xl md:text-3xl font-bold">Profile</h2>
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <Settings size={20} className="md:hidden" />
            <Settings size={24} className="hidden md:block" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row px-6 gap-8 md:gap-16 mb-12">
          {/* User Info */}
          <div className="flex flex-col items-center md:items-start shrink-0">
            <div className="relative mb-4 md:mb-6">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-2 md:border-4 border-[#D9A441] relative bg-[#101827] flex items-center justify-center">
                 {/* Empty state avatar */}
                 <UserAvatar name={user?.name || 'A'} />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <h3 className="text-2xl md:text-4xl font-bold">{user?.name || 'Astrophotographer'}</h3>
              <span className="bg-[#D9A441] text-black text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-sm">PRO</span>
            </div>
            <p className="text-[#A2A9B3] text-sm md:text-base">{user?.email || 'No email provided'}</p>
            {user?.phone && <p className="text-[#A2A9B3] text-xs mt-1">{user.phone}</p>}
            
            <div className="flex gap-4 mt-6">
              <button className="hidden md:block px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                Edit Profile
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('apoggee_user');
                  window.location.reload();
                }}
                className="px-6 py-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div className="flex flex-col gap-8 md:gap-10">
            {/* List items (Equipment, Settings) */}
            <div className="glass-panel rounded-3xl p-2 md:p-4 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A2A9B3]">
                    <Telescope size={20} />
                  </div>
                  <span className="font-medium md:text-lg">Equipment</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-[#A2A9B3] bg-white/5 px-2 py-1 rounded-md">0 items</span>
                  <span className="text-[#A2A9B3] font-bold">&gt;</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 rounded-2xl transition-colors mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A2A9B3]">
                    <Settings size={20} />
                  </div>
                  <span className="font-medium md:text-lg">Settings</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-[#A2A9B3]">App preferences</span>
                  <span className="text-[#A2A9B3] font-bold">&gt;</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:gap-10">
            {/* My Observations */}
            <div className="glass-panel p-6 rounded-3xl h-full flex flex-col min-h-[350px]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-semibold text-lg md:text-xl">My Observations</h4>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-[#D9A441] text-xs md:text-sm hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus size={14} /> Upload
                </button>
              </div>
              
              {observations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] opacity-70">
                  <Camera size={48} className="mb-4 text-[#A2A9B3]" strokeWidth={1} />
                  <p className="text-lg font-medium text-white mb-2">No observations yet</p>
                  <p className="text-[#A2A9B3] text-sm text-center mb-6 max-w-xs">Your uploaded captures and visual log will keep track of your sky memories.</p>
                  
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-2.5 bg-[#D9A441] text-black font-semibold rounded-full hover:scale-105 transition-transform shadow-lg shadow-[#D9A441]/10"
                  >
                    Add First Observation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[380px] no-scrollbar pr-1">
                  {observations.map(obs => (
                    <div 
                      key={obs.id} 
                      className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#101827] h-32 md:h-36 shadow-lg hover:border-white/20 transition-all"
                    >
                      <img src={obs.image} alt={obs.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
                        <span className="font-semibold text-xs text-white truncate">{obs.name}</span>
                        <span className="text-[10px] text-[#A2A9B3] mt-0.5">{new Date(obs.date).toLocaleDateString()}</span>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDeleteObservation(obs.id, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-md"
                        title="Delete Capture"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowUploadModal(false);
                setUploadImage(null);
                setUploadName('');
              }}
              className="absolute top-4 right-4 text-[#A2A9B3] hover:text-white transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-5 text-white flex items-center gap-2">
              <Camera size={20} className="text-[#D9A441]" />
              Upload Sky Capture
            </h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#A2A9B3] mb-1 block uppercase tracking-wider font-semibold">Object / Target Name</label>
                <input 
                  type="text" 
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  placeholder="e.g. Orion Constellation, Full Moon..." 
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#D9A441] transition"
                />
              </div>
              
              <div>
                <label className="text-xs text-[#A2A9B3] mb-1 block uppercase tracking-wider font-semibold">Observation Date</label>
                <input 
                  type="date" 
                  value={uploadDate}
                  onChange={e => setUploadDate(e.target.value)}
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#D9A441] transition"
                />
              </div>

              <div>
                <label className="text-xs text-[#A2A9B3] mb-2 block uppercase tracking-wider font-semibold">Photo Upload</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                
                {!uploadImage ? (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 bg-[#161D2B]/50 flex flex-col items-center justify-center gap-2 text-xs text-[#A2A9B3] hover:text-white transition disabled:opacity-50"
                  >
                    {isCompressing ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#D9A441] border-t-transparent rounded-full animate-spin"></span>
                        Compressing Sky Photo...
                      </>
                    ) : (
                      <>
                        <Camera size={24} className="text-[#A2A9B3] group-hover:text-white" />
                        Select Astronomical Photo
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 h-32 bg-black flex items-center justify-center">
                    <img src={uploadImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setUploadImage(null)}
                      className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-white/10 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={handleSaveObservation}
                disabled={!uploadImage || !uploadName.trim()}
                className="w-full mt-3 py-3 rounded-xl bg-[#D9A441] text-black font-bold text-sm hover:bg-white transition glow-amber disabled:opacity-50 disabled:pointer-events-none"
              >
                Save Capture to Gallery
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Helper for empty avatar state
function UserAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <span className="text-4xl md:text-6xl font-bold text-[#A2A9B3]">{initial}</span>
  );
}
