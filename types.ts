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
    publishDescription: string;
    error: string | null;
}