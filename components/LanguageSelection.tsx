import React from 'react';
import type { Language } from '../types';

interface LanguageSelectionProps {
    onSelectLanguage: (language: Language) => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onSelectLanguage }) => {
    return (
        <div className="bg-slate-800/50 rounded-2xl shadow-lg p-8 border border-slate-700 text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                Choose Your Language / اختر لغتك
            </h2>
            <p className="text-slate-400 mt-4">
                Select the language for your content creation journey.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-6">
                <button
                    onClick={() => onSelectLanguage('en')}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-transform hover:scale-105 text-xl"
                >
                    English
                </button>
                <button
                    onClick={() => onSelectLanguage('ar')}
                    className="px-8 py-4 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-transform hover:scale-105 text-xl"
                >
                    العربية (Arabic)
                </button>
            </div>
        </div>
    );
};
