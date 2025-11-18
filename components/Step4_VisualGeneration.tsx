
import React, { useEffect } from 'react';
import type { AppState } from '../types';
import { AppStatus } from '../types';
import { generateVisual } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Step4Props {
    appState: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const Step4_VisualGeneration: React.FC<Step4Props> = ({ appState, updateState, onNext, onBack }) => {

    useEffect(() => {
        const handleGenerate = async () => {
            if (appState.selectedIdea && !appState.generatedImage) {
                 updateState({ status: AppStatus.LOADING, error: null });
                try {
                    const imageB64 = await generateVisual(appState.selectedIdea);
                    updateState({ generatedImage: imageB64, status: AppStatus.SUCCESS });
                } catch (err) {
                    const error = err as Error;
                    updateState({ error: error.message, status: AppStatus.ERROR });
                }
            }
        };
        handleGenerate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.selectedIdea]);


    if (!appState.selectedIdea) {
        return (
            <div className="text-center text-slate-400">
                <p>No idea selected. Please go back to start.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 4: Visual Generation</h2>
            <p className="text-slate-400">
                Creating a unique, culturally relevant visual for <strong className="text-cyan-400">"{appState.selectedIdea.idea}"</strong>.
            </p>

            {appState.status === AppStatus.LOADING && <LoadingSpinner text="Designing Saudi-style visuals..." />}
            {appState.status === AppStatus.ERROR && <p className="text-red-400">{appState.error}</p>}
            
            {appState.generatedImage && appState.status !== AppStatus.LOADING && (
                 <div className="space-y-4">
                     <h3 className="text-xl font-semibold">Generated Image:</h3>
                     <div className="flex justify-center">
                        <img 
                            src={`data:image/jpeg;base64,${appState.generatedImage}`} 
                            alt={appState.selectedIdea.idea}
                            className="rounded-lg shadow-lg max-w-full h-auto border-4 border-slate-700"
                        />
                     </div>
                </div>
            )}
            
            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition">
                    &larr; Back
                </button>
                {appState.generatedImage && (
                    <button onClick={onNext} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition">
                        Next: Generate Voice &rarr;
                    </button>
                )}
            </div>
        </div>
    );
};
