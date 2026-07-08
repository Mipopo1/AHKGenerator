import React, { useRef, useState } from 'react';
import { AHKProfile, KeyMapping, Macro } from '../types';
import { Settings, Download, Upload, Sliders, Layout, RefreshCw, Layers } from 'lucide-react';

interface ProfileManagerProps {
  profile: AHKProfile;
  onChangeProfile: (profile: AHKProfile) => void;
}

export default function ProfileManager({ profile, onChangeProfile }: ProfileManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Update specific top-level fields
  const handleUpdateField = (field: keyof AHKProfile, value: any) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  // Update setting fields
  const handleUpdateSetting = (settingKey: keyof AHKProfile['settings'], value: any) => {
    let doublePressTimeout = profile.settings.doublePressTimeout;
    let triplePressTimeout = profile.settings.triplePressTimeout;
    let holdDuration = profile.settings.holdDuration;
    let ahkVersion = profile.settings.ahkVersion;

    if (settingKey === 'doublePressTimeout') {
      doublePressTimeout = value;
      if (doublePressTimeout >= holdDuration) {
        holdDuration = doublePressTimeout + 10;
      }
    } else if (settingKey === 'triplePressTimeout') {
      triplePressTimeout = value;
      if (triplePressTimeout >= holdDuration) {
        holdDuration = triplePressTimeout + 10;
      }
    } else if (settingKey === 'holdDuration') {
      holdDuration = value;
      const maxTap = Math.max(doublePressTimeout, triplePressTimeout);
      if (holdDuration <= maxTap) {
        doublePressTimeout = Math.min(doublePressTimeout, holdDuration - 10);
        triplePressTimeout = Math.min(triplePressTimeout, holdDuration - 10);
      }
    } else if (settingKey === 'ahkVersion') {
      ahkVersion = value;
    }

    onChangeProfile({
      ...profile,
      settings: {
        doublePressTimeout,
        triplePressTimeout,
        holdDuration,
        ahkVersion,
      },
    });
  };

  // Backup configuration as JSON File
  const handleExportJSON = () => {
    const filename = `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'ahk_config'}.json`;
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import configuration JSON File
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic schema verification
        if (json && typeof json === 'object' && json.mappings && json.settings) {
          onChangeProfile({
            name: json.name || 'Imported Profile',
            description: json.description || 'Imported via JSON upload',
            settings: {
              doublePressTimeout: json.settings.doublePressTimeout ?? 180,
              triplePressTimeout: json.settings.triplePressTimeout ?? 180,
              holdDuration: json.settings.holdDuration ?? 250,
              ahkVersion: json.settings.ahkVersion ?? 'v2',
            },
            mappings: json.mappings || {},
            macros: json.macros || [],
          });
        } else {
          alert('Invalid file format. Please upload a valid AHK Mapper profile JSON backup.');
        }
      } catch (err) {
        alert('Failed to parse JSON configuration file. Please ensure it is intact.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImportJSON(e.target.files[0]);
    }
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImportJSON(e.dataTransfer.files[0]);
    }
  };

  // Templates Definitions
  const applyPresetTemplate = (presetType: 'gamer' | 'wasd_media' | 'capslock_nav' | 'blank') => {
    let presetName = '';
    let presetDesc = '';
    let presetMappings: Record<string, KeyMapping> = {};
    let presetMacros: Macro[] = [];

    if (presetType === 'wasd_media') {
      presetName = 'Media WASD Remapper';
      presetDesc = 'Converts WASD to navigation keys, volume control, and media playback actions.';
      
      presetMappings = {
        'w': {
          keyName: 'w',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: true, actionType: 'key', targetKey: 'Volume_Up', targetMacroId: '' },
        },
        's': {
          keyName: 's',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: true, actionType: 'key', targetKey: 'Volume_Down', targetMacroId: '' },
        },
        'a': {
          keyName: 'a',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: true, actionType: 'key', targetKey: 'Media_Prev', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
        },
        'd': {
          keyName: 'd',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: true, actionType: 'key', targetKey: 'Media_Next', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
        },
        'Space': {
          keyName: 'Space',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: true, actionType: 'key', targetKey: 'Media_Play_Pause', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
        }
      };
    } else if (presetType === 'capslock_nav') {
      presetName = 'CapsNav (Vim Mode)';
      presetDesc = 'Turns Caps Lock into navigation arrows and volume controls using hold modifiers.';
      presetMappings = {
        'CapsLock': {
          keyName: 'CapsLock',
          single: { enabled: true, actionType: 'key', targetKey: 'CapsLock', targetMacroId: '' }, // single tap preserves original Capslock
          double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: true, actionType: 'key', targetKey: 'AppsKey', targetMacroId: '' }, // Hold Capslock triggers the Menu/AppsKey
        },
        'h': {
          keyName: 'h',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: true, actionType: 'key', targetKey: 'Left', targetMacroId: '' },
        },
        'j': {
          keyName: 'j',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: true, actionType: 'key', targetKey: 'Down', targetMacroId: '' },
        },
        'k': {
          keyName: 'k',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: true, actionType: 'key', targetKey: 'Up', targetMacroId: '' },
        },
        'l': {
          keyName: 'l',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: true, actionType: 'key', targetKey: 'Right', targetMacroId: '' },
        }
      };
    } else if (presetType === 'gamer') {
      presetName = 'Gamer Utility Presets';
      presetDesc = 'Enables double tap and triple tap macro sequences for rapid actions.';
      
      presetMacros = [
        {
          id: 'macro_rapid_clicks',
          name: 'Spam Left Click x3',
          description: 'Fires three quick mouse clicks with slight delays.',
          steps: [
            { type: 'click', button: 'left' },
            { type: 'delay', duration: 40 },
            { type: 'click', button: 'left' },
            { type: 'delay', duration: 40 },
            { type: 'click', button: 'left' }
          ]
        },
        {
          id: 'macro_chat_gg',
          name: 'Chat GG EZ',
          description: 'Quickly opens in-game chat, types gg ez, and presses enter.',
          steps: [
            { type: 'keydown', key: 'Enter' },
            { type: 'delay', duration: 50 },
            { type: 'keyup', key: 'Enter' },
            { type: 'delay', duration: 100 },
            { type: 'text', text: 'GG WP everyone!' },
            { type: 'delay', duration: 50 },
            { type: 'keydown', key: 'Enter' },
            { type: 'delay', duration: 50 },
            { type: 'keyup', key: 'Enter' }
          ]
        }
      ];

      presetMappings = {
        'F1': {
          keyName: 'F1',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: true, actionType: 'macro', targetKey: '', targetMacroId: 'macro_rapid_clicks' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
        },
        'g': {
          keyName: 'g',
          single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
          double: { enabled: true, actionType: 'macro', targetKey: '', targetMacroId: 'macro_chat_gg' },
          triple: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
          hold: { enabled: false, actionType: 'none', targetKey: '', targetMacroId: '' },
        }
      };
    } else {
      presetName = 'My AHK Profile';
      presetDesc = 'A blank profile template to start designing from scratch.';
      presetMappings = {};
      presetMacros = [];
    }

    onChangeProfile({
      name: presetName,
      description: presetDesc,
      settings: {
        doublePressTimeout: 180,
        triplePressTimeout: 180,
        holdDuration: 250,
        ahkVersion: 'v2',
      },
      mappings: presetMappings,
      macros: presetMacros,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Profile Info & Core Settings */}
      <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans text-base font-semibold text-zinc-100">Profile Details</h3>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 font-medium mb-1.5 font-sans">
              Profile Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleUpdateField('name', e.target.value)}
              className="w-full bg-[#0c0c0e] border border-white/[0.06] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-zinc-200 text-xs rounded-lg py-2 px-3 outline-none transition"
              placeholder="E.g., Gamer Pro Layout"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 font-medium mb-1.5 font-sans">
              Description
            </label>
            <textarea
              rows={3}
              value={profile.description}
              onChange={(e) => handleUpdateField('description', e.target.value)}
              className="w-full bg-[#0c0c0e] border border-white/[0.06] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-zinc-200 text-xs rounded-lg py-2 px-3 outline-none resize-none transition"
              placeholder="Enter details on what keys are remapped in this layout."
            />
          </div>

          {/* Toggle AHK Version */}
          <div>
            <label className="block text-[11px] text-zinc-400 font-medium mb-2 font-sans">
              Target AutoHotkey Compiler Version
            </label>
            <div className="flex gap-2 p-1 bg-[#0c0c0e] border border-white/[0.04] rounded-xl">
              <button
                onClick={() => handleUpdateSetting('ahkVersion', 'v2')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg font-sans transition cursor-pointer ${
                  profile.settings.ahkVersion === 'v2'
                    ? 'bg-zinc-800 text-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.35)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                AutoHotkey v2.0 (Modern)
              </button>
              <button
                onClick={() => handleUpdateSetting('ahkVersion', 'v1')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg font-sans transition cursor-pointer ${
                  profile.settings.ahkVersion === 'v1'
                    ? 'bg-zinc-800 text-amber-400 shadow-[0_2px_8px_rgba(0,0,0,0.35)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                AutoHotkey v1.1 (Legacy)
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-[11px] text-zinc-500 border-t border-white/[0.06] pt-4 mt-4 leading-relaxed font-sans">
          AutoHotkey v2 supports modular scopes, strict variable declarations, and improved thread safety over v1.1. It is recommended for new script development.
        </div>
      </div>

      {/* Global Timing Configuration */}
      <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans text-base font-semibold text-zinc-100">Global Timing Engine</h3>
          </div>

          <div className="space-y-4">
            {/* Double Press */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] text-zinc-300 font-medium font-sans">
                  Double Tap Timeout
                </label>
                <span className="text-xs font-mono font-semibold text-indigo-300">
                  {profile.settings.doublePressTimeout}ms
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={profile.settings.doublePressTimeout}
                onChange={(e) => handleUpdateSetting('doublePressTimeout', parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-[#0c0c0e] h-1 rounded-lg cursor-pointer"
              />
              <span className="block text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Max delay allowed between first and second tap to register a Double-Click.
              </span>
            </div>

            {/* Triple Press */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] text-zinc-300 font-medium font-sans">
                  Triple Tap Timeout
                </label>
                <span className="text-xs font-mono font-semibold text-indigo-300">
                  {profile.settings.triplePressTimeout}ms
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={profile.settings.triplePressTimeout}
                onChange={(e) => handleUpdateSetting('triplePressTimeout', parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-[#0c0c0e] h-1 rounded-lg cursor-pointer"
              />
              <span className="block text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Max delay allowed between second and third tap to register a Triple-Click.
              </span>
            </div>

            {/* Hold Duration */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] text-zinc-300 font-medium font-sans">
                  Press &amp; Hold Threshold
                </label>
                <span className="text-xs font-mono font-semibold text-indigo-300">
                  {profile.settings.holdDuration}ms
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="1000"
                step="10"
                value={profile.settings.holdDuration}
                onChange={(e) => handleUpdateSetting('holdDuration', parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-[#0c0c0e] h-1 rounded-lg cursor-pointer"
              />
              <span className="block text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Physical duration required to press and hold down a key to execute hold actions.
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 border-t border-white/[0.06] pt-4 mt-4 leading-relaxed font-sans">
          These timings act as global defaults. You can override these per-key by editing individual key overrides.
        </div>
      </div>

      {/* Profile Backup & Import & Presets */}
      <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="w-5 h-5 text-indigo-450" />
            <h3 className="font-sans text-base font-semibold text-zinc-100">Export / Import &amp; Presets</h3>
          </div>

          {/* Quick Preset Application */}
          <div>
            <label className="block text-[11px] text-zinc-400 font-medium mb-2 font-sans">
              Load Preset Template Configuration
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => applyPresetTemplate('wasd_media')}
                className="py-2 px-2.5 bg-[#0c0c0e] hover:bg-[#18181c] border border-white/[0.06] hover:border-indigo-500/30 text-zinc-300 hover:text-indigo-250 rounded-xl transition text-[11px] font-semibold text-left font-sans flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                WASD Media
              </button>
              <button
                onClick={() => applyPresetTemplate('capslock_nav')}
                className="py-2 px-2.5 bg-[#0c0c0e] hover:bg-[#18181c] border border-white/[0.06] hover:border-indigo-500/30 text-zinc-300 hover:text-indigo-250 rounded-xl transition text-[11px] font-semibold text-left font-sans flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                CapsNav Vim
              </button>
              <button
                onClick={() => applyPresetTemplate('gamer')}
                className="py-2 px-2.5 bg-[#0c0c0e] hover:bg-[#18181c] border border-white/[0.06] hover:border-indigo-500/30 text-zinc-300 hover:text-indigo-250 rounded-xl transition text-[11px] font-semibold text-left font-sans flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Gamer Macros
              </button>
              <button
                onClick={() => applyPresetTemplate('blank')}
                className="py-2 px-2.5 bg-[#0c0c0e] hover:bg-[#18181c] border border-white/[0.06] hover:border-indigo-500/30 text-zinc-450 hover:text-zinc-200 rounded-xl transition text-[11px] font-semibold text-left font-sans flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Blank
              </button>
            </div>
          </div>

          {/* Backup Action buttons */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={handleExportJSON}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center gap-2 transition duration-150 font-semibold text-xs font-sans shadow shadow-indigo-950/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Backup Profile (JSON)
            </button>

            {/* Drag & Drop JSON Import Target */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center
                ${dragActive 
                  ? 'bg-indigo-950/20 border-indigo-500' 
                  : 'bg-[#0c0c0e]/30 border-white/[0.06] hover:border-white/[0.12] hover:bg-[#0c0c0e]/55'
                }
              `}
            >
              <Upload className="w-5 h-5 text-zinc-500 mb-1" />
              <span className="text-[11px] text-zinc-300 font-semibold font-sans">
                {dragActive ? 'Drop file here' : 'Import Profile Backup'}
              </span>
              <span className="text-[9px] text-zinc-500 font-sans mt-0.5">
                Drag-and-drop or click to browse (.json)
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 border-t border-white/[0.06] pt-4 mt-4 leading-relaxed font-sans">
          Download your JSON file to save profiles locally or share them with others! Import any profile JSON anytime to resume mapping.
        </div>
      </div>
    </div>
  );
}
