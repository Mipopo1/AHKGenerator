import React, { useState, useEffect } from 'react';
import { AHKProfile } from '../types';
import { generateAHKScript } from '../utils/ahkGenerator';
import { Copy, Check, Download, ChevronDown, ChevronUp, Save, HardDrive, AlertCircle, Sparkles } from 'lucide-react';
import { isRunningInTauri, saveAhkToDisk } from '../utils/tauriSave';

interface ScriptPreviewProps {
  profile: AHKProfile;
}

export default function ScriptPreview({ profile }: ScriptPreviewProps) {
  const [scriptCode, setScriptCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for clean right-hand sidebar layout
  const [inTauri, setInTauri] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [savedPath, setSavedPath] = useState('');
  const [saveError, setSaveError] = useState('');

  // Detect Tauri environment
  useEffect(() => {
    setInTauri(isRunningInTauri());
  }, []);

  // Regenerate script code when profile changes
  useEffect(() => {
    setScriptCode(generateAHKScript(profile));
  }, [profile]);

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code to clipboard', err);
    }
  };

  // Handle Download of .ahk File
  const handleDownload = () => {
    const filename = `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'ahk_profile'}.ahk`;
    const blob = new Blob([scriptCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Save directly to Disk via Tauri Native Dialog/FS
  const handleSaveToDisk = async () => {
    setSaveStatus('saving');
    setSaveError('');
    const filename = `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'ahk_profile'}.ahk`;

    const result = await saveAhkToDisk(filename, scriptCode);
    if (result.success) {
      if (result.cancelled) {
        setSaveStatus('idle');
      } else {
        setSaveStatus('success');
        setSavedPath(result.path || '');
        setTimeout(() => setSaveStatus('idle'), 5000);
      }
    } else {
      setSaveStatus('error');
      setSaveError(result.error || 'Failed to save script to disk.');
    }
  };

  // Simple custom syntax highlighting regex wrapper for rendering
  const highlightCode = (code: string) => {
    if (!code) return '';

    // Safety escaping
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Comments: semicolon to end of line (; ...)
    html = html.replace(/(;.*)$/gm, '<span class="text-zinc-500 font-normal italic">$1</span>');

    // 2. Hotkeys: something like $*a:: or CapsLock::
    html = html.replace(/^([\w\d\$*\~]+::)/gm, '<span class="text-amber-400 font-bold">$1</span>');

    // 3. String literals (inside quotes: "...")
    html = html.replace(/(&quot;.*?&quot;)/g, '<span class="text-emerald-400">$1</span>');

    // 4. Built-in keywords/functions
    const keywords = ['Send', 'SendText', 'SendRaw', 'Sleep', 'KeyWait', 'Click', 'SendMode', 'SetWorkingDir', 'Return', 'return', 'Gosub', 'if', 'else', '#Requires', '#SingleInstance', '#NoEnv'];
    keywords.forEach(kw => {
      const reg = new RegExp(`\\b(${kw})\\b`, 'g');
      html = html.replace(reg, '<span class="text-indigo-400 font-semibold">$1</span>');
    });

    // 5. Special variables/constants
    const systemVars = ['A_ScriptDir', 'ErrorLevel'];
    systemVars.forEach(v => {
      const reg = new RegExp(`\\b(${v})\\b`, 'g');
      html = html.replace(reg, '<span class="text-purple-300 font-mono">$1</span>');
    });

    return html;
  };

  return (
    <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-5 shadow-xl space-y-4">
      {/* Primary Action Buttons */}
      <div className="space-y-2.5">
        {inTauri ? (
          /* Direct Tauri Save to Disk Button */
          <button
            id="btn-tauri-save-disk"
            onClick={handleSaveToDisk}
            disabled={saveStatus === 'saving'}
            className="w-full py-3 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl flex items-center justify-center gap-1.5 transition duration-150 font-bold cursor-pointer shadow-lg shadow-emerald-500/15"
          >
            <Save className={`w-3.5 h-3.5 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
            {saveStatus === 'saving' ? 'Opening Dialog...' : 'Save Directly to Disk'}
          </button>
        ) : (
          /* Web Browser Download Button */
          <button
            id="btn-download-script"
            onClick={handleDownload}
            className="w-full py-3 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 transition duration-150 font-bold cursor-pointer shadow-lg shadow-indigo-500/15"
          >
            <Download className="w-3.5 h-3.5" />
            Download .AHK Script
          </button>
        )}

        <div className="flex gap-2">
          {inTauri && (
            /* If inside Tauri, keep standard download as a backup browser fallback */
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-3 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center gap-1.5 transition duration-150 border border-white/5 cursor-pointer font-medium"
              title="Standard browser fallback download"
            >
              <Download className="w-3 h-3 text-zinc-400" />
              Download backup .AHK
            </button>
          )}

          <button
            id="btn-copy-script"
            onClick={handleCopy}
            className={`py-2.5 px-3 text-[11px] text-zinc-100 rounded-xl flex items-center justify-center gap-1.5 transition duration-150 border border-white/5 cursor-pointer font-semibold ${
              inTauri ? 'flex-1 bg-zinc-800 hover:bg-zinc-700' : 'w-full bg-zinc-800/80 hover:bg-zinc-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale-in" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status Banner Alerts */}
      {saveStatus === 'success' && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[10px] text-emerald-200/90 leading-relaxed font-sans">
            <span className="font-semibold block text-emerald-300">Saved Successfully!</span>
            File saved to: <code className="bg-emerald-950/40 px-1 py-0.5 rounded text-[9px] break-all select-all font-mono font-bold text-emerald-400">{savedPath}</code>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 flex gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[10px] text-rose-200/90 leading-relaxed font-sans">
            <span className="font-semibold block text-rose-300">Direct Save Failed</span>
            {saveError}
            <button 
              onClick={handleDownload}
              className="mt-1 block text-[10px] text-indigo-400 hover:underline font-semibold"
            >
              Click here to use standard browser download fallback instead.
            </button>
          </div>
        </div>
      )}



      {/* Collapsible Script Preview Section */}
      <div className="border-t border-white/[0.05] pt-3.5">
        <button
          id="btn-toggle-preview-collapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between py-1 px-1 text-zinc-400 hover:text-zinc-200 transition cursor-pointer select-none"
        >
          <span className="text-[10px] font-semibold font-sans uppercase tracking-wider text-zinc-500">
            Preview AutoHotkey Script
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500">
              {isCollapsed ? 'Show Code' : 'Hide Code'}
            </span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Code Block Window */}
        {!isCollapsed && (
          <div className="mt-3 relative border border-white/[0.06] rounded-xl bg-[#0c0c0e] p-4 overflow-hidden font-mono text-[10px] leading-relaxed max-h-[220px] overflow-y-auto">
            {/* Subtle overlay glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none"></div>
            
            <pre className="whitespace-pre overflow-x-auto select-text select-all text-zinc-300">
              <code dangerouslySetInnerHTML={{ __html: highlightCode(scriptCode) }} />
            </pre>
          </div>
        )}
      </div>

      {/* Compiler Helper / Settings Hint */}
      {!isCollapsed && (
        <div className="border-t border-white/[0.05] pt-3 flex gap-2.5 items-start">
          <span className="text-[9px] font-semibold text-indigo-300 bg-indigo-950/45 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono shrink-0">
            AHK {profile.settings.ahkVersion.toUpperCase()}
          </span>
          <div className="text-[10px] text-zinc-400 font-sans leading-relaxed">
            {profile.settings.ahkVersion === 'v2' ? (
              <span>
                Download script and install AHK v2 on Windows to run.
              </span>
            ) : (
              <span>
                Compiles to legacy AHK v1.1 syntax.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

