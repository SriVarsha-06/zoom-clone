'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home as HomeIcon, Sparkles, Video, MessageSquare, LayoutGrid, MoreHorizontal, Settings,
  Search, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, ArrowUp, Edit3, Info, X,
  Clock, Mic, Bell, LogIn, LogOut, Umbrella
} from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Home() {
  const router = useRouter();
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '' });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // UI Dismissable Banner States
  const [showCalendarBanner, setShowCalendarBanner] = useState(true);
  const [showRightPane, setShowRightPane] = useState(true);
  const [showTrialCard, setShowTrialCard] = useState(true);

  // Date Selection & Calendar Picker State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Meeting Data States & Active Tab
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');

  // Modal States
  const [joinId, setJoinId] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title: '', start_time: '', duration: 40 });
  
  // Real-time Clock States
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zoom_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    } else {
      setShowAuthModal(true);
    }

    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const [upcomingRes, recentRes] = await Promise.all([
        axios.get(`${API_BASE}/meetings/upcoming`),
        axios.get(`${API_BASE}/meetings/recent`)
      ]);
      setUpcoming(upcomingRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      console.error("Error fetching meetings:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.name || !authForm.email) return;
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, authForm);
      setCurrentUser(res.data);
      localStorage.setItem('zoom_user', JSON.stringify(res.data));
    } catch {
      const mockUser = { id: `usr_${Date.now()}`, name: authForm.name, email: authForm.email };
      setCurrentUser(mockUser);
      localStorage.setItem('zoom_user', JSON.stringify(mockUser));
    }
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('zoom_user');
    setCurrentUser(null);
    setShowProfileMenu(false);
    setShowAuthModal(true);
  };

  const startInstantMeeting = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/meetings/instant`);
      router.push(`/meeting/${res.data.id}`);
    } catch (err) {
      alert("Failed to create instant meeting. Check backend connection.");
    }
  };

  const handleJoin = async () => {
    if (!joinId) return;
    try {
      await axios.get(`${API_BASE}/meetings/${joinId}`);
      router.push(`/meeting/${joinId}`);
    } catch {
      alert("Invalid Meeting ID. Meeting does not exist.");
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/meetings/schedule`, {
        title: scheduleForm.title,
        start_time: new Date(scheduleForm.start_time).toISOString(),
        duration_minutes: Number(scheduleForm.duration)
      });
      setShowScheduleModal(false);
      setScheduleForm({ title: '', start_time: '', duration: 40 });
      fetchMeetings();
    } catch (err) {
      alert("Failed to schedule meeting.");
    }
  };

  // Filter upcoming meetings matching the selected date
  const filteredUpcomingMeetings = upcoming.filter((m) => {
    if (!m.start_time) return false;
    const meetingDate = new Date(m.start_time);
    return (
      meetingDate.getFullYear() === selectedDate.getFullYear() &&
      meetingDate.getMonth() === selectedDate.getMonth() &&
      meetingDate.getDate() === selectedDate.getDate()
    );
  });

  const changeDateByDays = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const formattedHeaderDate = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F7F9FA] text-[#131619] font-sans antialiased overflow-hidden select-none">
      
      {/* 1. Left Navigation Sidebar */}
      <aside className="w-full md:w-[72px] bg-[#E9EDF0] border-b md:border-r border-[#D2D8DF] flex md:flex-col justify-between items-center px-4 md:px-0 py-2 md:py-3 z-10 shrink-0 order-2 md:order-1">
        <div className="flex md:flex-col items-center justify-around w-full space-x-2 md:space-x-0 md:space-y-4">
          <div className="flex flex-col items-center text-[#2D8CFF] font-medium text-[10px] md:text-[11px] cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center border border-[#D2D8DF] shadow-sm mb-0.5 md:mb-1">
              <HomeIcon className="w-4 h-4 md:w-5 md:h-5 text-[#2D8CFF]" />
            </div>
            <span>Home</span>
          </div>

          <div className="flex flex-col items-center text-[#525E6B] hover:text-[#131619] font-medium text-[10px] md:text-[11px] cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-[#DCE1E7] mb-0.5 md:mb-1">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span>ZoomMate</span>
          </div>

          <div className="flex flex-col items-center text-[#525E6B] hover:text-[#131619] font-medium text-[10px] md:text-[11px] cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-[#DCE1E7] mb-0.5 md:mb-1">
              <Video className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span>Meetings</span>
          </div>

          <div className="flex flex-col items-center text-[#525E6B] hover:text-[#131619] font-medium text-[10px] md:text-[11px] cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-[#DCE1E7] mb-0.5 md:mb-1">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span>Chat</span>
          </div>

          <div className="hidden md:flex flex-col items-center text-[#525E6B] hover:text-[#131619] font-medium text-[11px] cursor-pointer relative">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#DCE1E7] mb-1">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span>Hub</span>
            <span className="absolute -top-1 right-1 bg-[#0E71EB] text-white text-[9px] px-1 rounded-full font-bold">New</span>
          </div>

          <div className="hidden md:flex flex-col items-center text-[#525E6B] hover:text-[#131619] font-medium text-[11px] cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#DCE1E7] mb-1">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center text-[#525E6B] hover:text-[#131619] font-medium text-[11px] cursor-pointer">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#DCE1E7] mb-1">
            <Settings className="w-5 h-5" />
          </div>
          <span>Settings</span>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden order-1 md:order-2">
        
        {/* Top Navigation Bar */}
        <header className="h-[48px] bg-[#E9EDF0] border-b border-[#D2D8DF] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-[#6E7C8C]">
            <span className="font-bold text-sm text-[#131619] tracking-tight">zoom <span className="font-normal text-xs text-[#525E6B]">Workplace</span></span>
            <div className="hidden sm:flex items-center space-x-1 pl-4">
              <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-[#131619]" />
              <ChevronRight className="w-4 h-4 cursor-pointer hover:text-[#131619]" />
              <Clock className="w-4 h-4 cursor-pointer hover:text-[#131619] ml-1" />
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 absolute left-3 text-[#6E7C8C]" />
              <input 
                type="text" 
                placeholder="Search (Ctrl+E)" 
                className="w-full bg-[#DCE1E7] text-xs pl-9 pr-8 py-1.5 rounded-lg text-[#131619] placeholder-[#6E7C8C] outline-none border border-transparent focus:border-[#0E71EB] focus:bg-white transition"
              />
              <Plus className="w-4 h-4 absolute right-3 text-[#6E7C8C] cursor-pointer" />
            </div>
          </div>

          {/* Profile & Controls */}
          <div className="flex items-center space-x-3 relative">
            <button className="bg-[#0E71EB] hover:bg-[#0B5CBE] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition hidden sm:block">
              Upgrade
            </button>
            <Bell className="w-4 h-4 text-[#525E6B] cursor-pointer hover:text-[#131619] hidden sm:block" />
            <CalendarIcon className="w-4 h-4 text-[#525E6B] cursor-pointer hover:text-[#131619] hidden sm:block" />
            
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-7 h-7 rounded-full bg-[#823290] text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer border border-white"
            >
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'BV'}
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-[#D2D8DF] rounded-xl shadow-xl p-3 z-50">
                <div className="pb-2 mb-2 border-b border-[#E9EDF0]">
                  <p className="font-bold text-xs text-[#131619] truncate">{currentUser?.name || 'Guest User'}</p>
                  <p className="text-[11px] text-[#525E6B] truncate">{currentUser?.email || 'Not logged in'}</p>
                </div>
                {currentUser ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { setShowProfileMenu(false); setShowAuthModal(true); }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-[#0E71EB] hover:bg-blue-50 flex items-center space-x-2 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Center Workspace Area */}
        <div className="flex-1 flex overflow-hidden">
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
            
            {/* Real-time Clock & Date */}
            <div className="text-center mt-2 mb-6">
              <h1 className="text-4xl font-bold tracking-tight text-[#131619]">{timeStr || '23:31'}</h1>
              <p className="text-xs md:text-sm font-medium text-[#525E6B] mt-1">{dateStr || 'Tuesday, October 6, 2026'}</p>
            </div>

            {/* Core Action Icons */}
            <div className="flex items-center justify-center space-x-4 md:space-x-6 mb-8 flex-wrap">
              <div className="flex flex-col items-center">
                <button 
                  onClick={startInstantMeeting} 
                  className="w-12 h-12 md:w-14 md:h-14 bg-[#FF742E] hover:opacity-90 rounded-2xl flex items-center justify-center shadow-md text-white transition"
                >
                  <Video className="w-6 h-6 md:w-7 md:h-7 fill-current" />
                </button>
                <span className="mt-2 text-xs font-medium text-[#131619]">New meeting</span>
              </div>

              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setShowJoinModal(true)} 
                  className="w-12 h-12 md:w-14 md:h-14 bg-[#0E71EB] hover:opacity-90 rounded-2xl flex items-center justify-center shadow-md text-white transition"
                >
                  <Plus className="w-6 h-6 md:w-7 md:h-7" />
                </button>
                <span className="mt-2 text-xs font-medium text-[#131619]">Join</span>
              </div>

              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setShowScheduleModal(true)} 
                  className="w-12 h-12 md:w-14 md:h-14 bg-[#0E71EB] hover:opacity-90 rounded-2xl flex items-center justify-center shadow-md text-white transition"
                >
                  <CalendarIcon className="w-6 h-6 md:w-7 md:h-7" />
                </button>
                <span className="mt-2 text-xs font-medium text-[#131619]">Schedule</span>
              </div>

              <div className="flex flex-col items-center">
                <button className="w-12 h-12 md:w-14 md:h-14 bg-[#0E71EB] hover:opacity-90 rounded-2xl flex items-center justify-center shadow-md text-white transition opacity-80">
                  <ArrowUp className="w-6 h-6 md:w-7 md:h-7" />
                </button>
                <span className="mt-2 text-xs font-medium text-[#131619]">Share screen</span>
              </div>

              <div className="flex flex-col items-center">
                <button className="w-12 h-12 md:w-14 md:h-14 bg-[#0E71EB] hover:opacity-90 rounded-2xl flex items-center justify-center shadow-md text-white transition opacity-80">
                  <Edit3 className="w-6 h-6 md:w-7 md:h-7" />
                </button>
                <span className="mt-2 text-xs font-medium text-[#131619]">My Notes</span>
              </div>
            </div>

            {/* Scheduled Meetings Panel */}
            <div className="w-full max-w-2xl bg-white border border-[#D2D8DF] rounded-2xl shadow-sm p-4 space-y-4">
              
              {/* Closeable Calendar Banner */}
              {showCalendarBanner && (
                <div className="bg-[#EAF4FF] border border-[#BDE0FE] rounded-xl p-3 flex items-center justify-between text-xs text-[#131619]">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-[#0E71EB] shrink-0" />
                    <span>You haven't connected your calendar yet. <button className="text-[#0E71EB] font-medium hover:underline">Connect now</button> to manage all your meetings and events in one place.</span>
                  </div>
                  <X 
                    onClick={() => setShowCalendarBanner(false)} 
                    className="w-4 h-4 text-[#6E7C8C] cursor-pointer hover:text-[#131619] shrink-0 ml-2" 
                  />
                </div>
              )}

              {/* CENTERED HEADER: Today, Oct 6 ˅ with Date Picker Trigger */}
              <div className="flex items-center justify-center relative pt-1">
                <Plus onClick={() => setShowScheduleModal(true)} className="w-4 h-4 text-[#525E6B] cursor-pointer hover:text-[#131619] absolute left-0" />
                
                <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center space-x-1 font-bold text-sm text-[#131619] hover:bg-gray-100 px-2 py-1 rounded-lg transition"
                >
                  <span>{isToday(selectedDate) ? 'Today, ' : ''}{formattedHeaderDate}</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-90 text-[#525E6B]" />
                </button>

                {showDatePicker && (
                  <div className="absolute top-9 bg-white border border-[#D2D8DF] rounded-xl shadow-2xl p-4 z-50 flex flex-col items-center">
                    <p className="text-xs font-bold text-[#131619] mb-2">Select Date</p>
                    <input 
                      type="date" 
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(new Date(e.target.value));
                          setShowDatePicker(false);
                        }
                      }}
                      className="border border-[#D2D8DF] rounded-lg p-2 text-xs text-[#131619] outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Bar: [Today] < > ... AND Requirements Section Tabs */}
              <div className="flex items-center justify-between border-t border-b border-[#E9EDF0] py-2 text-xs">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedDate(new Date())}
                    className="border border-[#D2D8DF] px-2.5 py-1 rounded-lg text-xs font-medium text-[#131619] bg-white hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#525E6B]" />
                    <span>Today</span>
                  </button>
                  <ChevronLeft onClick={() => changeDateByDays(-1)} className="w-3.5 h-3.5 text-[#525E6B] cursor-pointer hover:text-[#131619]" />
                  <ChevronRight onClick={() => changeDateByDays(1)} className="w-3.5 h-3.5 text-[#525E6B] cursor-pointer hover:text-[#131619]" />
                </div>

                {/* Section Selection: Upcoming vs Recent Meetings */}
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`text-xs font-bold transition ${activeTab === 'upcoming' ? 'text-[#0E71EB] underline' : 'text-[#525E6B]'}`}
                  >
                    Upcoming ({upcoming.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('recent')}
                    className={`text-xs font-bold transition ${activeTab === 'recent' ? 'text-[#0E71EB] underline' : 'text-[#525E6B]'}`}
                  >
                    Recent ({recent.length})
                  </button>
                </div>
              </div>

              {/* Dynamic Meetings List based on Active Tab */}
              <div className="rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px]">
                {activeTab === 'upcoming' ? (
                  filteredUpcomingMeetings.length > 0 ? (
                    <div className="w-full space-y-3">
                      {filteredUpcomingMeetings.map((m) => (
                        <div key={m.id} className="p-3.5 bg-[#F7F9FA] border border-[#D2D8DF] rounded-xl flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-xs md:text-sm text-[#131619]">{m.title}</h4>
                            <p className="text-[11px] text-[#525E6B]">ID: {m.id}</p>
                            <p className="text-xs text-[#0E71EB] mt-0.5">{new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({m.duration_minutes || 40} mins)</p>
                          </div>
                          <button onClick={() => router.push(`/meeting/${m.id}`)} className="px-3.5 py-1.5 bg-[#0E71EB] text-white text-xs font-semibold rounded-lg hover:bg-[#0B5CBE] transition">
                            Start
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4 text-center">
                      <div className="w-20 h-16 mb-2 text-[#9FB5D6] flex items-center justify-center">
                        <Umbrella className="w-12 h-12 stroke-[1.5]" />
                      </div>
                      <p className="text-xs font-medium text-[#525E6B]">No meetings scheduled for this date.</p>
                      <button 
                        onClick={() => setShowScheduleModal(true)} 
                        className="mt-1 text-xs font-semibold text-[#0E71EB] hover:underline flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-0.5" /> Schedule a meeting
                      </button>
                    </div>
                  )
                ) : (
                  recent.length > 0 ? (
                    <div className="w-full space-y-3">
                      {recent.map((m) => (
                        <div key={m.id} className="p-3.5 bg-[#F7F9FA] border border-[#D2D8DF] rounded-xl flex items-center justify-between opacity-80">
                          <div>
                            <h4 className="font-semibold text-xs md:text-sm text-[#131619]">{m.title}</h4>
                            <p className="text-[11px] text-[#525E6B]">ID: {m.id}</p>
                            <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium mt-1 inline-block">Ended</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-[#525E6B]">No recent meeting history found.</p>
                  )
                )}
              </div>

              <div className="text-xs font-medium text-[#525E6B] cursor-pointer hover:text-[#131619] flex items-center pt-1 border-t border-[#E9EDF0]">
                <span>Open recordings</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </main>

          {/* Right Sidebar: ZoomMate Pane */}
          {showRightPane && (
            <aside className="w-[320px] bg-white border-l border-[#D2D8DF] hidden lg:flex flex-col justify-between p-4 z-10 shrink-0">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF0]">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#2D8CFF] text-white rounded-full flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-xs text-[#131619]">ZoomMate</span>
                  </div>
                  <X onClick={() => setShowRightPane(false)} className="w-4 h-4 cursor-pointer text-[#6E7C8C] hover:text-[#131619]" />
                </div>

                <div className="mt-8 flex flex-col items-center text-center px-2">
                  <div className="w-14 h-14 bg-[#EAF4FF] rounded-full flex items-center justify-center mb-4 text-[#2D8CFF]">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-medium text-[#131619]">
                    I noticed a few things that I can help with.
                  </p>
                </div>

                <div className="mt-6 space-y-2.5">
                  <button className="w-full text-left p-2.5 rounded-xl border border-[#D2D8DF] hover:bg-[#F7F9FA] text-xs font-medium text-[#131619] flex items-center justify-between">
                    <span>What's on my to-do list today?</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E7C8C]" />
                  </button>
                  <button className="w-full text-left p-2.5 rounded-xl border border-[#D2D8DF] hover:bg-[#F7F9FA] text-xs font-medium text-[#131619] flex items-center justify-between">
                    <span>Create my meeting summary template</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E7C8C]" />
                  </button>
                  <button className="w-full text-left p-2.5 rounded-xl border border-[#D2D8DF] hover:bg-[#F7F9FA] text-xs font-medium text-[#131619] flex items-center justify-between">
                    <span>Send me a morning brief on a topic every d...</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E7C8C]" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {showTrialCard && (
                  <div className="bg-[#F7F9FA] border border-[#D2D8DF] rounded-xl p-3 relative">
                    <X onClick={() => setShowTrialCard(false)} className="w-3.5 h-3.5 text-[#6E7C8C] absolute top-2 right-2 cursor-pointer hover:text-[#131619]" />
                    <h5 className="font-bold text-xs text-[#131619]">Your ZoomMate, unlocked</h5>
                    <p className="text-[11px] text-[#525E6B] mt-1 leading-tight">
                      Try everything ZoomMate can do. 2,200 AI credits over 7 days.
                    </p>
                    <button className="w-full mt-2.5 bg-[#0E71EB] hover:bg-[#0B5CBE] text-white text-xs font-semibold py-1.5 rounded-lg transition">
                      Activate free trial
                    </button>
                  </div>
                )}

                <div className="relative flex items-center">
                  <Plus className="w-4 h-4 text-[#6E7C8C] absolute left-3 cursor-pointer" />
                  <input 
                    type="text" 
                    placeholder="AI can make mistakes. Review for accuracy." 
                    className="w-full bg-[#F7F9FA] border border-[#D2D8DF] text-[11px] pl-8 pr-8 py-2 rounded-xl text-[#131619] outline-none"
                  />
                  <Mic className="w-4 h-4 text-[#0E71EB] absolute right-3 cursor-pointer" />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAuth} className="bg-white p-6 rounded-2xl w-full max-w-sm border border-[#D2D8DF] shadow-2xl relative">
            <h2 className="text-base font-bold mb-1 text-[#131619]">Sign In / Sign Up</h2>
            <p className="text-xs text-[#525E6B] mb-4">Please sign in to access your Zoom Workplace meetings.</p>
            <input
              type="text"
              required
              placeholder="Full Name"
              value={authForm.name}
              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#D2D8DF] text-xs text-[#131619] mb-3 outline-none focus:border-[#0E71EB]"
            />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#D2D8DF] text-xs text-[#131619] mb-4 outline-none focus:border-[#0E71EB]"
            />
            <button type="submit" className="w-full py-2 bg-[#0E71EB] text-xs font-semibold text-white rounded-lg hover:bg-[#0B5CBE] transition">
              Continue to Zoom
            </button>
          </form>
        </div>
      )}

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md border border-[#D2D8DF] shadow-xl relative">
            <X onClick={() => setShowJoinModal(false)} className="w-4 h-4 text-[#6E7C8C] absolute top-4 right-4 cursor-pointer hover:text-[#131619]" />
            <h2 className="text-base font-bold mb-4 text-[#131619]">Join Meeting</h2>
            <input
              type="text"
              placeholder="Enter Meeting ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#D2D8DF] text-xs text-[#131619] mb-4 outline-none focus:border-[#0E71EB]"
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowJoinModal(false)} className="px-3 py-1.5 rounded-lg bg-[#E9EDF0] text-xs font-semibold text-[#525E6B]">Cancel</button>
              <button type="button" onClick={handleJoin} className="px-3 py-1.5 rounded-lg bg-[#0E71EB] text-xs font-semibold text-white">Join</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSchedule} className="bg-white p-6 rounded-2xl w-full max-w-md border border-[#D2D8DF] shadow-xl relative">
            <X onClick={() => setShowScheduleModal(false)} className="w-4 h-4 text-[#6E7C8C] absolute top-4 right-4 cursor-pointer hover:text-[#131619]" />
            <h2 className="text-base font-bold mb-4 text-[#131619]">Schedule Meeting</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#525E6B] mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekly Sprint Sync"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#D2D8DF] text-xs text-[#131619] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#525E6B] mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleForm.start_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#D2D8DF] text-xs text-[#131619] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#525E6B] mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min={15}
                  step={15}
                  value={scheduleForm.duration}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, duration: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-[#D2D8DF] text-xs text-[#131619] outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-5">
              <button type="button" onClick={() => setShowScheduleModal(false)} className="px-3 py-1.5 rounded-lg bg-[#E9EDF0] text-xs font-semibold text-[#525E6B]">Cancel</button>
              <button type="submit" className="px-3 py-1.5 rounded-lg bg-[#0E71EB] text-xs font-semibold text-white">Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}