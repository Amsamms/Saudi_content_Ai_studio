
import React, { useEffect, useState } from 'react';
import type { AppState } from '../types';
import { AppStatus } from '../types';
import { generatePublishDescription } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { AudioPlayer } from './AudioPlayer';

interface Step6Props {
    appState: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onBack: () => void;
    onRestart: () => void;
}

export const Step6_Publish: React.FC<Step6Props> = ({ appState, updateState, onBack, onRestart }) => {
    const [published, setPublished] = useState(false);

    useEffect(() => {
        const handleGenerateDesc = async () => {
            if (appState.writtenContent && appState.selectedIdea && !appState.publishDescription) {
                updateState({ status: AppStatus.LOADING, error: null });
                try {
                    const desc = await generatePublishDescription(appState.writtenContent, appState.selectedIdea);
                    updateState({ publishDescription: desc, status: AppStatus.SUCCESS });
                } catch (err) {
                    const error = err as Error;
                    updateState({ error: error.message, status: AppStatus.ERROR });
                }
            }
        };
        handleGenerateDesc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.writtenContent, appState.selectedIdea]);

    if (published) {
        return (
             <div className="text-center space-y-6">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-200">
                    <svg className="h-10 w-10 text-green-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                 </div>
                <h2 className="text-2xl font-bold text-emerald-400">Content Published!</h2>
                <p className="text-slate-300">Your content has been successfully prepared and is ready for social media.</p>
                <button
                    onClick={onRestart}
                    className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition text-lg"
                >
                    Create New Content
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 6: Review & Publish</h2>
            <p className="text-slate-400">
                Here is your complete content package. Review everything and when you're ready, hit publish!
            </p>
            
            <div className="bg-slate-900/50 p-6 rounded-lg space-y-6">
                 {appState.generatedImage && (
                    <div className="flex justify-center">
                        <img 
                            src={`data:image/jpeg;base64,${appState.generatedImage}`} 
                            alt={appState.selectedIdea?.idea}
                            className="rounded-lg shadow-lg w-full max-w-md h-auto border-4 border-slate-700"
                        />
                     </div>
                 )}

                {appState.generatedAudio && <AudioPlayer base64Audio={appState.generatedAudio} />}
                
                {appState.status === AppStatus.LOADING && !appState.publishDescription && <LoadingSpinner text="Writing social media description..." />}
                {appState.status === AppStatus.ERROR && <p className="text-red-400">{appState.error}</p>}

                {appState.publishDescription && (
                     <div>
                        <h3 className="text-xl font-semibold mb-2 text-cyan-400">Suggested Caption:</h3>
                        <div className="prose prose-invert max-w-none prose-p:text-slate-300">
                             <pre className="whitespace-pre-wrap font-sans bg-slate-800 p-4 rounded-md">{appState.publishDescription}</pre>
                        </div>
                     </div>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between pt-4 gap-4">
                <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition">
                    &larr; Back
                </button>
                <button 
                    onClick={() => setPublished(true)}
                    disabled={!appState.publishDescription}
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition text-lg"
                >
                    Publish
                </button>
            </div>
        </div>
    );
};
