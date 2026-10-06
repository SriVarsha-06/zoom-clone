'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Copy, Shield, UserX, VolumeX, X } from 'lucide-react';

export default function MeetingRoom() {
  const { id } = useParams();
  const router = useRouter();
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isHost, setIsHost] = useState(true); // Default user joining first is host

  const [participants, setParticipants] = useState([
    { id: '1', name: 'John Doe (Host)', isMuted: false },
    { id: '2', name: 'Alice Smith', isMuted: false },
    { id: '3', name: 'Bob Johnson', isMuted: true },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('zoom_user');
    if (saved) {
      const u = JSON.parse(saved);
      setDisplayName(u.name);
    }
  }, []);

  const copyInviteLink = () => {
    const fullInviteUrl = `${window.location.origin}/meeting/${id}`;
    navigator.clipboard.writeText(fullInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Host Control Functions
  const handleMuteAll = () => {
    setParticipants(participants.map(p => ({ ...p, isMuted: true })));
  };

  const toggleMuteParticipant = (participantId: string) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
    ));
  };

  const removeParticipant = (participantId: string) => {
    setParticipants(participants.filter(p => p.id !== participantId));
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-[#1C1F2E] text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-[#252A41] p-8 rounded-2xl max-w-md w-full border border-gray-700 text-center shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">Ready to join?</h1>
          <p className="text-xs text-gray-400 mb-6">Meeting ID: {id}</p>
          <input
            type="text"
            placeholder="Enter Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#1C1F2E] border border-gray-600 text-white mb-6 outline-none focus:border-[#0E71EB] text-sm"
          />
          <button
            onClick={() => {
              if (displayName) {
                setParticipants(prev => [{ id: 'you', name: `${displayName} (You)`, isMuted: !micOn }, ...prev.slice(1)]);
                setHasJoined(true);
              }
            }}
            className="w-full py-3 bg-[#0E71EB] rounded-xl font-semibold hover:bg-blue-600 transition text-sm"
          >
            Join Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1C1F2E] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-6 border-b border-gray-800 flex items-center justify-between bg-[#19232D]">
        <div className="flex items-center space-x-3">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="font-semibold text-xs tracking-wide">Meeting ID: {id}</span>
        </div>
        <button
          onClick={copyInviteLink}
          className="flex items-center space-x-2 text-xs bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700 transition"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copied ? 'Copied Link!' : 'Copy Invite Link'}</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
          <div className="relative bg-black rounded-2xl overflow-hidden h-full max-h-[480px] border border-gray-800 flex items-center justify-center">
            {videoOn ? (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-medium">[Camera Feed Active]</span>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#0E71EB] flex items-center justify-center text-2xl font-bold">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-medium">
              {displayName} (You)
            </span>
          </div>

          {participants.filter(p => p.id !== 'you').map(p => (
            <div key={p.id} className="relative bg-black rounded-2xl overflow-hidden h-full max-h-[480px] border border-gray-800 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-2">
                <span>{p.name}</span>
                {p.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
              </span>
            </div>
          ))}
        </div>

        {/* Host Control Side Drawer */}
        {showParticipants && (
          <aside className="w-80 bg-[#19232D] border-l border-gray-800 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h3 className="text-sm font-bold flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Participants ({participants.length})</span>
                </h3>
                <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowParticipants(false)} />
              </div>

              <div className="mt-4 space-y-3">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-[#1C1F2E] p-2.5 rounded-xl border border-gray-800 text-xs">
                    <span className="font-medium truncate max-w-[120px]">{p.name}</span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => toggleMuteParticipant(p.id)}
                        className={`p-1.5 rounded-lg transition ${p.isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'}`}
                      >
                        {p.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                      {p.id !== 'you' && (
                        <button 
                          onClick={() => removeParticipant(p.id)}
                          className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mute All Host Action */}
            <div className="pt-4 border-t border-gray-800">
              <button 
                onClick={handleMuteAll}
                className="w-full py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition"
              >
                <VolumeX className="w-4 h-4" />
                <span>Mute All Participants</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-[#19232D] border-t border-gray-800 flex items-center justify-center space-x-6">
        <button onClick={() => setMicOn(!micOn)} className={`p-3.5 rounded-xl transition ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}>
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button onClick={() => setVideoOn(!videoOn)} className={`p-3.5 rounded-xl transition ${videoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600'}`}>
          {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button onClick={() => setShowParticipants(!showParticipants)} className={`p-3.5 rounded-xl transition ${showParticipants ? 'bg-[#0E71EB]' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <Users className="w-5 h-5" />
        </button>

        <button onClick={() => router.push('/')} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold flex items-center space-x-2 transition text-sm">
          <PhoneOff className="w-5 h-5" />
          <span>End Meeting</span>
        </button>
      </div>
    </div>
  );
}