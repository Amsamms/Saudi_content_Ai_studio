import React, { useState } from 'react';
import type { AppState, VoiceOptions } from '../types';
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

const VOICE_PERSONAS = [
    { name: 'Kore', description: 'Neutral, Professional Male' },
    { name: 'Puck', description: 'Warm, Friendly Male' },
    { name: 'Charon', description: 'Deep, Authoritative Male' },
    { name: 'Fenrir', description: 'Bright, Energetic Female' },
    { name: 'Zephyr', description: 'Calm, Soothing Female' },
];

const ARABIC_ACCENTS = [
    { value: 'default', label: 'Standard Saudi' },
    { value: 'najdi', label: 'Najdi Accent' },
    { value: 'hejazi', label: 'Hejazi Accent' },
];

export const Step5_VoiceGeneration: React.FC<Step5Props> = ({ appState, updateState, onNext, onBack }) => {
    const [voiceOptions, setVoiceOptions] = useState<VoiceOptions>(appState.voiceOptions);

    const handleOptionsChange = (updates: Partial<VoiceOptions>) => {
        setVoiceOptions(prev => ({ ...prev, ...updates }));
    };

    const handleGenerate = async () => {
        if (appState.writtenContent && appState.language) {
             updateState({ status: AppStatus.LOADING, error: null, generatedAudio: null }); // Clear previous audio
            try {
                const audioB64 = await generateVoice(appState.writtenContent, appState.language, voiceOptions);
                updateState({ 
                    generatedAudio: audioB64, 
                    status: AppStatus.SUCCESS,
                    voiceOptions: voiceOptions // Save the settings used for generation
                });
            } catch (err) {
                const error = err as Error;
                updateState({ error: error.message, status: AppStatus.ERROR });
            }
        }
    };

    if (!appState.writtenContent) {
        return (
            <div className="text-center text-slate-400">
                <p>No content has been written. Please go back.</p>
                 <button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition">
                    &larr; Go Back
                </button>
            </div>
        )
    }

    const renderSlider = (label: string, value: number, min: number, max: number, step: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
         <div className="flex flex-col">
            <label htmlFor={label} className="mb-2 font-medium text-slate-300">{label}: <span className="font-bold text-emerald-400">{value}x</span></label>
            <input
                id={label}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full"
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 5: Voice Generation</h2>
            <p className="text-slate-400">
                Customize the voiceover for your content, then generate the audio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-800/50 rounded-lg">
                <div>
                    <label htmlFor="voice-persona" className="block mb-2 font-medium text-slate-300">Voice Persona</label>
                    <select
                        id="voice-persona"
                        value={voiceOptions.persona}
                        onChange={(e) => handleOptionsChange({ persona: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        {VOICE_PERSONAS.map(p => <option key={p.name} value={p.name}>{p.name} - {p.description}</option>)}
                    </select>
                </div>

                {appState.language === 'ar' && (
                     <div>
                        <label htmlFor="accent" className="block mb-2 font-medium text-slate-300">Saudi Accent</label>
                        <select
                            id="accent"
                            value={voiceOptions.accent}
                            onChange={(e) => handleOptionsChange({ accent: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            {ARABIC_ACCENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                    </div>
                )}
                
                {renderSlider(
                    "Speed", 
                    voiceOptions.speed, 
                    0.8, 1.2, 0.1, 
                    (e) => handleOptionsChange({ speed: parseFloat(e.target.value) })
                )}

                 {renderSlider(
                    "Pitch", 
                    voiceOptions.pitch, 
                    0.8, 1.2, 0.1, 
                    (e) => handleOptionsChange({ pitch: parseFloat(e.target.value) })
                )}
            </div>

            <div className="flex justify-center">
                 <button
                    onClick={handleGenerate}
                    disabled={appState.status === AppStatus.LOADING}
                    className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition text-lg"
                >
                    {appState.status === AppStatus.LOADING ? 'Generating...' : (appState.generatedAudio ? 'Regenerate Voice' : 'Generate Voice')}
                </button>
            </div>

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