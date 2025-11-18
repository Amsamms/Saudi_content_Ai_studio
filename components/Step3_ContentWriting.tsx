import React, { useEffect } from 'react';
import type { AppState } from '../types';
import { AppStatus } from '../types';
import { writeContent } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Step3Props {
    appState: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const Step3_ContentWriting: React.FC<Step3Props> = ({ appState, updateState, onNext, onBack }) => {

    useEffect(() => {
        const handleWriteContent = async () => {
            if (appState.selectedIdea && !appState.writtenContent && appState.language) {
                updateState({ status: AppStatus.LOADING, error: null });
                try {
                    const content = await writeContent(appState.selectedIdea, appState.language);
                    updateState({ writtenContent: content, status: AppStatus.SUCCESS });
                } catch (err) {
                    const error = err as Error;
                    updateState({ error: error.message, status: AppStatus.ERROR });
                }
            }
        };

        handleWriteContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.selectedIdea, appState.language]);

    if (!appState.selectedIdea) {
        return (
            <div className="text-center text-slate-400">
                <p>No idea selected. Please go back and choose an idea.</p>
                 <button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition">
                    &larr; Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 3: Content Writing</h2>
            <p className="text-slate-400">
                The AI is now crafting the content for your chosen idea: <strong className="text-cyan-400">"{appState.selectedIdea.idea}"</strong>.
            </p>

            {appState.status === AppStatus.LOADING && <LoadingSpinner text="Writing compelling content..." />}
            {appState.status === AppStatus.ERROR && <p className="text-red-400">{appState.error}</p>}

            {appState.writtenContent && appState.status !== AppStatus.LOADING && (
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold">Generated Content:</h3>
                     <div className="prose prose-invert bg-slate-900/50 p-4 rounded-lg max-w-none prose-p:text-slate-300 prose-headings:text-emerald-400">
                       <pre className="whitespace-pre-wrap font-sans">{appState.writtenContent}</pre>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition">
                    &larr; Back
                </button>
                {appState.writtenContent && (
                    <button onClick={onNext} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition">
                        Next: Generate Visuals &rarr;
                    </button>
                )}
            </div>
        </div>
    );
};