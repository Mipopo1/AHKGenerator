export interface KeyboardKeyDef {
  keyName: string;      // Official AHK Key name (e.g. 'a', 'Capslock', 'LShift')
  display: string;      // User-friendly display (e.g. 'A', 'Caps Lock', 'Shift (L)')
  width?: string;       // Custom width class for physical keyboard UI
  category: 'alpha' | 'numeric' | 'function' | 'modifier' | 'navigation' | 'media' | 'numpad' | 'other';
}

export const KEYBOARD_LAYOUT: KeyboardKeyDef[][] = [
  // Row 1: Function keys
  [
    { keyName: 'Esc', display: 'Esc', category: 'function', width: 'w-10 md:w-12' },
    { keyName: 'F1', display: 'F1', category: 'function' },
    { keyName: 'F2', display: 'F2', category: 'function' },
    { keyName: 'F3', display: 'F3', category: 'function' },
    { keyName: 'F4', display: 'F4', category: 'function' },
    { keyName: 'F5', display: 'F5', category: 'function' },
    { keyName: 'F6', display: 'F6', category: 'function' },
    { keyName: 'F7', display: 'F7', category: 'function' },
    { keyName: 'F8', display: 'F8', category: 'function' },
    { keyName: 'F9', display: 'F9', category: 'function' },
    { keyName: 'F10', display: 'F10', category: 'function' },
    { keyName: 'F11', display: 'F11', category: 'function' },
    { keyName: 'F12', display: 'F12', category: 'function' },
  ],
  // Row 2: Numbers & symbols
  [
    { keyName: '`', display: '~ `', category: 'numeric' },
    { keyName: '1', display: '! 1', category: 'numeric' },
    { keyName: '2', display: '@ 2', category: 'numeric' },
    { keyName: '3', display: '# 3', category: 'numeric' },
    { keyName: '4', display: '$ 4', category: 'numeric' },
    { keyName: '5', display: '% 5', category: 'numeric' },
    { keyName: '6', display: '^ 6', category: 'numeric' },
    { keyName: '7', display: '& 7', category: 'numeric' },
    { keyName: '8', display: '* 8', category: 'numeric' },
    { keyName: '9', display: '( 9', category: 'numeric' },
    { keyName: '0', display: ') 0', category: 'numeric' },
    { keyName: '-', display: '_ -', category: 'numeric' },
    { keyName: '=', display: '+ =', category: 'numeric' },
    { keyName: 'Backspace', display: 'Backspace', category: 'modifier', width: 'w-18 md:w-22' },
  ],
  // Row 3: Tab & QWERTY
  [
    { keyName: 'Tab', display: 'Tab', category: 'modifier', width: 'w-14 md:w-16' },
    { keyName: 'q', display: 'Q', category: 'alpha' },
    { keyName: 'w', display: 'W', category: 'alpha' },
    { keyName: 'e', display: 'E', category: 'alpha' },
    { keyName: 'r', display: 'R', category: 'alpha' },
    { keyName: 't', display: 'T', category: 'alpha' },
    { keyName: 'y', display: 'Y', category: 'alpha' },
    { keyName: 'u', display: 'U', category: 'alpha' },
    { keyName: 'i', display: 'I', category: 'alpha' },
    { keyName: 'o', display: 'O', category: 'alpha' },
    { keyName: 'p', display: 'P', category: 'alpha' },
    { keyName: '[', display: '{ [', category: 'other' },
    { keyName: ']', display: '} ]', category: 'other' },
    { keyName: '\\', display: '| \\', category: 'other', width: 'w-14 md:w-16' },
  ],
  // Row 4: CapsLock & ASDF
  [
    { keyName: 'CapsLock', display: 'Caps Lock', category: 'modifier', width: 'w-16 md:w-20' },
    { keyName: 'a', display: 'A', category: 'alpha' },
    { keyName: 's', display: 'S', category: 'alpha' },
    { keyName: 'd', display: 'D', category: 'alpha' },
    { keyName: 'f', display: 'F', category: 'alpha' },
    { keyName: 'g', display: 'G', category: 'alpha' },
    { keyName: 'h', display: 'H', category: 'alpha' },
    { keyName: 'j', display: 'J', category: 'alpha' },
    { keyName: 'k', display: 'K', category: 'alpha' },
    { keyName: 'l', display: 'L', category: 'alpha' },
    { keyName: ';', display: ': ;', category: 'other' },
    { keyName: '\'', display: '" \'', category: 'other' },
    { keyName: 'Enter', display: 'Enter', category: 'modifier', width: 'w-20 md:w-24' },
  ],
  // Row 5: Shift & ZXCV
  [
    { keyName: 'LShift', display: 'Shift (L)', category: 'modifier', width: 'w-20 md:w-24' },
    { keyName: 'z', display: 'Z', category: 'alpha' },
    { keyName: 'x', display: 'X', category: 'alpha' },
    { keyName: 'c', display: 'C', category: 'alpha' },
    { keyName: 'v', display: 'V', category: 'alpha' },
    { keyName: 'b', display: 'B', category: 'alpha' },
    { keyName: 'n', display: 'N', category: 'alpha' },
    { keyName: 'm', display: 'M', category: 'alpha' },
    { keyName: ',', display: '< ,', category: 'other' },
    { keyName: '.', display: '> .', category: 'other' },
    { keyName: '/', display: '? /', category: 'other' },
    { keyName: 'RShift', display: 'Shift (R)', category: 'modifier', width: 'w-24 md:w-30' },
  ],
  // Row 6: Modifiers & Spacebar
  [
    { keyName: 'LCtrl', display: 'Ctrl (L)', category: 'modifier', width: 'w-12 md:w-14' },
    { keyName: 'LWin', display: 'Win (L)', category: 'modifier', width: 'w-12 md:w-14' },
    { keyName: 'LAlt', display: 'Alt (L)', category: 'modifier', width: 'w-12 md:w-14' },
    { keyName: 'Space', display: 'Space', category: 'alpha', width: 'w-44 md:w-60' },
    { keyName: 'RAlt', display: 'Alt (R)', category: 'modifier', width: 'w-12 md:w-14' },
    { keyName: 'RWin', display: 'Win (R)', category: 'modifier', width: 'w-12 md:w-14' },
    { keyName: 'AppsKey', display: 'Menu', category: 'modifier', width: 'w-12 md:w-14' },
    { keyName: 'RCtrl', display: 'Ctrl (R)', category: 'modifier', width: 'w-12 md:w-14' },
  ],
];

export const OTHER_TARGET_KEYS = [
  // Navigation
  { keyName: 'Insert', display: 'Insert', category: 'navigation' },
  { keyName: 'Delete', display: 'Delete', category: 'navigation' },
  { keyName: 'Home', display: 'Home', category: 'navigation' },
  { keyName: 'End', display: 'End', category: 'navigation' },
  { keyName: 'PgUp', display: 'Page Up', category: 'navigation' },
  { keyName: 'PgDn', display: 'Page Down', category: 'navigation' },
  { keyName: 'Up', display: 'Arrow Up', category: 'navigation' },
  { keyName: 'Down', display: 'Arrow Down', category: 'navigation' },
  { keyName: 'Left', display: 'Arrow Left', category: 'navigation' },
  { keyName: 'Right', display: 'Arrow Right', category: 'navigation' },

  // Media
  { keyName: 'Volume_Up', display: 'Volume Up 🔊', category: 'media' },
  { keyName: 'Volume_Down', display: 'Volume Down 🔉', category: 'media' },
  { keyName: 'Volume_Mute', display: 'Volume Mute 🔇', category: 'media' },
  { keyName: 'Media_Next', display: 'Media Next ⏭️', category: 'media' },
  { keyName: 'Media_Prev', display: 'Media Prev ⏮️', category: 'media' },
  { keyName: 'Media_Play_Pause', display: 'Media Play/Pause ⏯️', category: 'media' },
  { keyName: 'Media_Stop', display: 'Media Stop ⏹️', category: 'media' },
  
  // Browser & System
  { keyName: 'Browser_Back', display: 'Browser Back', category: 'media' },
  { keyName: 'Browser_Forward', display: 'Browser Forward', category: 'media' },
  { keyName: 'Browser_Refresh', display: 'Browser Refresh', category: 'media' },
  { keyName: 'Browser_Home', display: 'Browser Home', category: 'media' },
  { keyName: 'PrintScreen', display: 'Print Screen', category: 'navigation' },
  { keyName: 'ScrollLock', display: 'Scroll Lock', category: 'navigation' },
  { keyName: 'Pause', display: 'Pause/Break', category: 'navigation' },

  // Mouse Action Targets
  { keyName: 'LButton', display: 'Mouse Left Click', category: 'other' },
  { keyName: 'RButton', display: 'Mouse Right Click', category: 'other' },
  { keyName: 'MButton', display: 'Mouse Middle Click', category: 'other' },
  { keyName: 'WheelUp', display: 'Mouse Wheel Up', category: 'other' },
  { keyName: 'WheelDown', display: 'Mouse Wheel Down', category: 'other' },

  // Numpad Keys
  { keyName: 'NumLock', display: 'Num Lock', category: 'numpad' },
  { keyName: 'NumpadDiv', display: 'Numpad / (Divide)', category: 'numpad' },
  { keyName: 'NumpadMult', display: 'Numpad * (Multiply)', category: 'numpad' },
  { keyName: 'NumpadSub', display: 'Numpad - (Subtract)', category: 'numpad' },
  { keyName: 'NumpadAdd', display: 'Numpad + (Add)', category: 'numpad' },
  { keyName: 'NumpadEnter', display: 'Numpad Enter', category: 'numpad' },
  { keyName: 'Numpad0', display: 'Numpad 0', category: 'numpad' },
  { keyName: 'Numpad1', display: 'Numpad 1', category: 'numpad' },
  { keyName: 'Numpad2', display: 'Numpad 2', category: 'numpad' },
  { keyName: 'Numpad3', display: 'Numpad 3', category: 'numpad' },
  { keyName: 'Numpad4', display: 'Numpad 4', category: 'numpad' },
  { keyName: 'Numpad5', display: 'Numpad 5', category: 'numpad' },
  { keyName: 'Numpad6', display: 'Numpad 6', category: 'numpad' },
  { keyName: 'Numpad7', display: 'Numpad 7', category: 'numpad' },
  { keyName: 'Numpad8', display: 'Numpad 8', category: 'numpad' },
  { keyName: 'Numpad9', display: 'Numpad 9', category: 'numpad' },
  { keyName: 'NumpadDot', display: 'Numpad . (Decimal)', category: 'numpad' },
];

export const ALL_TARGET_KEYS = [
  ...KEYBOARD_LAYOUT.flat(),
  ...OTHER_TARGET_KEYS
];
