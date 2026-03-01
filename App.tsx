
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import RouteCard from './components/RouteCard';
import { RouteOption, TravelMode, UserProfile, CommunityTip, SafetyAlert } from './types';
import { generateRoutes, getSafetyInsights, getNearestPoliceStation, generateVoiceGuidance } from './services/geminiService';
import { Icons, GENDER_THEMES } from './constants';

// PCM Decoding Utilities
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCallMode, setIsCallMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('My Location');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<TravelMode>('walking');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [areaInsight, setAreaInsight] = useState('Loading local safety insights...');
  
  // Panic States
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [panicStatus, setPanicStatus] = useState('');
  const [panicLog, setPanicLog] = useState<string[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Sarah',
    gender: 'woman',
    mobilityNeeds: false,
    sheNavEnabled: true,
    safetyPriority: 80,
    emergencyContacts: ['', '', '', ''],
  });

  const currentTheme = GENDER_THEMES[userProfile.gender === 'man' ? 'man' : userProfile.gender === 'woman' ? 'woman' : 'other'];

  useEffect(() => {
    const alerts: SafetyAlert[] = userProfile.gender === 'man' 
      ? [
          { id: '1', type: 'hazard', message: 'Reported pickpockets near Grand Station', timeAgo: '10m ago', distance: '100m away' },
          { id: '2', type: 'police', message: 'Increased patrol on 5th Ave due to event', timeAgo: '1h ago', distance: '500m away' },
        ]
      : [
          { id: '1', type: 'harassment', message: 'Reported harassment near Central Mall', timeAgo: '15m ago', distance: '200m ahead' },
          { id: '2', type: 'hazard', message: 'Streetlight out on Park Ave', timeAgo: '2h ago', distance: '1.2km away' },
        ];
    setSafetyAlerts(alerts);
    
    const fetchInitialInsights = async () => {
      const insight = await getSafetyInsights("current city area");
      setAreaInsight(insight);
    };
    fetchInitialInsights();
  }, [userProfile.gender]);

  const speak = async (text: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const base64Audio = await generateVoiceGuidance(text, userProfile.gender === 'man' ? 'Fenrir' : 'Kore');
    if (base64Audio) {
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    }
  };

  const startCallMode = () => {
    setIsCallMode(true);
    speak(`Hi ${userProfile.name}, I'm your Voice Guardian. I'll be guiding you to ${destination} via the safest route. Just follow my voice through your earpiece. Keep your phone in your pocket.`);
  };

  const handleSearch = async () => {
    if (!destination) return;
    setLoading(true);
    try {
      const generated = await generateRoutes(origin, destination, mode, userProfile);
      setRoutes(generated);
      setSelectedRoute(generated[0]);
      const insight = await getSafetyInsights(destination);
      setAreaInsight(insight);
    } finally {
      setLoading(false);
    }
  };

  const triggerPanic = async () => {
    setIsPanicMode(true);
    setPanicLog([]);
    setPanicStatus('Initializing SOS...');
    
    try {
      setPanicStatus('Fetching Battery Status...');
      let batteryInfo = "Unknown";
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        batteryInfo = `${Math.round(battery.level * 100)}%`;
      }
      setPanicLog(prev => [...prev, `Battery: ${batteryInfo}`]);

      setPanicStatus('Locating Device...');
      const pos: any = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      setPanicLog(prev => [...prev, `Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`]);

      setPanicStatus('Finding Nearest Police...');
      const policeAddr = await getNearestPoliceStation(latitude, longitude);
      setPanicLog(prev => [...prev, `Nearest Police: ${policeAddr}`]);

      setPanicStatus('Transmitting SOS to Contacts...');
      const activeContacts = userProfile.emergencyContacts.filter(c => c.trim() !== '');
      if (activeContacts.length === 0) {
        setPanicLog(prev => [...prev, "Warning: No emergency contacts configured!"]);
      } else {
        activeContacts.forEach(contact => {
          setPanicLog(prev => [...prev, `Alert sent to ${contact}`]);
        });
      }

      setPanicStatus('HELP IS ON THE WAY');
      speak("Panic alert triggered. Your location and battery status have been sent to your emergency contacts. Stay where you are if safe, or head towards the nearest police station.");
    } catch (err) {
      console.error(err);
      setPanicStatus('SOS Error - Check Manual GPS');
      setPanicLog(prev => [...prev, "GPS/Network connection failed."]);
    }
  };

  const renderCallOverlay = () => (
    <div className="fixed inset-0 z-[110] bg-slate-900 flex flex-col items-center justify-between p-12 text-white">
      <div className="flex flex-col items-center mt-20 gap-4">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-tr ${currentTheme.gradient} flex items-center justify-center border-4 border-slate-800 shadow-2xl animate-pulse`}>
          <Icons.Safety />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black">{currentTheme.label} Voice</h2>
          <p className="text-slate-400 text-sm mt-1">Active Guidance Call</p>
        </div>
        <div className="flex gap-1 mt-4">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className={`w-1 h-6 bg-indigo-500 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }} />
           ))}
        </div>
      </div>

      <div className="w-full space-y-4 mb-10">
        <div className="bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-700">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Instruction</p>
           <p className="text-lg font-medium">"Walk 100m straight, then turn left at the pharmacy."</p>
        </div>
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => setIsCallMode(false)}
            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-900/40 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPanicOverlay = () => (
    <div className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-8 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse" />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center animate-ping mb-8">
          <Icons.Alert />
        </div>
        <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">SOS Active</h2>
        <p className="text-red-100 font-bold mb-8">{panicStatus}</p>
        <div className="w-full bg-red-700/50 rounded-2xl p-4 text-left space-y-2 mb-8 font-mono text-xs max-h-48 overflow-y-auto">
          {panicLog.map((log, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-red-300">&gt;&gt;</span> {log}
            </div>
          ))}
        </div>
        <button onClick={() => setIsPanicMode(false)} className="w-full bg-white text-red-600 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">CANCEL SOS</button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 border border-slate-100">
        <h2 className="font-bold text-slate-800 text-lg">Where are you going?</h2>
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300" />
            <input 
              className="w-full bg-slate-50 border-0 rounded-xl py-3 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500" />
            <input 
              className="w-full bg-slate-50 border-0 rounded-xl py-3 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="Enter destination..." value={destination} onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <button onClick={() => setMode('walking')} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${mode === 'walking' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <Icons.Walking /><span className="text-[9px] font-bold uppercase tracking-wide">Walk</span>
          </button>
          <button onClick={() => setMode('metro')} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${mode === 'metro' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <Icons.Metro /><span className="text-[9px] font-bold uppercase tracking-wide">Metro</span>
          </button>
          <button onClick={() => setMode('transit')} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${mode === 'transit' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <Icons.Bus /><span className="text-[9px] font-bold uppercase tracking-wide">Bus</span>
          </button>
          <button onClick={() => setMode('driving')} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${mode === 'driving' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <Icons.Car /><span className="text-[9px] font-bold uppercase tracking-wide">Car</span>
          </button>
        </div>

        <button 
          onClick={handleSearch} disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
        >
          {loading ? 'Analyzing safety data...' : 'Search Safe Routes'}
        </button>
      </div>

      {routes.length > 0 && !loading && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Suggested {mode.charAt(0).toUpperCase() + mode.slice(1)} Routes</h3>
          </div>
          {routes.map(route => (
            <RouteCard key={route.id} route={route} isSelected={selectedRoute?.id === route.id} onSelect={setSelectedRoute} />
          ))}
          
          {selectedRoute && (
            <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-20 flex gap-2">
              <button 
                onClick={() => setIsNavigating(true)}
                className={`flex-1 ${currentTheme.bgClass} text-white py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all`}
              >
                <Icons.Safety />
                Start Map
              </button>
              <button 
                onClick={startCallMode}
                className="bg-indigo-900 text-white p-5 rounded-2xl shadow-xl flex items-center justify-center active:scale-[0.98] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && routes.length === 0 && (
        <div className="space-y-6">
          <div className={`bg-gradient-to-br ${currentTheme.gradient} p-6 rounded-3xl text-white shadow-lg`}>
            <h3 className="text-xl font-bold mb-2">{currentTheme.label} Active</h3>
            <p className="text-white text-opacity-80 text-sm mb-4">Routes prioritized for your security and comfort.</p>
            <button onClick={triggerPanic} className="bg-red-500 hover:bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-lg">SOS PANIC</button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 px-1">Nearby Alerts</h3>
            {safetyAlerts.map(alert => (
              <div key={alert.id} className="bg-white border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-start gap-3">
                <div className="bg-red-50 p-2 rounded-lg text-red-500"><Icons.Alert /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{alert.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="p-4 space-y-6 pb-24">
      <div className={`bg-gradient-to-br ${currentTheme.gradient} p-6 rounded-3xl text-white shadow-lg`}>
        <h2 className="text-2xl font-black mb-2">Area Insights</h2>
        <p className="text-sm text-white/80 leading-relaxed">{areaInsight}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-800">Community Tips</h3>
          <button className={`text-xs font-bold ${currentTheme.textClass}`}>+ Add Tip</button>
        </div>

        {[
          { id: '1', user: 'Maria', text: 'Streetlight on 4th and Main is flickering. Stay on the North sidewalk.', category: 'safety', upvotes: 12, time: '2h ago' },
          { id: '2', user: 'Jason', text: 'Central Metro elevator (South entrance) is operational again.', category: 'accessibility', upvotes: 45, time: '5h ago' },
          { id: '3', user: 'Elena', text: 'Bus stop #412 feels isolated after 10 PM. Better to walk to the plaza stop.', category: 'safety', upvotes: 8, time: '1d ago' },
        ].map(tip => (
          <div key={tip.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{tip.user[0]}</div>
                <span className="text-xs font-bold text-slate-700">{tip.user}</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400">{tip.time}</span>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tip.category === 'safety' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {tip.category}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{tip.text}</p>
            <div className="flex items-center gap-1.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-xs font-bold">{tip.upvotes}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
        <div className="bg-indigo-600 p-3 rounded-xl text-white">
          <Icons.Safety />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 text-sm">Security Heatmap</h4>
          <p className="text-xs text-indigo-600">View real-time crowd and lighting data</p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center py-6">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentTheme.gradient} mx-auto border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-black`}>
          {userProfile.name[0]}
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-800">{userProfile.name}</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Identity Setting</label>
          <div className="flex gap-2">
            {['woman', 'man', 'other'].map(g => (
              <button key={g} onClick={() => setUserProfile(p => ({ ...p, gender: g as any }))} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border-2 ${userProfile.gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Emergency Contacts (Max 4)</label>
          <div className="grid grid-cols-2 gap-2">
            {userProfile.emergencyContacts.map((contact, idx) => (
              <input 
                key={idx} type="tel" placeholder={`Contact ${idx + 1}`}
                value={contact}
                onChange={(e) => {
                  const newContacts = [...userProfile.emergencyContacts];
                  newContacts[idx] = e.target.value;
                  setUserProfile(p => ({ ...p, emergencyContacts: newContacts }));
                }}
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs focus:ring-1 focus:ring-red-400 outline-none"
              />
            ))}
          </div>
        </div>

        <button onClick={triggerPanic} className="w-full bg-red-600 text-white py-4 rounded-xl font-black shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2">
          <Icons.Alert /> TEST PANIC SOS
        </button>
      </div>
    </div>
  );

  if (isPanicMode) return renderPanicOverlay();
  if (isCallMode) return renderCallOverlay();
  if (isNavigating) return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 bg-slate-800 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setIsNavigating(false)} className="p-2 hover:bg-slate-700 rounded-full"><Icons.Alert /></button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-indigo-400 uppercase">NAVIGATING</span>
            <span className="text-lg font-bold">Follow {currentTheme.label}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={startCallMode} className="bg-indigo-600 p-3 rounded-2xl"><Icons.Car /></button>
            <button onClick={triggerPanic} className="bg-red-600 p-3 rounded-2xl animate-pulse"><Icons.Alert /></button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-slate-200 relative">
        <img src="https://picsum.photos/800/800?grayscale" className="w-full h-full object-cover opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className={`w-8 h-8 ${currentTheme.bgClass} rounded-full border-4 border-white shadow-xl animate-pulse`} />
        </div>
      </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} userProfile={userProfile}>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'insights' && renderInsights()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'shenav' && (
        <div className="p-4 space-y-6 pb-24">
           <div className={`bg-gradient-to-br ${currentTheme.gradient} p-6 rounded-3xl text-white shadow-xl`}>
             <h2 className="text-2xl font-black mb-2">{currentTheme.label} Hub</h2>
             <p className="text-sm text-white/80 leading-relaxed mb-6">Connect with local travelers on overlapping routes for enhanced safety.</p>
             <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black shadow-lg">FIND COMPANIONS</button>
           </div>
           <div className="space-y-4">
              <h3 className="font-bold text-slate-800 px-1">Active Groups</h3>
              {[
                { title: 'Central Station Link', mode: 'Walking', overlap: '95%' },
                { title: 'Market Plaza Escort', mode: 'Metro', overlap: '80%' },
              ].map(group => (
                <div key={group.title} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className={`p-3 rounded-xl bg-slate-100 ${currentTheme.textClass}`}>
                       {group.mode === 'Walking' ? <Icons.Walking /> : <Icons.Metro />}
                     </div>
                     <p className="font-bold text-sm text-slate-800">{group.title}</p>
                   </div>
                   <button className={`text-xs font-bold ${currentTheme.textClass} bg-slate-50 px-4 py-2 rounded-lg`}>JOIN</button>
                </div>
              ))}
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
