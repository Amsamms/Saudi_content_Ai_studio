import React from 'react';
import type { AppState, ContentIdea } from '../types';
import { AppStatus } from '../types';
import { generateContentIdeas } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Step2Props {
    appState: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const Step2_IdeaGeneration: React.FC<Step2Props> = ({ appState, updateState, onNext, onBack }) => {

    const handleGenerate = async () => {
        if (!appState.language) return;
        updateState({ status: AppStatus.LOADING, error: null });
        try {
            const ideas = await generateContentIdeas(appState.marketAnalysis, appState.industry, appState.language);
            updateState({ contentIdeas: ideas, status: AppStatus.SUCCESS });
        } catch (err) {
            const error = err as Error;
            updateState({ error: error.message, status: AppStatus.ERROR });
        }
    };
    
    const handleSelectIdea = (idea: ContentIdea) => {
        updateState({ selectedIdea: idea });
        onNext();
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 2: Idea & Content Type Generation</h2>
            <p className="text-slate-400">
                Based on the analysis, our AI will now suggest tailored content ideas and the best formats for them.
            </p>

            {appState.contentIdeas.length === 0 && (
                 <button
                    onClick={handleGenerate}
                    disabled={appState.status === AppStatus.LOADING}
                    className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition"
                >
                    {appState.status === AppStatus.LOADING ? 'Generating...' : 'Generate Content Ideas'}
                </button>
            )}

            {appState.status === AppStatus.LOADING && <LoadingSpinner text="Brainstorming creative ideas..." />}
            {appState.status === AppStatus.ERROR && <p className="text-red-400">{appState.error}</p>}
            
            {appState.contentIdeas.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Choose an Idea:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appState.contentIdeas.map((idea, index) => (
                            <div key={index} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex flex-col justify-between">
                                <div>
                                    <span className="inline-block bg-cyan-500/20 text-cyan-300 text-xs font-medium px-2 py-1 rounded-full mb-2">{idea.type}</span>
                                    <h4 className="font-bold text-lg text-white">{idea.idea}</h4>
                                    <p className="text-slate-400 text-sm mt-1">{idea.description}</p>
                                </div>
                                <button
                                    onClick={() => handleSelectIdea(idea)}
                                    className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition"
                                >
                                    Select & Write Content
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition">
                    &larr; Back
                </button>
            </div>
        </div>
    );
};