const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let keyboardListener = null;
let longPressTimer = null;
let singlePressTimer = null;
let isLongPressTriggered = false;

const csharpHookSource = `
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

public class CopilotHook {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_KEYUP = 0x0101;
    private const int WM_SYSKEYDOWN = 0x0104;
    private const int WM_SYSKEYUP = 0x0105;
    private const int VK_F23 = 0x86;
    private const int VK_F24 = 0x87;
    private const int VK_C = 0x43;
    private const int VK_LWIN = 0x5B;
    private const int VK_RWIN = 0x5C;

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    [DllImport("user32.dll")]
    public static extern short GetAsyncKeyState(int vkey);

    [DllImport("user32.dll")]
    public static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    public static extern bool TranslateMessage([In] ref MSG lpMsg);

    [DllImport("user32.dll")]
    public static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

    [StructLayout(LayoutKind.Sequential)]
    public struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int ptX;
        public int ptY;
    }

    public delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    private static IntPtr hookId = IntPtr.Zero;
    private static LowLevelKeyboardProc hookProc = HookCallback;
    private static bool isKeyDown = false;

    public static void Start() {
        hookId = SetHook(hookProc);
        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }
    }

    public static void Stop() {
        if (hookId != IntPtr.Zero) {
            UnhookWindowsHookEx(hookId);
            hookId = IntPtr.Zero;
        }
    }

    private static IntPtr SetHook(LowLevelKeyboardProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0) {
            int vkCode = Marshal.ReadInt32(lParam);
            bool isDown = (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN);
            bool isUp = (wParam == (IntPtr)WM_KEYUP || wParam == (IntPtr)WM_SYSKEYUP);

            bool isCopilotKey = (vkCode == VK_F23 || vkCode == VK_F24);
            bool isWinC = false;

            if (vkCode == VK_C) {
                bool winDown = (GetAsyncKeyState(VK_LWIN) & 0x8000) != 0 || (GetAsyncKeyState(VK_RWIN) & 0x8000) != 0;
                if (winDown) {
                    isWinC = true;
                }
            }

            if (isCopilotKey || isWinC) {
                if (isDown) {
                    if (!isKeyDown) {
                        isKeyDown = true;
                        Console.WriteLine("HOTKEY_DOWN");
                    }
                    return (IntPtr)1;
                } else if (isUp) {
                    isKeyDown = false;
                    Console.WriteLine("HOTKEY_UP");
                    return (IntPtr)1;
                }
            }
        }
        return CallNextHookEx(hookId, nCode, wParam, lParam);
    }
}
`;

function stopHotkeyListener() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    if (singlePressTimer) {
        clearTimeout(singlePressTimer);
        singlePressTimer = null;
    }
    isLongPressTriggered = false;

    if (keyboardListener) {
        try {
            keyboardListener.kill();
        } catch (error) {
            console.error('Error stopping keyboard listener:', error);
        }
        keyboardListener = null;
    }
}

function setupHotkey(config, onTrigger) {
    try {
        stopHotkeyListener();

        if (!config || !config.enabled) {
            return;
        }

        const configDir = (app && typeof app.getPath === 'function')
            ? app.getPath('userData')
            : path.join(process.env.APPDATA || '.', 'zenith');
        const scriptPath = path.join(configDir, 'keylistener.ps1');

        const psScript = `
$csharp = @'
${csharpHookSource}
'@

Add-Type -TypeDefinition $csharp
[CopilotHook]::Start()
`;

        fs.writeFileSync(scriptPath, psScript, 'utf-8');

        keyboardListener = spawn('powershell.exe', [
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-File', scriptPath
        ], {
            detached: false,
            windowsHide: true
        });

        keyboardListener.stdout.on('data', (data) => {
            const lines = data.toString().split(/\r?\n/);
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === 'HOTKEY_DOWN') {
                    isLongPressTriggered = false;
                    if (longPressTimer) {
                        clearTimeout(longPressTimer);
                    }
                    longPressTimer = setTimeout(() => {
                        isLongPressTriggered = true;
                        if (typeof onTrigger === 'function') {
                            onTrigger('longPress');
                        }
                    }, 450);
                } else if (trimmed === 'HOTKEY_UP') {
                    if (longPressTimer) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }

                    if (isLongPressTriggered) {
                        isLongPressTriggered = false;
                        continue;
                    }

                    if (singlePressTimer) {
                        clearTimeout(singlePressTimer);
                        singlePressTimer = null;
                        if (typeof onTrigger === 'function') {
                            onTrigger('doublePress');
                        }
                    } else {
                        singlePressTimer = setTimeout(() => {
                            singlePressTimer = null;
                            if (typeof onTrigger === 'function') {
                                onTrigger('singlePress');
                            }
                        }, 280);
                    }
                }
            }
        });

        keyboardListener.stderr.on('data', (data) => {
            console.warn('Hotkey listener warning:', data.toString().trim());
        });
    } catch (error) {
        console.error('Error setting up hotkey listener:', error);
    }
}

module.exports = {
    setupHotkey,
    stopHotkeyListener
};
