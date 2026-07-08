export type ActionType = 'key' | 'macro' | 'none';

export type TriggerType = 'single' | 'double' | 'triple' | 'hold';

export interface TriggerState {
  enabled: boolean;
  actionType: ActionType;
  targetKey: string;     // e.g. 'b', 'LWin', 'Volume_Up'
  targetMacroId: string; // references a Macro.id
  customTiming?: number; // custom timing in ms for this trigger (e.g. hold duration, tap timeout)
}

export interface KeyMapping {
  keyName: string; // The physical trigger key (e.g., 'Capslock', 'F1', 'g')
  single: TriggerState;
  double: TriggerState;
  triple: TriggerState;
  hold: TriggerState;
}

export type MacroStepType = 'keydown' | 'keyup' | 'text' | 'delay' | 'click';

export interface KeyDownStep {
  type: 'keydown';
  key: string;
}

export interface KeyUpStep {
  type: 'keyup';
  key: string;
}

export interface TextStep {
  type: 'text';
  text: string;
}

export interface DelayStep {
  type: 'delay';
  duration: number; // in ms
}

export interface ClickStep {
  type: 'click';
  button: 'left' | 'right' | 'middle';
  x?: number; // optional absolute X
  y?: number; // optional absolute Y
}

export type MacroStep = KeyDownStep | KeyUpStep | TextStep | DelayStep | ClickStep;

export interface Macro {
  id: string;
  name: string;
  description?: string;
  steps: MacroStep[];
  useStandardDelays?: boolean;
}

export interface ProfileSettings {
  doublePressTimeout: number; // in ms, default 180ms
  triplePressTimeout: number; // in ms, default 180ms
  holdDuration: number;       // in ms, default 250ms
  ahkVersion: 'v1' | 'v2';
}

export interface AHKProfile {
  name: string;
  description: string;
  settings: ProfileSettings;
  mappings: Record<string, KeyMapping>; // KeyName -> KeyMapping
  macros: Macro[];
}
