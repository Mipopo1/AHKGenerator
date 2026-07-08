import React, { useState, useEffect } from 'react';
import { AHKProfile, KeyMapping, Macro } from './types';
import KeyboardVisualizer from './components/KeyboardVisualizer';
import MappingEditor from './components/MappingEditor';
import MacroBuilder from './components/MacroBuilder';
import ProfileManager from './components/ProfileManager';
import ScriptPreview from './components/ScriptPreview';
import { 
  Keyboard, 
  Sliders, 
  Play, 
  HelpCircle, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  MousePointer, 
  Volume2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

// Pre-loaded DEFAULT templates
const DEFAULT_PROFILES: AHKProfile[] = [
  {
    name: 'Default Profile',
    description: 'A clean slate for your custom keyboard mappings.',
    settings: {
      doublePressTimeout: 180,
      triplePressTimeout: 180,
      holdDuration: 250,
      ahkVersion: 'v2',
    },
    macros: [],
    mappings: {},
  }
];

const SPECIAL_KEYS = [
  { keyName: 'Volume_Up', display: 'Volume Up 🔊' },
  { keyName: 'Volume_Down', display: 'Volume Down 🔉' },
  { keyName: 'Volume_Mute', display: 'Volume Mute 🔇' },
  { keyName: 'Media_Play_Pause', display: 'Media Play/Pause ⏯️' },
  { keyName: 'Media_Next', display: 'Media Next ⏭️' },
  { keyName: 'Media_Prev', display: 'Media Prev ⏮️' },
  { keyName: 'LButton', display: 'Mouse Left Click 🖱️' },
  { keyName: 'RButton', display: 'Mouse Right Click 🖱️' },
  { keyName: 'MButton', display: 'Mouse Middle Click 🖱️' },
  { keyName: 'XButton1', display: 'Mouse Back (Side 1) ◀' },
  { keyName: 'XButton2', display: 'Mouse Forward (Side 2) ▶' },
  { keyName: 'WheelUp', display: 'Mouse Scroll Up 🔼' },
  { keyName: 'WheelDown', display: 'Mouse Scroll Down 🔽' },
  { keyName: 'Browser_Back', display: 'Browser Back ⬅️' },
  { keyName: 'Browser_Forward', display: 'Browser Forward ➡️' },
  { keyName: 'Browser_Refresh', display: 'Browser Refresh 🔄' },
];

export default function App() {
  // Current major layout tab selection
  const [activeMainTab, setActiveMainTab] = useState<'designer' | 'macros' | 'profile'>('designer');

  // Currently selected key in the keyboard designer
  const [selectedKey, setSelectedKey] = useState<string | null>('CapsLock');

  // Support multiple profiles in state
  const [profiles, setProfiles] = useState<AHKProfile[]>(() => {
    const saved = localStorage.getItem('ahk_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback to default template
      }
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileIndex, setActiveProfileIndex] = useState<number>(() => {
    const savedIdx = localStorage.getItem('ahk_active_profile_index');
    if (savedIdx) {
      const parsed = parseInt(savedIdx);
      if (!isNaN(parsed) && parsed >= 0 && parsed < profiles.length) {
        return parsed;
      }
    }
    return 0;
  });

  // Derived current active profile
  const profile = profiles[activeProfileIndex] || profiles[0] || DEFAULT_PROFILES[0];

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [tempRenameValue, setTempRenameValue] = useState('');

  // Keep localStorage sync'd up
  useEffect(() => {
    localStorage.setItem('ahk_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('ahk_active_profile_index', activeProfileIndex.toString());
  }, [activeProfileIndex]);

  // Helper setProfile equivalent that modifies the active profile in our profiles array
  const setProfile = (updater: AHKProfile | ((prev: AHKProfile) => AHKProfile)) => {
    setProfiles((prev) => {
      const next = [...prev];
      const current = next[activeProfileIndex] || prev[0];
      const updated = typeof updater === 'function' ? updater(current) : updater;
      next[activeProfileIndex] = updated;
      return next;
    });
  };

  // Save/Update mapping for a specific key
  const handleSaveMapping = (keyName: string, updatedMapping: KeyMapping) => {
    setProfile((prev) => {
      const isSingleNone = updatedMapping.single.actionType === 'none' || !updatedMapping.single.enabled;
      const isDoubleNone = !updatedMapping.double.enabled || updatedMapping.double.actionType === 'none';
      const isTripleNone = !updatedMapping.triple.enabled || updatedMapping.triple.actionType === 'none';
      const isHoldNone = !updatedMapping.hold.enabled || updatedMapping.hold.actionType === 'none';

      if (isSingleNone && isDoubleNone && isTripleNone && isHoldNone) {
        const updatedMappings = { ...prev.mappings };
        delete updatedMappings[keyName];
        return {
          ...prev,
          mappings: updatedMappings,
        };
      }

      return {
        ...prev,
        mappings: {
          ...prev.mappings,
          [keyName]: updatedMapping,
        },
      };
    });
  };

  // Clear all mappings for a specific key
  const handleClearMapping = (keyName: string) => {
    setProfile((prev) => {
      const updatedMappings = { ...prev.mappings };
      delete updatedMappings[keyName];
      return {
        ...prev,
        mappings: updatedMappings,
      };
    });
  };

  // Update all custom macros
  const handleUpdateMacros = (newMacros: Macro[]) => {
    setProfile((prev) => ({
      ...prev,
      macros: newMacros,
    }));
  };

  // Handle adding custom special key
  const handleCaptureSpecialKey = (keyName: string) => {
    if (!keyName) return;
    setProfile((prev) => {
      if (prev.mappings[keyName]) return prev; // already exists
      return {
        ...prev,
        mappings: {
          ...prev.mappings,
          [keyName]: {
            keyName,
            single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
            double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
            triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
            hold: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          },
        },
      };
    });
    setSelectedKey(keyName);
  };

  // Create new blank profile
  const handleCreateProfile = () => {
    const newProfile: AHKProfile = {
      name: `Profile ${profiles.length + 1}`,
      description: 'A custom remapping layout.',
      settings: {
        doublePressTimeout: 180,
        triplePressTimeout: 180,
        holdDuration: 250,
        ahkVersion: 'v2',
      },
      mappings: {},
      macros: [],
    };
    const nextProfiles = [...profiles, newProfile];
    setProfiles(nextProfiles);
    setActiveProfileIndex(nextProfiles.length - 1);
  };

  // Delete profile
  const handleDeleteProfile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) return;
    const nextProfiles = profiles.filter((_, idx) => idx !== index);
    setProfiles(nextProfiles);
    
    // Adjust active index
    if (activeProfileIndex >= nextProfiles.length) {
      setActiveProfileIndex(nextProfiles.length - 1);
    } else if (activeProfileIndex === index) {
      setActiveProfileIndex(0);
    }
  };

  // Start renaming a profile
  const startRenaming = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingIndex(index);
    setTempRenameValue(profiles[index].name);
  };

  // Save renamed profile
  const saveRename = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!tempRenameValue.trim()) return;
    setProfiles((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], name: tempRenameValue.trim() };
      }
      return next;
    });
    setRenamingIndex(null);
  };

  // Cancel renaming
  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingIndex(null);
  };

  // Calculate stats for header indicators
  const totalMappedKeys = Object.keys(profile.mappings).length;
  const totalMacros = profile.macros.length;

  // Find all remapped keys that have at least one active custom trigger
  const customRemappedKeys = Object.keys(profile.mappings).filter((keyName) => {
    const m = profile.mappings[keyName];
    if (!m) return false;
    return (
      (m.single.enabled && m.single.actionType !== 'none') ||
      (m.double.enabled && m.double.actionType !== 'none') ||
      (m.triple.enabled && m.triple.actionType !== 'none') ||
      (m.hold.enabled && m.hold.actionType !== 'none')
    );
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-200 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-white/[0.06] bg-[#0c0c0e]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-mono text-base font-bold text-white">AHK</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-baseline gap-2">
                AHK Mapper &amp; Macro Studio
                <span className="text-[9px] bg-indigo-950/50 text-indigo-300 font-bold border border-indigo-500/30 rounded px-2 py-0.5 uppercase tracking-wide">
                  Beta
                </span>
              </h1>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Generate custom multi-press behaviors, timing configurations, and keyboard remappings for AutoHotkey.
              </p>
            </div>
          </div>

          {/* Active Profile Dropdown Container */}
          <div className="flex items-center gap-4 text-xs font-sans w-full sm:w-auto justify-end">
            {/* Custom Active Profile Dropdown */}
            <div className="relative">
              <button
                id="btn-active-profile-dropdown"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="bg-[#16161a] hover:bg-[#1f1f25] border border-white/[0.08] px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs text-zinc-200 transition duration-150 shadow-md cursor-pointer select-none font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active Profile: <strong className="text-white font-semibold">{profile.name}</strong></span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setRenamingIndex(null);
                    }}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-[#121215] border border-white/[0.08] rounded-2xl shadow-2xl p-2.5 z-50 animate-fade-in space-y-1">
                    <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
                      {profiles.map((p, idx) => {
                        const isActive = idx === activeProfileIndex;
                        const isEditing = idx === renamingIndex;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (!isEditing) {
                                setActiveProfileIndex(idx);
                                setIsProfileDropdownOpen(false);
                              }
                            }}
                            className={`
                              group w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left transition duration-150 cursor-pointer relative
                              ${isActive ? 'bg-indigo-950/40 text-indigo-200 border border-indigo-500/10' : 'hover:bg-white/[0.03] text-zinc-300'}
                            `}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={tempRenameValue}
                                  onChange={(e) => setTempRenameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveRename(idx);
                                    if (e.key === 'Escape') setRenamingIndex(null);
                                  }}
                                  className="bg-zinc-900 border border-indigo-500/50 text-white text-xs rounded-md px-2 py-1 outline-none flex-1 font-sans"
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => saveRename(idx, e)}
                                  className="p-1 text-emerald-400 hover:bg-zinc-800 rounded transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelRename}
                                  className="p-1 text-rose-400 hover:bg-zinc-800 rounded transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="font-medium truncate max-w-[150px]">{p.name}</span>

                                {/* Rename and Delete Tools (displayed on hover of row) */}
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-2 shrink-0">
                                  <button
                                    onClick={(e) => startRenaming(idx, e)}
                                    title="Rename Profile"
                                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-400 transition"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  {profiles.length > 1 && (
                                    <button
                                      onClick={(e) => handleDeleteProfile(idx, e)}
                                      title="Delete Profile"
                                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-rose-400 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-white/[0.05] pt-2 mt-2">
                      <button
                        onClick={() => {
                          handleCreateProfile();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full py-2 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create New Profile
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-white/[0.06]">
          <div className="flex gap-1.5 bg-[#121215] border border-white/[0.06] p-1 rounded-xl">
            <button
              id="tab-designer"
              onClick={() => setActiveMainTab('designer')}
              className={`flex items-center gap-2 px-4.5 py-2 text-xs font-medium rounded-lg font-sans transition-all duration-150 select-none cursor-pointer ${
                activeMainTab === 'designer'
                  ? 'bg-zinc-800 text-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/5'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
              Keyboard Remapper
            </button>
            
            <button
              id="tab-macros"
              onClick={() => setActiveMainTab('macros')}
              className={`flex items-center gap-2 px-4.5 py-2 text-xs font-medium rounded-lg font-sans transition-all duration-150 select-none cursor-pointer ${
                activeMainTab === 'macros'
                  ? 'bg-zinc-800 text-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/5'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              Macro Studio
            </button>

            <button
              id="tab-profile"
              onClick={() => setActiveMainTab('profile')}
              className={`flex items-center gap-2 px-4.5 py-2 text-xs font-medium rounded-lg font-sans transition-all duration-150 select-none cursor-pointer ${
                activeMainTab === 'profile'
                  ? 'bg-zinc-800 text-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-white/5'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Preferences
            </button>
          </div>
        </div>

        {/* 1. KEYBOARD DESIGNER FLOW */}
        {activeMainTab === 'designer' && (
          <div className="space-y-8 animate-fade-in">
            {/* Visual Keyboard Visualizer with Panning */}
            <KeyboardVisualizer
              mappings={profile.mappings}
              selectedKey={selectedKey}
              onSelectKey={(k) => setSelectedKey(k)}
              onCaptureSpecialKey={handleCaptureSpecialKey}
            />

            {/* Main Designer Grid (Mapping Editor on Left, Custom Keymappings Sidebar on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Active Key Editor */}
              <div className="lg:col-span-8 space-y-8">
                {selectedKey ? (
                  <MappingEditor
                    keyName={selectedKey}
                    mapping={profile.mappings[selectedKey]}
                    macros={profile.macros}
                    onSaveMapping={handleSaveMapping}
                    onClearMapping={handleClearMapping}
                    profileSettings={profile.settings}
                  />
                ) : (
                  <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-10 shadow-2xl text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Keyboard className="w-12 h-12 text-zinc-700 mb-3" />
                    <p className="text-sm font-semibold text-zinc-400">No Key Selected</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm font-sans">
                      Click on any physical key on the virtual keyboard above to select and edit its tap, hold, double, or triple-press actions!
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Custom Keymappings Sidebar */}
              <div className="lg:col-span-4 bg-[#121215] border border-white/[0.06] rounded-2xl p-5 shadow-xl space-y-6">
                {/* Instant Collapsible Script Preview Panel */}
                <ScriptPreview profile={profile} />

                {/* Section B: Remapped Keys list */}
                <div className="border-t border-white/[0.05] pt-4.5">
                  <h4 className="font-sans text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Remapped Keys List</span>
                    <span className="text-[10px] bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">
                      {customRemappedKeys.length} Custom
                    </span>
                  </h4>

                  {customRemappedKeys.length === 0 ? (
                    <div className="text-center py-8 bg-[#0c0c0e]/30 rounded-xl border border-dashed border-white/[0.04]">
                      <p className="text-xs text-zinc-500 font-sans">No keys remapped yet.</p>
                      <p className="text-[11px] text-zinc-600 mt-1 font-sans">Click on any key above to start customizing.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {customRemappedKeys.map((k) => {
                        const m = profile.mappings[k];
                        const triggers: string[] = [];
                        if (m.single.enabled && m.single.actionType !== 'none') triggers.push('Single');
                        if (m.double.enabled && m.double.actionType !== 'none') triggers.push('Double');
                        if (m.triple.enabled && m.triple.actionType !== 'none') triggers.push('Triple');
                        if (m.hold.enabled && m.hold.actionType !== 'none') triggers.push('Hold');

                        const isSelected = selectedKey === k;

                        return (
                          <div
                            key={k}
                            onClick={() => setSelectedKey(k)}
                            className={`
                              w-full px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition duration-150 cursor-pointer
                              ${isSelected 
                                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-200' 
                                : 'bg-[#18181c]/60 border-white/[0.04] hover:bg-[#1f1f25]/50 text-zinc-300 hover:border-zinc-700/40'
                              }
                            `}
                          >
                            <div className="flex flex-col gap-0.5 font-mono">
                              <span className="font-bold text-white">[{k}]</span>
                              <span className="text-[10px] text-zinc-500">{triggers.join(', ')}</span>
                            </div>

                            <button
                              id={`btn-sidebar-delete-${k}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearMapping(k);
                                if (selectedKey === k) setSelectedKey(null);
                              }}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/50 rounded-lg transition shrink-0"
                              title="Delete Mapping"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MACROS FLOW */}
        {activeMainTab === 'macros' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-8">
              <MacroBuilder
                macros={profile.macros}
                onChangeMacros={handleUpdateMacros}
              />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <ScriptPreview profile={profile} />
            </div>
          </div>
        )}

        {/* 3. PROFILE CONFIG/PREFERENCES FLOW */}
        {activeMainTab === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            <ProfileManager
              profile={profile}
              onChangeProfile={(updated) => setProfile(updated)}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-sans text-base font-semibold text-zinc-200">Getting Started Guide</h3>
                  </div>

                  <div className="space-y-3.5 text-xs text-zinc-400 leading-relaxed font-sans">
                    <p>
                      <strong>AutoHotkey (AHK)</strong> is an incredibly powerful free, open-source scripting language for Windows that allows you to automate repetitive tasks and completely remap keyboard, mouse, and game controllers.
                    </p>
                    <p>
                      This interactive utility lets you design premium **multiple-trigger remappings** that normally require writing hundreds of lines of complex timing logic in AHK yourself:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                      <li><strong>Single Tap (Simple Replace)</strong>: Pressing a physical key sends another key or macro instantly.</li>
                      <li><strong>Double Tap</strong>: Double-press a physical key rapidly to fire another custom action.</li>
                      <li><strong>Triple Tap</strong>: Fire another action when you triple-press a key rapidly.</li>
                      <li><strong>Press &amp; Hold</strong>: Hold a key down for a custom duration (e.g. 250ms) to trigger a secondary function, and let go to finish.</li>
                    </ul>
                    <p>
                      <strong>How to use the output:</strong>
                    </p>
                    <ol className="list-decimal pl-5 space-y-1.5 text-zinc-400">
                      <li>Use the <strong>Keyboard Designer</strong> tab to add triggers to keys.</li>
                      <li>Use the <strong>Macro Studio</strong> to design advanced click sequences or text typers.</li>
                      <li>Copy or download the generated <code>.ahk</code> script and run it on your Windows desktop!</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <ScriptPreview profile={profile} />
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
