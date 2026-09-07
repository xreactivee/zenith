export type ActionType = 'zenith' | 'app' | 'command';

export type CommandType = 'cmd' | 'powershell';

export type TriggerType = 'singlePress' | 'doublePress' | 'longPress';

export interface TriggerAction {
    action: ActionType;
    actionValue: string;
    commandType: CommandType;
}

export interface Profile {
    id: string;
    name: string;
    triggers: Record<TriggerType, TriggerAction>;
}

export interface HotkeyConfig {
    keyCode: string;
    keys: string[];
}

export interface AppConfig {
    activeProfileId: string;
    profiles: Profile[];
    autoStart: boolean;
    enabled: boolean;
    hotkey: HotkeyConfig;
}

export interface InstalledApp {
    name: string;
    publisher: string;
    path: string;
    icon: string | null;
}

export type HttpStatus = 200 | 201 | 204 | 400 | 404 | 500;

export type HttpStatusText =
    | '200 OK'
    | '201 CREATED'
    | '204 NO CONTENT'
    | '400 BAD REQUEST'
    | '404 NOT FOUND'
    | '500 INTERNAL SERVER ERROR';

export interface ApiResponse<T = any> {
    status: HttpStatus;
    statusText: HttpStatusText;
    data?: T;
    error?: string;
}

export type WindowControlAction = 'minimize' | 'close';

export interface ElectronApi {
    loadConfig: () => Promise<ApiResponse<AppConfig>>;
    saveConfig: (config: AppConfig) => Promise<ApiResponse<AppConfig>>;
    executeAction: (triggerAction: TriggerAction) => Promise<ApiResponse<{ executed: boolean }>>;
    windowControl: (action: WindowControlAction) => void;
    getInstalledApps: () => Promise<ApiResponse<InstalledApp[]>>;
    setAutoStart: (enabled: boolean) => Promise<ApiResponse<{ autoStart: boolean }>>;
    setActiveProfile: (profileId: string) => Promise<ApiResponse<AppConfig>>;
    deleteProfile: (profileId: string) => Promise<ApiResponse<AppConfig>>;
}
