/**
 * Helper utility to handle native desktop file saving when running inside a Tauri container.
 * Safely falls back if running in a standard web browser environment.
 */

export function isRunningInTauri(): boolean {
  return typeof window !== 'undefined' && !!(
    (window as any).__TAURI__ || 
    (window as any).__TAURI_METADATA__ || 
    (window as any).__TAURI_IPC__
  );
}

export interface SaveResult {
  success: boolean;
  path?: string;
  cancelled?: boolean;
  error?: string;
}

export async function saveAhkToDisk(filename: string, content: string): Promise<SaveResult> {
  if (!isRunningInTauri()) {
    return { success: false, error: 'Not running inside a Tauri desktop app.' };
  }

  try {
    let saveFn: any = null;
    let writeFn: any = null;

    // 1. Try global window Tauri APIs first (highly reliable if withGlobalTauri is active)
    const gTauri = (window as any).__TAURI__;
    if (gTauri) {
      if (gTauri.dialog?.save) {
        saveFn = gTauri.dialog.save;
      }
      if (gTauri.fs?.writeTextFile) {
        writeFn = gTauri.fs.writeTextFile;
      } else if (gTauri.fs?.writeFile) {
        writeFn = async (path: string, text: string) => {
          return gTauri.fs.writeFile({ path, contents: text });
        };
      }
    }

    // 2. If globals aren't present, try importing Tauri v1 modules dynamically
    if (!saveFn) {
      try {
        const pathV1 = '@tauri' + '-apps/api/dialog';
        const dialogMod = await import(/* @vite-ignore */ pathV1);
        saveFn = dialogMod.save;
      } catch (e) {
        // Fail-over to Tauri v2 plugin
        try {
          const pathV2 = '@tauri' + '-apps/plugin-dialog';
          const dialogMod = await import(/* @vite-ignore */ pathV2);
          saveFn = dialogMod.save;
        } catch (e2) {
          // ignore
        }
      }
    }

    if (!writeFn) {
      try {
        const pathV1 = '@tauri' + '-apps/api/fs';
        const fsMod = await import(/* @vite-ignore */ pathV1);
        writeFn = fsMod.writeTextFile;
      } catch (e) {
        // Fail-over to Tauri v2 plugin
        try {
          const pathV2 = '@tauri' + '-apps/plugin-fs';
          const fsMod = await import(/* @vite-ignore */ pathV2);
          writeFn = fsMod.writeTextFile;
        } catch (e2) {
          // ignore
        }
      }
    }

    // 3. Fallback check
    if (!saveFn || !writeFn) {
      throw new Error(
        'Tauri File System or Dialog APIs are not available.\n\n' +
        'To enable local saving, ensure that you have configured permissions in your tauri.conf.json.\n' +
        '- In Tauri v1: Ensure "dialog" and "fs" are allowed in "allowlist".\n' +
        '- In Tauri v2: Ensure "@tauri-apps/plugin-dialog" and "@tauri-apps/plugin-fs" are added to your src-tauri/Cargo.toml and capabilities config.'
      );
    }

    // Open native save-file dialog
    const filePath = await saveFn({
      title: 'Save AutoHotkey Script',
      defaultPath: filename,
      filters: [
        {
          name: 'AutoHotkey Script',
          extensions: ['ahk'],
        },
      ],
    });

    if (!filePath) {
      return { success: true, cancelled: true };
    }

    // Write file content natively to selected path
    await writeFn(filePath, content);
    return { success: true, path: filePath };
  } catch (err: any) {
    console.error('Tauri save-to-disk failed:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
