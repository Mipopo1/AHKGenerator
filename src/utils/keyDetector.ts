/**
 * Maps standard browser KeyboardEvent values to official AutoHotkey keyNames
 * configured inside our keyboardKeys.ts data file.
 */
export function mapKeyboardEventToAhkKey(e: KeyboardEvent): string {
  // 1. Process specific modifier codes first to distinguish left vs right keys
  switch (e.code) {
    case 'ShiftLeft': return 'LShift';
    case 'ShiftRight': return 'RShift';
    case 'ControlLeft': return 'LCtrl';
    case 'ControlRight': return 'RCtrl';
    case 'AltLeft': return 'LAlt';
    case 'AltRight': return 'RAlt';
    case 'MetaLeft': return 'LWin';
    case 'MetaRight': return 'RWin';
    case 'ContextMenu': return 'AppsKey';
  }

  // 2. Handle generic function and layout-independent keys by code
  if (e.code.startsWith('F') && e.code.length <= 3) {
    const num = parseInt(e.code.substring(1));
    if (!isNaN(num) && num >= 1 && num <= 24) {
      return e.code; // e.g. F1, F12
    }
  }

  // 3. Handle standard alphanumeric keys via e.code to avoid translation issues (e.g., lowercase)
  if (e.code.startsWith('Key')) {
    return e.code.substring(3).toLowerCase(); // KeyA -> 'a'
  }

  if (e.code.startsWith('Digit')) {
    return e.code.substring(5); // Digit0 -> '0', Digit9 -> '9'
  }

  // 4. Handle Numpad keys precisely
  if (e.code.startsWith('Numpad')) {
    const numSub = e.code.substring(6);
    if (!isNaN(parseInt(numSub))) {
      return `Numpad${numSub}`; // Numpad0 - Numpad9
    }
    switch (e.code) {
      case 'NumpadDecimal': return 'NumpadDot';
      case 'NumpadDivide': return 'NumpadDiv';
      case 'NumpadMultiply': return 'NumpadMult';
      case 'NumpadSubtract': return 'NumpadSub';
      case 'NumpadAdd': return 'NumpadAdd';
      case 'NumpadEnter': return 'NumpadEnter';
    }
  }

  // 5. Handle all other keys by standard code
  switch (e.code) {
    case 'Escape': return 'Esc';
    case 'Space': return 'Space';
    case 'Backspace': return 'Backspace';
    case 'Tab': return 'Tab';
    case 'CapsLock': return 'CapsLock';
    case 'Enter': return 'Enter';
    case 'Insert': return 'Insert';
    case 'Delete': return 'Delete';
    case 'Home': return 'Home';
    case 'End': return 'End';
    case 'PageUp': return 'PgUp';
    case 'PageDown': return 'PgDn';
    case 'ArrowUp': return 'Up';
    case 'ArrowDown': return 'Down';
    case 'ArrowLeft': return 'Left';
    case 'ArrowRight': return 'Right';
    case 'PrintScreen': return 'PrintScreen';
    case 'ScrollLock': return 'ScrollLock';
    case 'Pause': return 'Pause';
    case 'NumLock': return 'NumLock';
    
    // Symbols
    case 'Minus': return '-';
    case 'Equal': return '=';
    case 'BracketLeft': return '[';
    case 'BracketRight': return ']';
    case 'Backslash': return '\\';
    case 'Semicolon': return ';';
    case 'Quote': return '\'';
    case 'Backquote': return '`';
    case 'Comma': return ',';
    case 'Period': return '.';
    case 'Slash': return '/';
  }

  // Fallback to standard key matching for any browser-specific variations
  const keyMap: Record<string, string> = {
    'esc': 'Esc',
    'escape': 'Esc',
    ' ': 'Space',
    'space': 'Space',
    'backspace': 'Backspace',
    'tab': 'Tab',
    'capslock': 'CapsLock',
    'enter': 'Enter',
    'shift': 'LShift',
    'control': 'LCtrl',
    'alt': 'LAlt',
    'meta': 'LWin',
    'os': 'LWin',
    'insert': 'Insert',
    'delete': 'Delete',
    'home': 'Home',
    'end': 'End',
    'pageup': 'PgUp',
    'pagedown': 'PgDn',
    'arrowup': 'Up',
    'arrowdown': 'Down',
    'arrowleft': 'Left',
    'arrowright': 'Right',
    'printscreen': 'PrintScreen',
    'scrolllock': 'ScrollLock',
    'pause': 'Pause',
    'volumeup': 'Volume_Up',
    'volumedown': 'Volume_Down',
    'volumemute': 'Volume_Mute',
    'mediaplaypause': 'Media_Play_Pause',
    'mediatracknext': 'Media_Next',
    'mediatrackprevious': 'Media_Prev',
    'mediastop': 'Media_Stop',
    'browserback': 'Browser_Back',
    'browserforward': 'Browser_Forward',
    'browserrefresh': 'Browser_Refresh',
    'browserhome': 'Browser_Home',
  };

  const lowerKey = e.key.toLowerCase();
  if (keyMap[lowerKey]) {
    return keyMap[lowerKey];
  }

  // Final sanitization or literal return
  if (e.key.length === 1) {
    return e.key.toLowerCase();
  }

  return '';
}
