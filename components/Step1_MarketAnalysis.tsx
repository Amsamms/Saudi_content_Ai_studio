
import React, { useState } from 'react';
import type { AppState } from '../types';
import { AppStatus } from '../types';
import { generateMarketAnalysis } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Step1Props {
    appState: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onNext: () => void;
}

export const Step1_MarketAnalysis: React.FC<Step1Props> = ({ appState, updateState, onNext }) => {
    const [localIndustry, setLocalIndustry] = useState(appState.industry);

    const handleGenerate = async () => {
        if (!localIndustry) {
            updateState({ error: 'Please enter an industry.' });
            return;
        }
        updateState({ status: AppStatus.LOADING, industry: localIndustry, error: null });
        try {
            const analysis = await generateMarketAnalysis(localIndustry);
            updateState({ marketAnalysis: analysis, status: AppStatus.SUCCESS });
        } catch (err) {
            const error = err as Error;
            updateState({ error: error.message, status: AppStatus.ERROR });
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 1: Market & Competitor Analysis</h2>
            <p className="text-slate-400">
                Start by telling us your industry or topic of interest. Our AI will conduct a deep analysis of the Saudi Arabian market to uncover trends, competitors, and audience behavior.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={localIndustry}
                    onChange={(e) => setLocalIndustry(e.target.value)}
                    placeholder="e.g., 'Fast-food restaurants', 'Fashion', 'Tech startups'"
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    disabled={appState.status === AppStatus.LOADING}
                />
                <button
                    onClick={handleGenerate}
                    disabled={appState.status === AppStatus.LOADING || !localIndustry}
                    className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition"
                >
                    {appState.status === AppStatus.LOADING ? 'Analyzing...' : 'Analyze Market'}
                </button>
            </div>

            {appState.status === AppStatus.ERROR && <p className="text-red-400">{appState.error}</p>}

            {appState.status === AppStatus.LOADING && <LoadingSpinner text="Analyzing Saudi market..." />}

            {appState.marketAnalysis && appState.status !== AppStatus.LOADING && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-semibold">Analysis Results:</h3>
                    <div className="prose prose-invert bg-slate-900/50 p-4 rounded-lg max-w-none prose-p:text-slate-300 prose-headings:text-emerald-400">
                       <pre className="whitespace-pre-wrap font-sans">{appState.marketAnalysis}</pre>
                    </div>
                     <div className="flex justify-end pt-4">
                        <button onClick={onNext} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition">
                            Next: Generate Ideas &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
