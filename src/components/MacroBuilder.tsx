import React, { useState } from 'react';
import { Macro, MacroStep, MacroStepType } from '../types';
import { ALL_TARGET_KEYS } from '../data/keyboardKeys';
import { Plus, Trash, Copy, ClipboardCopy, Sparkles } from 'lucide-react';

interface MacroBuilderProps {
  macros: Macro[];
  onChangeMacros: (macros: Macro[]) => void;
}

export default function MacroBuilder({ macros, onChangeMacros }: MacroBuilderProps) {
  const [selectedMacroId, setSelectedMacroId] = useState<string | null>(
    macros.length > 0 ? macros[0].id : null
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedMacro = macros.find(m => m.id === selectedMacroId);

  // Add a new macro
  const handleAddMacro = () => {
    const newId = `macro_${Date.now()}`;
    const newMacro: Macro = {
      id: newId,
      name: `Custom Macro ${macros.length + 1}`,
      description: 'Performs a sequence of keyboard or mouse actions.',
      useStandardDelays: true,
      steps: [
        { type: 'text', text: 'Hello, World!' },
        { type: 'delay', duration: 100 }
      ]
    };
    onChangeMacros([...macros, newMacro]);
    setSelectedMacroId(newId);
  };

  // Delete a macro
  const handleDeleteMacro = (id: string) => {
    const updated = macros.filter(m => m.id !== id);
    onChangeMacros(updated);
    if (selectedMacroId === id) {
      setSelectedMacroId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Update selected macro details
  const handleUpdateMacro = (updates: Partial<Omit<Macro, 'id' | 'steps'>>) => {
    if (!selectedMacroId) return;
    const updated = macros.map(m => {
      if (m.id === selectedMacroId) {
        return { ...m, ...updates };
      }
      return m;
    });
    onChangeMacros(updated);
  };

  // Update selected macro steps
  const handleUpdateSteps = (newSteps: MacroStep[]) => {
    if (!selectedMacroId) return;
    const updated = macros.map(m => {
      if (m.id === selectedMacroId) {
        return { ...m, steps: newSteps };
      }
      return m;
    });
    onChangeMacros(updated);
  };

  // Add step to current macro
  const handleAddStep = (type: MacroStepType) => {
    if (!selectedMacro) return;
    
    let newStep: MacroStep;
    switch (type) {
      case 'keydown':
        newStep = { type: 'keydown', key: 'a' };
        break;
      case 'keyup':
        newStep = { type: 'keyup', key: 'a' };
        break;
      case 'text':
        newStep = { type: 'text', text: 'Typing text...' };
        break;
      case 'delay':
        newStep = { type: 'delay', duration: 150 };
        break;
      case 'click':
        newStep = { type: 'click', button: 'left' };
        break;
    }

    handleUpdateSteps([...selectedMacro.steps, newStep]);
  };

  // Delete a specific step index
  const handleDeleteStep = (index: number) => {
    if (!selectedMacro) return;
    const filtered = selectedMacro.steps.filter((_, i) => i !== index);
    handleUpdateSteps(filtered);
  };

  // Duplicate a specific step index
  const handleDuplicateStep = (index: number) => {
    if (!selectedMacro) return;
    const stepToDuplicate = selectedMacro.steps[index];
    const newStep = JSON.parse(JSON.stringify(stepToDuplicate)); // Deep clone the step
    const steps = [...selectedMacro.steps];
    steps.splice(index + 1, 0, newStep);
    handleUpdateSteps(steps);
  };

  // Edit specific step details
  const handleEditStep = (index: number, updates: Partial<MacroStep>) => {
    if (!selectedMacro) return;
    const steps = selectedMacro.steps.map((step, i) => {
      if (i === index) {
        return { ...step, ...updates } as MacroStep;
      }
      return step;
    });
    handleUpdateSteps(steps);
  };

  // Load a preset macro
  const handleLoadPreset = (presetType: 'win_run' | 'rapid_click' | 'duplicate_line') => {
    if (!selectedMacro) return;
    
    let presetSteps: MacroStep[] = [];
    let presetName = '';
    let presetDesc = '';

    if (presetType === 'win_run') {
      presetName = 'Launch Notepad';
      presetDesc = 'Launches Notepad using Windows Run dialog.';
      presetSteps = [
        { type: 'keydown', key: 'LWin' },
        { type: 'keydown', key: 'r' },
        { type: 'delay', duration: 50 },
        { type: 'keyup', key: 'r' },
        { type: 'keyup', key: 'LWin' },
        { type: 'delay', duration: 300 },
        { type: 'text', text: 'notepad.exe' },
        { type: 'delay', duration: 50 },
        { type: 'keydown', key: 'Enter' },
        { type: 'delay', duration: 50 },
        { type: 'keyup', key: 'Enter' },
      ];
    } else if (presetType === 'rapid_click') {
      presetName = 'Triple Clicker';
      presetDesc = 'Sends three rapid mouse left-clicks.';
      presetSteps = [
        { type: 'click', button: 'left' },
        { type: 'delay', duration: 80 },
        { type: 'click', button: 'left' },
        { type: 'delay', duration: 80 },
        { type: 'click', button: 'left' },
      ];
    } else if (presetType === 'duplicate_line') {
      presetName = 'VSCode Duplicate Line';
      presetDesc = 'Triggers VSCode duplicate line shortcut (Shift+Alt+Down).';
      presetSteps = [
        { type: 'keydown', key: 'LShift' },
        { type: 'keydown', key: 'LAlt' },
        { type: 'keydown', key: 'Down' },
        { type: 'delay', duration: 50 },
        { type: 'keyup', key: 'Down' },
        { type: 'keyup', key: 'LAlt' },
        { type: 'keyup', key: 'LShift' },
      ];
    }

    const updated = macros.map(m => {
      if (m.id === selectedMacroId) {
        return {
          ...m,
          name: presetName,
          description: presetDesc,
          steps: presetSteps,
        };
      }
      return m;
    });
    onChangeMacros(updated);
  };

  return (
    <div className="bg-[#121215] border border-white/[0.06] rounded-2xl p-6 shadow-2xl relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-sans text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <ClipboardCopy className="w-4 h-4 text-indigo-400" />
            Macro Recorder &amp; Editor
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Create multi-action sequences to assign as targets for any hotkey triggers.
          </p>
        </div>
        <button
          id="btn-add-macro"
          onClick={handleAddMacro}
          className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition duration-150 font-medium font-sans cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Macro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: List of macros */}
        <div className="bg-[#0c0c0e] rounded-xl p-4 border border-white/[0.05] max-h-[450px] overflow-y-auto">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-3 font-mono">
            Your Macros ({macros.length})
          </span>
          {macros.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs font-sans">
              No custom macros created yet. Click "Add Macro" to create one.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {macros.map((macro) => (
                <div
                  key={macro.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition duration-150 ${
                    selectedMacroId === macro.id
                      ? 'bg-indigo-950/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-[#18181c]/50 hover:bg-[#18181c] border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <button
                    id={`btn-select-macro-${macro.id}`}
                    onClick={() => setSelectedMacroId(macro.id)}
                    className="flex-1 text-left font-sans text-xs font-semibold truncate cursor-pointer"
                  >
                    {macro.name}
                    <span className="block text-[10px] font-normal text-zinc-500 truncate mt-0.5">
                      {macro.steps.length} {macro.steps.length === 1 ? 'step' : 'steps'}
                    </span>
                  </button>
                  <button
                    id={`btn-delete-macro-${macro.id}`}
                    onClick={() => handleDeleteMacro(macro.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 rounded transition duration-150 cursor-pointer"
                    title="Delete Macro"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right columns: Active Macro Editor */}
        <div className="md:col-span-2">
          {selectedMacro ? (
            <div className="flex flex-col gap-5">
              {/* Macro Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1.5 font-sans">
                    Macro Name
                  </label>
                  <input
                    type="text"
                    value={selectedMacro.name}
                    onChange={(e) => handleUpdateMacro({ name: e.target.value })}
                    className="w-full bg-[#0c0c0e] border border-white/[0.06] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-zinc-200 text-xs rounded-lg py-2 px-3 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1.5 font-sans">
                    Description
                  </label>
                  <input
                    type="text"
                    value={selectedMacro.description || ''}
                    onChange={(e) => handleUpdateMacro({ description: e.target.value })}
                    className="w-full bg-[#0c0c0e] border border-white/[0.06] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-zinc-200 text-xs rounded-lg py-2 px-3 outline-none transition"
                  />
                </div>
              </div>

              {/* Steps timeline */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-sans">
                    Macro Steps Timeline
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Use Standard Delays Checkbox */}
                    <label className="flex items-center gap-2 text-xs text-zinc-400 select-none cursor-pointer bg-[#0c0c0e]/80 border border-white/[0.04] px-2.5 py-1 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedMacro.useStandardDelays !== false}
                        onChange={(e) => handleUpdateMacro({ useStandardDelays: e.target.checked })}
                        className="rounded border-white/10 bg-zinc-950 text-indigo-650 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                      />
                      <span className="font-medium text-zinc-300">Use Standard Delays</span>
                    </label>

                    {/* Append step buttons */}
                    <div className="flex flex-wrap gap-1">
                      {(['keydown', 'keyup', 'text', 'delay', 'click'] as MacroStepType[]).map((stepType) => (
                        <button
                          key={stepType}
                          onClick={() => handleAddStep(stepType)}
                          className="px-2.5 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 rounded text-zinc-300 transition font-medium font-mono cursor-pointer"
                        >
                          +{stepType.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {selectedMacro.steps.length === 0 ? (
                    <div className="text-center py-10 bg-[#0c0c0e]/30 rounded-xl border border-dashed border-white/[0.06] text-zinc-500 text-xs">
                      No steps in this macro timeline yet. Click buttons above to add commands.
                    </div>
                  ) : (
                    selectedMacro.steps.map((step, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => setDraggedIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedIndex === null || draggedIndex === idx) return;
                          const steps = [...selectedMacro.steps];
                          const draggedStep = steps[draggedIndex];
                          steps.splice(draggedIndex, 1);
                          steps.splice(idx, 0, draggedStep);
                          handleUpdateSteps(steps);
                          setDraggedIndex(null);
                        }}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`flex items-center gap-3 p-3 bg-[#0c0c0e] border border-white/[0.05] rounded-xl transition duration-150 ${
                          draggedIndex === idx ? 'opacity-30 border-dashed border-indigo-500/50 bg-indigo-950/10' : ''
                        }`}
                      >
                        {/* Drag Handle 6-dot grid */}
                        <div 
                          className="grid grid-cols-2 gap-0.5 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 select-none p-1 shrink-0"
                          title="Drag to reorder step"
                        >
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                        </div>

                        {/* Index Indicator */}
                        <span className="text-xs font-mono font-semibold text-zinc-500 w-4 select-none">
                          {idx + 1}.
                        </span>

                        {/* Step Type Label */}
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded select-none w-20 text-center ${
                          step.type === 'keydown' ? 'bg-amber-950/40 text-amber-300 border border-amber-500/20' :
                          step.type === 'keyup' ? 'bg-orange-950/40 text-orange-300 border border-orange-500/20' :
                          step.type === 'text' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20' :
                          step.type === 'delay' ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/20' :
                          'bg-indigo-950/40 text-indigo-300 border border-indigo-500/20'
                        }`}>
                          {step.type.toUpperCase()}
                        </span>

                        {/* Dynamic Step Configuration Fields */}
                        <div className="flex-1 flex flex-wrap items-center gap-3">
                          {/* KEY SELECTOR (keydown, keyup) */}
                          {(step.type === 'keydown' || step.type === 'keyup') && (
                            <select
                              value={step.key}
                              onChange={(e) => handleEditStep(idx, { key: e.target.value })}
                              className="bg-[#18181c] border border-white/[0.06] text-zinc-200 text-xs rounded py-1 px-2 outline-none font-mono"
                            >
                              {ALL_TARGET_KEYS.map((k) => (
                                <option key={k.keyName} value={k.keyName}>
                                  {k.display}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* TEXT INPUT (text) */}
                          {step.type === 'text' && (
                            <input
                              type="text"
                              value={step.text}
                              onChange={(e) => handleEditStep(idx, { text: e.target.value })}
                              className="bg-[#18181c] border border-white/[0.06] text-zinc-200 text-xs rounded py-1 px-2.5 outline-none flex-1 focus:border-indigo-500"
                              placeholder="Text to type..."
                            />
                          )}

                          {/* DURATION INPUT (delay) */}
                          {step.type === 'delay' && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-450">
                              <input
                                type="number"
                                min="0"
                                value={step.duration}
                                onChange={(e) => handleEditStep(idx, { duration: parseInt(e.target.value) || 0 })}
                                className="w-20 bg-[#18181c] border border-white/[0.06] text-zinc-200 text-xs rounded py-1 px-2 outline-none font-mono text-center focus:border-indigo-500"
                              />
                              <span className="font-sans text-zinc-400">ms</span>
                            </div>
                          )}

                          {/* MOUSE CLICK (click) */}
                          {step.type === 'click' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={step.button}
                                onChange={(e) => handleEditStep(idx, { button: e.target.value as any })}
                                className="bg-[#18181c] border border-white/[0.06] text-zinc-200 text-xs rounded py-1 px-2 outline-none"
                              >
                                <option value="left">Left Button</option>
                                <option value="right">Right Button</option>
                                <option value="middle">Middle Button</option>
                              </select>
                              
                              <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                                <span>X:</span>
                                <input
                                  type="number"
                                  placeholder="Current"
                                  value={step.x !== undefined ? step.x : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleEditStep(idx, { x: val === '' ? undefined : parseInt(val) });
                                  }}
                                  className="w-16 bg-[#18181c] border border-white/[0.06] text-zinc-200 text-xs rounded py-1 px-1.5 outline-none text-center focus:border-indigo-500"
                                />
                                <span className="ml-1">Y:</span>
                                <input
                                  type="number"
                                  placeholder="Current"
                                  value={step.y !== undefined ? step.y : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleEditStep(idx, { y: val === '' ? undefined : parseInt(val) });
                                  }}
                                  className="w-16 bg-[#18181c] border border-white/[0.06] text-zinc-200 text-xs rounded py-1 px-1.5 outline-none text-center focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Control actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDuplicateStep(idx)}
                            className="p-1 bg-[#18181c] hover:bg-zinc-800 border border-white/[0.05] rounded text-zinc-400 hover:text-white transition cursor-pointer"
                            title="Duplicate Step"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStep(idx)}
                            className="p-1 bg-[#18181c] hover:bg-zinc-800 border border-white/[0.05] rounded text-zinc-400 hover:text-rose-400 transition ml-1 cursor-pointer"
                            title="Delete Step"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#0c0c0e]/20 rounded-2xl border border-dashed border-white/[0.06] text-center">
              <ClipboardCopy className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-sm font-semibold text-zinc-400">No Macro Selected</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm font-sans">
                Create a new macro using the button above or select an existing macro in the list to start building custom sequences.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
