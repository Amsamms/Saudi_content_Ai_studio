export enum AppStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error',
}

export interface ContentIdea {
    type: string;
    idea: string;
    description: string;
}

export type Language = 'en' | 'ar';

export interface VoiceOptions {
    persona: string; // Corresponds to prebuiltVoiceConfig.voiceName
    accent: string; // 'default', 'najdi', 'hejazi' for Arabic
    pitch: number; // e.g., 0.8 (low), 1 (normal), 1.2 (high)
    speed: number; // e.g., 0.8 (slow), 1 (normal), 1.2 (fast)
}

export interface ImageEditOptions {
    brightness: number; // 100 is default
    contrast: number; // 100 is default
    grayscale: number; // 0 is default
    sepia: number; // 0 is default
    aspectRatio: 'original' | '1:1' | '4:5' | '16:9';
    textOverlay: {
        text: string;
        position: 'top' | 'bottom' | 'none';
        color: string;
        fontFamily: string;
        fontSize: number; // in pixels
        fontWeight: 'normal' | 'bold';
        opacity: number; // 0 to 1
        shadow: boolean;
    };
}

export interface AppState {
    status: AppStatus;
    language: Language | null;
    industry: string;
    marketAnalysis: string;
    contentIdeas: ContentIdea[];
    selectedIdea: ContentIdea | null;
    writtenContent: string;
    generatedImage: string | null; // base64 string
    generatedAudio: string | null; // base64 string
    voiceOptions: VoiceOptions;
    imageEditOptions: ImageEditOptions;
    publishDescription: string;
    error: string | null;
}