import React, { useState, useEffect } from 'react';
import { KEYBOARD_LAYOUT, KeyboardKeyDef } from '../data/keyboardKeys';
import { KeyMapping } from '../types';
import { Keyboard } from 'lucide-react';
import { mapKeyboardEventToAhkKey } from '../utils/keyDetector';

interface KeyboardVisualizerProps {
  mappings: Record<string, KeyMapping>;
  selectedKey: string | null;
  onSelectKey: (keyName: string) => void;
  onCaptureSpecialKey: (keyName: string) => void;
}

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

export default function KeyboardVisualizer({
  mappings,
  selectedKey,
  onSelectKey,
  onCaptureSpecialKey,
}: KeyboardVisualizerProps) {
  const [isListening, setIsListening] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isCurrentlyPanning, setIsCurrentlyPanning] = useState(false);

  const dragStatus = React.useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    velX: 0,
    lastX: 0,
    lastTime: 0,
    animationFrameId: 0,
  });

  const hasDraggedRef = React.useRef(false);

  const handleScrollMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan with primary (left) mouse click
    if (e.button !== 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const target = e.target as HTMLElement;
    // Don't intercept clicks on inputs or dropdowns
    if (target.closest('select') || target.closest('input')) {
      return;
    }

    dragStatus.current.isDragging = true;
    dragStatus.current.startX = e.clientX;
    dragStatus.current.scrollLeft = container.scrollLeft;
    dragStatus.current.velX = 0;
    dragStatus.current.lastX = e.clientX;
    dragStatus.current.lastTime = Date.now();
    hasDraggedRef.current = false;

    if (dragStatus.current.animationFrameId) {
      cancelAnimationFrame(dragStatus.current.animationFrameId);
    }

    document.addEventListener('mousemove', handleScrollMouseMove);
    document.addEventListener('mouseup', handleScrollMouseUp);
    setIsCurrentlyPanning(true);
  };

  const handleScrollMouseMove = (e: MouseEvent) => {
    if (!dragStatus.current.isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const x = e.clientX;
    const walk = x - dragStatus.current.startX;

    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }

    container.scrollLeft = dragStatus.current.scrollLeft - walk;

    const now = Date.now();
    const elapsed = now - dragStatus.current.lastTime;
    if (elapsed > 0) {
      const instantVel = (x - dragStatus.current.lastX) / elapsed;
      // Exponential filter for velocity
      dragStatus.current.velX = dragStatus.current.velX * 0.45 + instantVel * 0.55;
    }
    dragStatus.current.lastX = x;
    dragStatus.current.lastTime = now;
  };

  const handleScrollMouseUp = () => {
    dragStatus.current.isDragging = false;
    document.removeEventListener('mousemove', handleScrollMouseMove);
    document.removeEventListener('mouseup', handleScrollMouseUp);
    setIsCurrentlyPanning(false);

    const container = scrollContainerRef.current;
    if (!container) return;

    if (Math.abs(dragStatus.current.velX) > 0.1) {
      const applyMomentum = () => {
        dragStatus.current.velX *= 0.94; // friction decay
        container.scrollLeft -= dragStatus.current.velX * 16;

        if (Math.abs(dragStatus.current.velX) > 0.02) {
          dragStatus.current.animationFrameId = requestAnimationFrame(applyMomentum);
        }
      };
      dragStatus.current.animationFrameId = requestAnimationFrame(applyMomentum);
    }
  };

  useEffect(() => {
    return () => {
      if (dragStatus.current.animationFrameId) {
        cancelAnimationFrame(dragStatus.current.animationFrameId);
      }
      document.removeEventListener('mousemove', handleScrollMouseMove);
      document.removeEventListener('mouseup', handleScrollMouseUp);
    };
  }, []);

  // Calculate active triggers for a key to show indicators
  const getActiveCount = (keyName: string): number => {
    const mapping = mappings[keyName];
    if (!mapping) return 0;
    
    let count = 0;
    if (mapping.single.enabled && mapping.single.actionType !== 'none') count++;
    if (mapping.double.enabled && mapping.double.actionType !== 'none') count++;
    if (mapping.triple.enabled && mapping.triple.actionType !== 'none') count++;
    if (mapping.hold.enabled && mapping.hold.actionType !== 'none') count++;
    
    return count;
  };

  const getActiveTriggersSummary = (keyName: string): string[] => {
    const mapping = mappings[keyName];
    if (!mapping) return [];
    
    const list: string[] = [];
    if (mapping.single.enabled && mapping.single.actionType !== 'none') list.push('Single');
    if (mapping.double.enabled && mapping.double.actionType !== 'none') list.push('Double');
    if (mapping.triple.enabled && mapping.triple.actionType !== 'none') list.push('Triple');
    if (mapping.hold.enabled && mapping.hold.actionType !== 'none') list.push('Hold');
    
    return list;
  };

  const getAlphanumericRows = (): KeyboardKeyDef[][] => {
    return KEYBOARD_LAYOUT;
  };

  const getNavigationRows = (): (KeyboardKeyDef | { keyName: string; isSpacer: true; width?: string })[][] => {
    return [
      [
        { keyName: 'PrintScreen', display: 'PrtScn', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'ScrollLock', display: 'Scroll', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'Pause', display: 'Pause', category: 'navigation', width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'Insert', display: 'Ins', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'Home', display: 'Home', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'PgUp', display: 'PgUp', category: 'navigation', width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'Delete', display: 'Del', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'End', display: 'End', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'PgDn', display: 'PgDn', category: 'navigation', width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'nav-spacer-3a', isSpacer: true, width: 'w-11 md:w-12' },
        { keyName: 'nav-spacer-3b', isSpacer: true, width: 'w-11 md:w-12' },
        { keyName: 'nav-spacer-3c', isSpacer: true, width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'nav-spacer-4a', isSpacer: true, width: 'w-11 md:w-12' },
        { keyName: 'Up', display: '▲', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'nav-spacer-4c', isSpacer: true, width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'Left', display: '◀', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'Down', display: '▼', category: 'navigation', width: 'w-11 md:w-12' },
        { keyName: 'Right', display: '▶', category: 'navigation', width: 'w-11 md:w-12' },
      ],
    ];
  };

  const getNumpadRows = (): (KeyboardKeyDef | { keyName: string; isSpacer: true; width?: string })[][] => {
    return [
      [
        { keyName: 'NumLock', display: 'Num', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'NumpadDiv', display: '/', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'NumpadMult', display: '*', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'NumpadSub', display: '-', category: 'numpad', width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'Numpad7', display: '7', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'Numpad8', display: '8', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'Numpad9', display: '9', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'NumpadAdd', display: '+', category: 'numpad', width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'Numpad4', display: '4', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'Numpad5', display: '5', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'Numpad6', display: '6', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'num-spacer-2d', isSpacer: true, width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'Numpad1', display: '1', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'Numpad2', display: '2', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'Numpad3', display: '3', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'NumpadEnter', display: 'Ent', category: 'numpad', width: 'w-11 md:w-12' },
      ],
      [
        { keyName: 'Numpad0', display: '0', category: 'numpad', width: 'w-[94px] md:w-[102px]' },
        { keyName: 'NumpadDot', display: '.', category: 'numpad', width: 'w-11 md:w-12' },
        { keyName: 'num-spacer-4c', isSpacer: true, width: 'w-11 md:w-12' },
      ],
    ];
  };

  // Key detector effect to record live key presses for visualizer selection
  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts or scroll actions while intercepting keys
      e.preventDefault();
      e.stopPropagation();

      const detectedKey = mapKeyboardEventToAhkKey(e);
      if (detectedKey) {
        // Check if it's on the physical board
        const onMainLayout = KEYBOARD_LAYOUT.flat().some(k => k.keyName.toLowerCase() === detectedKey.toLowerCase());
        const onNavLayout = getNavigationRows().flat().some(k => 'keyName' in k && !('isSpacer' in k) && k.keyName.toLowerCase() === detectedKey.toLowerCase());
        const onNumLayout = getNumpadRows().flat().some(k => 'keyName' in k && !('isSpacer' in k) && k.keyName.toLowerCase() === detectedKey.toLowerCase());

        if (onMainLayout || onNavLayout || onNumLayout) {
          onSelectKey(detectedKey);
        } else {
          // If it is a special/media key, capture it
          onCaptureSpecialKey(detectedKey);
        }
        setIsListening(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isListening, onSelectKey, onCaptureSpecialKey]);

  const renderKey = (keyDef: any) => {
    if (keyDef.isSpacer || keyDef.keyName.startsWith('spacer')) {
      return (
        <div 
          key={keyDef.keyName} 
          className={`${keyDef.width || 'w-11 md:w-12'} h-11 md:h-12 shrink-0 pointer-events-none`} 
        />
      );
    }

    const activeCount = getActiveCount(keyDef.keyName);
    const triggersSummary = getActiveTriggersSummary(keyDef.keyName);
    const isSelected = selectedKey === keyDef.keyName;
    const isMapped = activeCount > 0;
    const widthClass = keyDef.width || 'w-11 md:w-12';

    let keycapClasses = '';
    if (isSelected) {
      keycapClasses = 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]';
    } else if (isMapped) {
      keycapClasses = 'bg-[#0f2d1e] text-emerald-300 border-emerald-500/20 hover:bg-[#143d28]';
    } else {
      keycapClasses = 'bg-[#16161a] border-white/[0.05] text-zinc-400 hover:bg-[#1c1c21] hover:text-zinc-200';
    }

    return (
      <button
        key={keyDef.keyName}
        id={`keyboard-key-${keyDef.keyName}`}
        onClick={() => {
          if (hasDraggedRef.current) return;
          onSelectKey(keyDef.keyName);
        }}
        title={`${keyDef.display} ${isMapped ? `(${triggersSummary.join(', ')})` : ''}`}
        className={`
          ${widthClass} h-11 md:h-12 shrink-0 relative outline-none focus:outline-none transition-all duration-100 select-none cursor-pointer rounded-lg border
          ${keycapClasses} p-1.5 flex flex-col items-center justify-between
        `}
      >
        <div className="flex gap-0.5 h-1 items-center justify-center w-full">
          {isMapped && !isSelected && (
            Array.from({ length: Math.min(activeCount, 4) }).map((_, dIdx) => (
              <span 
                key={dIdx} 
                className="h-1 w-1 rounded-full bg-emerald-400 shadow shadow-emerald-400/50"
              />
            ))
          )}
          {isSelected && (
            <span className="h-1 w-1 rounded-full bg-white shadow" />
          )}
        </div>
        <span className="text-[10px] md:text-[11px] font-mono truncate max-w-full leading-none mt-auto mb-0.5 uppercase tracking-wide">
          {keyDef.display}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 mb-5 border-b border-white/[0.05]">
        <div>
          <h3 className="font-sans text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            Interactive Keyboard Layout
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Click any physical key to configure, or choose non-standard/mouse triggers from the Special Keys.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Special Key Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#0c0c0e] border border-white/[0.06] rounded-xl py-1.5 px-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap font-sans">Special Keys:</span>
            <select
              id="select-special-key-capture"
              onChange={(e) => {
                if (e.target.value) {
                  onCaptureSpecialKey(e.target.value);
                  e.target.value = ''; // Reset selection
                }
              }}
              className="bg-transparent text-zinc-300 text-xs outline-none cursor-pointer py-1 font-sans font-semibold min-w-[140px]"
              defaultValue=""
            >
              <option value="" className="bg-[#121215] text-zinc-500" disabled>-- Select Special Key --</option>
              {SPECIAL_KEYS.map((sk) => (
                <option key={sk.keyName} value={sk.keyName} className="bg-[#121215] text-zinc-300">
                  {sk.display}
                </option>
              ))}
            </select>
          </div>

          {/* Detect Key Press Button */}
          <button
            type="button"
            id="btn-detect-visualizer-key"
            onClick={() => setIsListening(!isListening)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
              isListening
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                : 'bg-indigo-950/45 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40 hover:border-indigo-400/50 shadow-sm'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            {isListening ? 'Listening (Press Key)...' : 'Detect Key Press'}
          </button>
        </div>
      </div>

      {isListening && (
        <div className="text-xs text-amber-300 font-sans bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 mb-4 animate-fade-in flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
          <span><strong>Listening active:</strong> Press any key on your physical keyboard (like letters, arrows, numpad keys, modifiers, or media keys) to select it instantly.</span>
        </div>
      )}

      {/* Elegant scrollable 2D flat container */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleScrollMouseDown}
        className={`overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none ${
          isCurrentlyPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="min-w-[1330px] flex gap-6 bg-[#09090b] border border-white/[0.05] p-5 rounded-2xl shadow-inner">
          
          {/* Column A: Alphanumeric Main Block */}
          <div className="flex flex-col gap-1.5">
            {getAlphanumericRows().map((row, rowIndex) => (
              <div key={`alpha-${rowIndex}`} className="flex gap-1.5 justify-start">
                {row.map((key) => renderKey(key))}
              </div>
            ))}
          </div>

          {/* Column B: Navigation Cluster */}
          <div className="flex flex-col gap-1.5">
            {getNavigationRows().map((row, rowIndex) => (
              <div key={`nav-${rowIndex}`} className="flex gap-1.5 justify-start">
                {row.map((key) => renderKey(key))}
              </div>
            ))}
          </div>

          {/* Column C: Numpad Cluster */}
          <div className="flex flex-col gap-1.5">
            {getNumpadRows().map((row, rowIndex) => (
              <div key={`num-${rowIndex}`} className="flex gap-1.5 justify-start">
                {row.map((key) => renderKey(key))}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
