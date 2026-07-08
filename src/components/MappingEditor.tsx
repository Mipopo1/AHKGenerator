import React, { useState, useEffect } from 'react';
import { KeyMapping, TriggerState, TriggerType, Macro, ActionType } from '../types';
import { ALL_TARGET_KEYS } from '../data/keyboardKeys';
import { mapKeyboardEventToAhkKey } from '../utils/keyDetector';
import { Settings, HelpCircle, AlertCircle, Sparkles, Keyboard } from 'lucide-react';

interface MappingEditorProps {
  keyName: string;
  mapping: KeyMapping | undefined;
  macros: Macro[];
  onSaveMapping: (keyName: string, updatedMapping: KeyMapping) => void;
  onClearMapping: (keyName: string) => void;
  profileSettings: {
    doublePressTimeout: number;
    triplePressTimeout: number;
    holdDuration: number;
  };
}

export default function MappingEditor({
  keyName,
  mapping,
  macros,
  onSaveMapping,
  onClearMapping,
  profileSettings,
}: MappingEditorProps) {
  // State for active trigger tab inside the mapping editor
  const [activeTab, setActiveTab] = useState<TriggerType>('single');
  const [isListening, setIsListening] = useState(false);

  // Default empty trigger state
  const defaultTriggerState = (): TriggerState => ({
    enabled: false,
    actionType: 'none',
    targetKey: '',
    targetMacroId: '',
  });

  // Current working mapping state (initialized from prop or created fresh)
  const currentMapping: KeyMapping = mapping || {
    keyName,
    single: { enabled: true, actionType: 'none', targetKey: '', targetMacroId: '' },
    double: defaultTriggerState(),
    triple: defaultTriggerState(),
    hold: defaultTriggerState(),
  };

  const handleUpdateTrigger = (trigger: TriggerType, updates: Partial<TriggerState>) => {
    let updatedTiming = updates.customTiming;
    if (updatedTiming !== undefined) {
      if (trigger === 'double' || trigger === 'triple') {
        const holdTime = currentMapping.hold.customTiming !== undefined 
          ? currentMapping.hold.customTiming 
          : profileSettings.holdDuration;
        if (updatedTiming >= holdTime) {
          updatedTiming = holdTime - 10;
        }
      } else if (trigger === 'hold') {
        const doubleTime = currentMapping.double.customTiming !== undefined
          ? currentMapping.double.customTiming
          : profileSettings.doublePressTimeout;
        const tripleTime = currentMapping.triple.customTiming !== undefined
          ? currentMapping.triple.customTiming
          : profileSettings.triplePressTimeout;
        const maxTap = Math.max(doubleTime, tripleTime);
        if (updatedTiming <= maxTap) {
          updatedTiming = maxTap + 10;
        }
      }
      updates.customTiming = updatedTiming;
    }

    const updatedMapping = {
      ...currentMapping,
      [trigger]: {
        ...currentMapping[trigger],
        ...updates,
      },
    };
    onSaveMapping(keyName, updatedMapping);
  };

  // Key detector effect to record live key presses
  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts or tab shifts
      e.preventDefault();
      e.stopPropagation();

      const detectedKey = mapKeyboardEventToAhkKey(e);
      if (detectedKey) {
        handleUpdateTrigger(activeTab, { targetKey: detectedKey });
        setIsListening(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isListening, activeTab, currentMapping]);

  const currentTriggerState = currentMapping[activeTab];

  // Tab definitions
  const tabs: { type: TriggerType; label: string }[] = [
    { type: 'single', label: 'Single Tap' },
    { type: 'double', label: 'Double Tap' },
    { type: 'triple', label: 'Triple Tap' },
    { type: 'hold', label: 'Press & Hold' },
  ];

  const categoryLabels: Record<string, string> = {
    alphanumeric: 'Alphanumeric Keys',
    modifier: 'Modifier Keys (Ctrl, Shift, etc)',
    function: 'Function / System Keys',
    navigation: 'Navigation & Arrow Keys',
    media: 'Media & Browser Controls',
    numpad: 'Numpad Keys',
    other: 'Special & Mouse Actions',
  };

  // Group ALL_TARGET_KEYS by category for cleaner dropdown selection
  const groupedTargetKeys = ALL_TARGET_KEYS.reduce((acc, key) => {
    if (!key || !key.keyName || key.keyName.trim() === '' || key.keyName.startsWith('spacer') || key.keyName.startsWith('nav-spacer') || key.keyName.startsWith('num-spacer')) {
      return acc;
    }
    const cat = key.category || 'other';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    if (!acc[cat].some((item) => item.keyName === key.keyName)) {
      acc[cat].push(key);
    }
    return acc;
  }, {} as Record<string, typeof ALL_TARGET_KEYS>);

  return (
    <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/45 border border-indigo-500/20 rounded-full px-2.5 py-1 uppercase tracking-wider font-mono">
              Key Mapping Engine
            </span>
            <h3 className="font-sans text-xl font-bold text-white mt-2.5 flex items-baseline gap-1.5">
              Configure Key:{' '}
              <span className="text-indigo-400 font-mono tracking-wide">[{keyName}]</span>
            </h3>
          </div>
          
          <button
            id={`btn-clear-key-${keyName}`}
            onClick={() => onClearMapping(keyName)}
            className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/10 px-3 py-1.5 rounded-lg hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/20 transition duration-150 cursor-pointer"
          >
            Clear All Triggers
          </button>
        </div>

        {/* Trigger Tabs Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0c0c0e] p-1.5 rounded-xl border border-white/[0.04] mb-5">
          {tabs.map((tab) => {
            const isTabActive = activeTab === tab.type;
            const state = currentMapping[tab.type];
            const isEnabled = state.enabled && state.actionType !== 'none';
            
            return (
              <button
                key={tab.type}
                id={`btn-tab-${tab.type}`}
                onClick={() => setActiveTab(tab.type)}
                className={`
                  py-2 px-1 text-center rounded-lg font-sans text-xs font-medium select-none cursor-pointer transition flex flex-col items-center justify-center gap-1
                  ${isTabActive 
                    ? 'bg-zinc-800 text-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-white/5' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]'
                  }
                `}
              >
                <div className="flex items-center gap-1">
                  <span>{tab.label}</span>
                  {isEnabled && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        <div className="bg-[#0c0c0e]/30 rounded-xl border border-white/[0.05] p-5 mb-5 relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-zinc-200 font-sans">
                {tabs.find((t) => t.type === activeTab)?.label} Trigger
              </h4>
            </div>

            {/* Toggle Enable checkbox (except single which is usually active if remapped, but we can enable/disable other triggers!) */}
            {activeTab !== 'single' && (
              <label className="flex items-center gap-2 cursor-pointer bg-[#18181c] border border-white/[0.06] px-3 py-1.5 rounded-lg select-none hover:border-zinc-700/60 transition duration-150">
                <input
                  type="checkbox"
                  checked={currentTriggerState.enabled}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    handleUpdateTrigger(activeTab, { 
                      enabled: isChecked,
                      actionType: isChecked && currentTriggerState.actionType === 'none' ? 'key' : currentTriggerState.actionType
                    });
                  }}
                  className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                />
                <span className="text-xs font-medium text-zinc-300 font-sans">Enabled</span>
              </label>
            )}
          </div>

          {/* Timing/Delay Warning for multi-press or hold */}
          {(activeTab === 'double' || activeTab === 'triple') && currentTriggerState.enabled && (
            <div className="mb-4 bg-amber-950/15 border border-amber-500/20 rounded-xl p-3 flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-amber-200/80 leading-relaxed font-sans">
                {activeTab === 'double' && (
                  <span>
                    Note: Adds a slight delay to single taps to check for double press.
                  </span>
                )}
                {activeTab === 'triple' && (
                  <span>
                    Note: Adds a slight delay to check for consecutive presses.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Configuration form for the trigger */}
          {(activeTab === 'single' || currentTriggerState.enabled) ? (
            <div className="space-y-4 pt-2">
              {/* Action Type selection */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-2 font-sans">
                  Action Type
                </label>
                <div className={`grid ${activeTab === 'single' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                  {[
                    ...(activeTab === 'single' ? [{ type: 'none', label: 'No Remapping' }] : []),
                    { type: 'key', label: 'Key Remap' },
                    { type: 'macro', label: 'Macro Sequence' },
                  ].map((act) => {
                    const isSelected = currentTriggerState.actionType === act.type;
                    return (
                      <button
                        key={act.type}
                        id={`btn-action-type-${act.type}`}
                        onClick={() => handleUpdateTrigger(activeTab, { 
                          actionType: act.type as ActionType,
                          enabled: act.type !== 'none'
                        })}
                        className={`
                          py-3 px-4 rounded-xl border text-center flex items-center justify-center transition cursor-pointer font-sans text-xs font-semibold h-11 select-none
                          ${isSelected 
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                            : 'bg-[#18181c]/60 border-white/[0.05] hover:border-white/[0.12] text-zinc-400 hover:text-zinc-200'
                          }
                        `}
                      >
                        {act.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION TYPE: KEY */}
              {currentTriggerState.actionType === 'key' && (
                <div className="bg-[#18181c] border border-white/[0.06] p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] text-zinc-400 font-medium font-sans">
                      Target Key / Function
                    </label>
                    <button
                      type="button"
                      id="btn-detect-key-press"
                      onClick={() => setIsListening(!isListening)}
                      className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                        isListening
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                          : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40 hover:border-indigo-400/50 shadow-sm'
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      {isListening ? 'Listening (Press Any Key)...' : 'Detect Key Press'}
                    </button>
                  </div>

                  {isListening && (
                    <div className="text-[10px] text-amber-300 font-sans bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5 animate-fade-in leading-relaxed">
                      ⚠️ <strong>Listening active:</strong> Press any physical key (e.g. A-Z, arrows, CapsLock, Ctrl, Enter) to instantly map it, or click the button above to cancel.
                    </div>
                  )}

                  <select
                    value={currentTriggerState.targetKey}
                    onChange={(e) => handleUpdateTrigger(activeTab, { targetKey: e.target.value })}
                    className="w-full bg-[#0c0c0e] border border-white/[0.06] text-zinc-200 text-xs rounded-lg py-2 px-3 outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose a Key / Action --</option>
                    {Object.entries(groupedTargetKeys).map(([category, keys]) => {
                      const label = categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);
                      return (
                        <optgroup key={category} label={label} className="bg-[#121215] text-indigo-300 font-sans">
                          {keys.map((k) => (
                            <option key={k.keyName} value={k.keyName} className="bg-[#121215] text-zinc-200 font-sans">
                              {k.display} [{k.keyName}]
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* ACTION TYPE: MACRO */}
              {currentTriggerState.actionType === 'macro' && (
                <div className={`bg-[#18181c] border p-4 rounded-xl transition ${
                  !currentTriggerState.targetMacroId ? 'border-rose-500/30 bg-rose-950/5' : 'border-white/[0.06]'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] text-zinc-400 font-medium font-sans">
                      Assign Macro Sequence
                    </label>
                    {!currentTriggerState.targetMacroId && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/20 px-2 py-0.5 rounded-md animate-pulse font-sans">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        No Macro Selected!
                      </span>
                    )}
                  </div>
                  {macros.length === 0 ? (
                    <div className="text-center py-4 bg-[#0c0c0e]/50 rounded-lg border border-dashed border-rose-500/20">
                      <p className="text-xs text-rose-400 font-medium">No custom macros defined yet.</p>
                      <p className="text-[11px] text-zinc-500 mt-1">Create one under the Macro Recorder tab above first!</p>
                    </div>
                  ) : (
                    <select
                      value={currentTriggerState.targetMacroId}
                      onChange={(e) => handleUpdateTrigger(activeTab, { targetMacroId: e.target.value })}
                      className={`w-full bg-[#0c0c0e] border text-zinc-200 text-xs rounded-lg py-2 px-3 outline-none focus:border-indigo-500 transition ${
                        !currentTriggerState.targetMacroId ? 'border-rose-500/40 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20' : 'border-white/[0.06]'
                      }`}
                    >
                      <option value="">-- Choose a Macro --</option>
                      {macros.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.steps.length} steps)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* TRIGGER CUSTOM TIMING ADJUSTMENT */}
              {activeTab !== 'single' && (
                <div className="border-t border-white/[0.06] pt-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-zinc-400 font-sans flex items-center gap-1">
                      <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      Adjustable Timing Configuration
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={currentTriggerState.customTiming !== undefined}
                        onChange={(e) => {
                          const hasCustom = e.target.checked;
                          // Default ms depending on trigger type and global settings
                          const defaultVal = activeTab === 'hold' 
                            ? profileSettings.holdDuration 
                            : (activeTab === 'triple' ? profileSettings.triplePressTimeout : profileSettings.doublePressTimeout);
                          handleUpdateTrigger(activeTab, {
                            customTiming: hasCustom ? defaultVal : undefined,
                          });
                        }}
                        className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                      />
                      <span className="text-zinc-400 font-sans">Override Global Defaults</span>
                    </label>
                  </div>

                  {currentTriggerState.customTiming !== undefined && (
                    <div className="flex items-center gap-3 bg-[#18181c] border border-white/[0.06] p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="10"
                          max="2000"
                          value={currentTriggerState.customTiming}
                          onChange={(e) =>
                            handleUpdateTrigger(activeTab, {
                              customTiming: parseInt(e.target.value) || 10,
                            })
                          }
                          className="w-24 bg-[#0c0c0e] border border-white/[0.06] text-zinc-200 text-xs rounded py-1.5 px-2 outline-none font-mono text-center"
                        />
                        <span className="text-xs text-zinc-400 font-sans">ms</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        {activeTab === 'hold'
                          ? 'Trigger held-state action if pressed continuously for this long.'
                          : 'Max wait time between consecutive clicks to capture tap.'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 text-xs font-sans">
              <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
              <span>This trigger is currently disabled.</span>
              <span className="text-[11px] text-zinc-600 mt-1">Toggle "Enabled" at the top-right to configure remappings!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
