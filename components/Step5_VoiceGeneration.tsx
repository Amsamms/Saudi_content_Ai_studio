
import React, { useEffect } from 'react';
import type { AppState } from '../types';
import { AppStatus } from '../types';
import { generateVoice } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { AudioPlayer } from './AudioPlayer';

interface Step5Props {
    appState: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const Step5_VoiceGeneration: React.FC<Step5Props> = ({ appState, updateState, onNext, onBack }) => {

    useEffect(() => {
        const handleGenerate = async () => {
            if (appState.writtenContent && !appState.generatedAudio) {
                 updateState({ status: AppStatus.LOADING, error: null });
                try {
                    const audioB64 = await generateVoice(appState.writtenContent);
                    updateState({ generatedAudio: audioB64, status: AppStatus.SUCCESS });
                } catch (err) {
                    const error = err as Error;
                    updateState({ error: error.message, status: AppStatus.ERROR });
                }
            }
        };
        handleGenerate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.writtenContent]);


    if (!appState.writtenContent) {
        return (
            <div className="text-center text-slate-400">
                <p>No content has been written. Please go back.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 5: Voice Generation</h2>
            <p className="text-slate-400">
                The AI is now generating a high-quality voiceover for your content.
            </p>

            {appState.status === AppStatus.LOADING && <LoadingSpinner text="Producing voiceover..." />}
            {appState.status === AppStatus.ERROR && <p className="text-red-400">{appState.error}</p>}
            
            {appState.generatedAudio && appState.status !== AppStatus.LOADING && (
                 <div className="space-y-4">
                     <h3 className="text-xl font-semibold">Generated Audio:</h3>
                     <AudioPlayer base64Audio={appState.generatedAudio} />
                </div>
            )}
            
            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition">
                    &larr; Back
                </button>
                {appState.generatedAudio && (
                    <button onClick={onNext} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition">
                        Next: Review & Publish &rarr;
                    </button>
                )}
            </div>
        </div>
    );
};
