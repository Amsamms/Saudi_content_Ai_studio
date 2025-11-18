import React, { useEffect, useState } from 'react';
import type { AppState, ImageEditOptions } from '../types';
import { AppStatus } from '../types';
import { generateVisual, generativelyEditVisual } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { defaultImageEditOptions } from '../constants';

interface Step4Props {
    appState: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onNext: () => void;
    onBack: () => void;
}

const getAspectRatioStyle = (aspectRatio: ImageEditOptions['aspectRatio']) => {
    switch (aspectRatio) {
        case '1:1': return { aspectRatio: '1 / 1', objectFit: 'cover' as const };
        case '4:5': return { aspectRatio: '4 / 5', objectFit: 'cover' as const };
        case '16:9': return { aspectRatio: '16 / 9', objectFit: 'cover' as const };
        default: return {};
    }
};

const applyEditsToCanvas = (
    base64Image: string,
    options: ImageEditOptions
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
            let destWidth = img.width, destHeight = img.height;

            if (options.aspectRatio !== 'original') {
                const [w, h] = options.aspectRatio.split(':').map(Number);
                const targetAspectRatio = w / h;
                const sourceAspectRatio = img.width / img.height;

                if (targetAspectRatio > sourceAspectRatio) { // Target is wider
                    sourceHeight = img.width / targetAspectRatio;
                    sourceY = (img.height - sourceHeight) / 2;
                } else { // Target is taller or same
                    sourceWidth = img.height * targetAspectRatio;
                    sourceX = (img.width - sourceWidth) / 2;
                }
                destWidth = sourceWidth;
                destHeight = sourceHeight;
            }

            canvas.width = destWidth;
            canvas.height = destHeight;
            
            ctx.filter = `brightness(${options.brightness}%) contrast(${options.contrast}%) grayscale(${options.grayscale}%) sepia(${options.sepia}%)`;
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);

            // Text Overlay
            if (options.textOverlay.text && options.textOverlay.position !== 'none') {
                const { text, position, color, fontFamily, fontSize, fontWeight, opacity, shadow } = options.textOverlay;
                
                ctx.globalAlpha = opacity;
                ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (shadow) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;
                }

                const x = destWidth / 2;
                const padding = fontSize * 0.5; // Add some padding from the edge
                const y = position === 'top' ? padding : destHeight - padding;

                ctx.fillText(text, x, y);

                // Reset canvas state
                ctx.globalAlpha = 1.0;
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }

            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (err) => reject(err);
        img.src = `data:image/jpeg;base64,${base64Image}`;
    });
};

const FONT_FAMILIES = [
    { name: 'Modern Sans', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Classic Serif', value: 'Georgia, Times New Roman, serif' },
    { name: 'Impact', value: 'Impact, sans-serif' },
    { name: 'Arabic (Tajawal)', value: 'Tajawal, Tahoma, sans-serif' },
    { name: 'Arabic (Cairo)', value: 'Cairo, Arial, sans-serif' },
];

export const Step4_VisualGeneration: React.FC<Step4Props> = ({ appState, updateState, onNext, onBack }) => {
    const [editOptions, setEditOptions] = useState<ImageEditOptions>(appState.imageEditOptions);
    const [isApplyingEdits, setIsApplyingEdits] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [generativePrompt, setGenerativePrompt] = useState('');
    const [isEditingGeneratively, setIsEditingGeneratively] = useState(false);

    useEffect(() => {
        const handleGenerate = async () => {
            if (appState.selectedIdea && !appState.generatedImage && appState.language) {
                 updateState({ status: AppStatus.LOADING, error: null });
                try {
                    const imageB64 = await generateVisual(appState.selectedIdea, appState.language);
                    updateState({ generatedImage: imageB64, status: AppStatus.SUCCESS });
                } catch (err) {
                    const error = err as Error;
                    updateState({ error: error.message, status: AppStatus.ERROR });
                }
            }
        };
        handleGenerate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.selectedIdea, appState.language]);

    const handleRegenerate = async () => {
        if (!appState.selectedIdea || !appState.language || isRegenerating) return;
        
        setIsRegenerating(true);
        updateState({ error: null }); // Clear previous errors
        try {
            const imageB64 = await generateVisual(appState.selectedIdea, appState.language);
            updateState({ 
                generatedImage: imageB64, 
                imageEditOptions: defaultImageEditOptions,
                status: AppStatus.SUCCESS,
            });
            setEditOptions(defaultImageEditOptions); // Reset local edits
        } catch (err) {
            const error = err as Error;
            updateState({ error: error.message, status: AppStatus.ERROR });
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleGenerativeEdit = async () => {
        if (!appState.generatedImage || !generativePrompt || isEditingGeneratively || !appState.language) return;

        setIsEditingGeneratively(true);
        updateState({ error: null });
        try {
            const editedImageB64 = await generativelyEditVisual(appState.generatedImage, generativePrompt, appState.language);
            updateState({
                generatedImage: editedImageB64,
                imageEditOptions: defaultImageEditOptions,
                status: AppStatus.SUCCESS,
            });
            setEditOptions(defaultImageEditOptions); // Reset manual edits
            setGenerativePrompt(''); // Clear prompt
        } catch (err) {
            const error = err as Error;
            updateState({ error: error.message, status: AppStatus.ERROR });
        } finally {
            setIsEditingGeneratively(false);
        }
    };

    const handleNextWithEdits = async () => {
        if (!appState.generatedImage) return;
        setIsApplyingEdits(true);
        try {
            const editedImage = await applyEditsToCanvas(appState.generatedImage, editOptions);
            const finalBase64 = editedImage.split(',')[1];
            updateState({ generatedImage: finalBase64, imageEditOptions: editOptions });
            onNext();
        } catch (error) {
            console.error("Failed to apply edits:", error);
            updateState({ error: "Failed to apply image edits. Please try again." });
        } finally {
            setIsApplyingEdits(false);
        }
    };
    
    const resetEdits = () => {
        setEditOptions(appState.imageEditOptions);
    }
    
    if (!appState.selectedIdea) {
        return (
            <div className="text-center text-slate-400">
                <p>No idea selected. Please go back to start.</p>
            </div>
        )
    }

    const imageStyle = {
        filter: `brightness(${editOptions.brightness}%) contrast(${editOptions.contrast}%) grayscale(${editOptions.grayscale}%) sepia(${editOptions.sepia}%)`,
        ...getAspectRatioStyle(editOptions.aspectRatio),
    };
    
    const textOverlayStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        color: editOptions.textOverlay.color,
        fontFamily: editOptions.textOverlay.fontFamily,
        fontSize: `${editOptions.textOverlay.fontSize}px`,
        fontWeight: editOptions.textOverlay.fontWeight,
        opacity: editOptions.textOverlay.opacity,
        textShadow: editOptions.textOverlay.shadow ? '2px 2px 8px rgba(0,0,0,0.7)' : 'none',
        pointerEvents: 'none',
        ...(editOptions.textOverlay.position === 'top' ? { top: `${editOptions.textOverlay.fontSize * 0.5}px` } : { bottom: `${editOptions.textOverlay.fontSize * 0.5}px` })
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setEditOptions(p => {
            const wasEmpty = p.textOverlay.text === '';
            return {
                ...p,
                textOverlay: {
                    ...p.textOverlay,
                    text: newText,
                    position: (wasEmpty && newText && p.textOverlay.position === 'none') ? 'top' : p.textOverlay.position,
                }
            };
        });
    };
    
    const anyLoading = isRegenerating || isEditingGeneratively || isApplyingEdits;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-400">Step 4: Visual Generation & Editing</h2>
            <p className="text-slate-400">
                Creating and editing a visual for <strong className="text-cyan-400">"{appState.selectedIdea.idea}"</strong>.
            </p>

            {appState.status === AppStatus.LOADING && !appState.generatedImage && <LoadingSpinner text="Designing Saudi-style visuals..." />}
            {appState.status === AppStatus.ERROR && <p className="text-red-400">{appState.error}</p>}
            
            {appState.generatedImage && (
                 <div className="flex flex-col lg:flex-row gap-8">
                    {/* Image Preview */}
                    <div className="lg:w-1/2 flex-shrink-0">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Visual Preview</h3>
                             <button
                                onClick={handleRegenerate}
                                disabled={anyLoading}
                                className="px-4 py-2 text-sm bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition flex items-center"
                            >
                                {isRegenerating ? 'Generating...' : 'Regenerate'}
                            </button>
                         </div>
                         <div style={getAspectRatioStyle(editOptions.aspectRatio)} className="relative w-full overflow-hidden rounded-lg border-4 border-slate-700 bg-slate-800">
                           <img 
                                src={`data:image/jpeg;base64,${appState.generatedImage}`} 
                                alt={appState.selectedIdea.idea}
                                className={`w-full h-full transition-opacity duration-300 ${anyLoading ? 'opacity-30' : 'opacity-100'}`}
                                style={imageStyle}
                            />
                             {(isRegenerating || isEditingGeneratively) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
                                </div>
                            )}
                             {editOptions.textOverlay.text && editOptions.textOverlay.position !== 'none' && !anyLoading && (
                                <div style={textOverlayStyle}>{editOptions.textOverlay.text}</div>
                             )}
                        </div>
                    </div>
                    {/* Editor Panel */}
                    <div className="lg:w-1/2 bg-slate-900/50 p-4 rounded-lg space-y-4 overflow-y-auto">
                        <h4 className="font-semibold text-lg text-cyan-400">Editor Tools</h4>
                        
                        {/* Generative AI Edit */}
                        <div className="space-y-2 border-b border-slate-700 pb-4">
                            <label htmlFor="generative-prompt" className="block text-sm font-medium text-slate-300">Generative AI Edit</label>
                            <textarea
                                id="generative-prompt"
                                value={generativePrompt}
                                onChange={(e) => setGenerativePrompt(e.target.value)}
                                placeholder="e.g., 'change the shirt to red', 'make the sky a sunset'"
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                rows={2}
                                disabled={anyLoading}
                            />
                            <button
                                onClick={handleGenerativeEdit}
                                disabled={anyLoading || !generativePrompt}
                                className="w-full px-4 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition"
                            >
                                {isEditingGeneratively ? 'Applying AI Edit...' : 'Apply AI Edit'}
                            </button>
                        </div>
                        
                        {/* Manual Edits */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Aspect Ratio</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['original', '1:1', '4:5', '16:9'].map(ratio => (
                                             <button key={ratio} onClick={() => setEditOptions(p => ({...p, aspectRatio: ratio as any}))} className={`px-3 py-1 text-sm rounded-md transition ${editOptions.aspectRatio === ratio ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{ratio}</button>
                                        ))}
                                    </div>
                               </div>
                               <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Filters</label>
                                    <div className="flex gap-2">
                                         <button onClick={() => setEditOptions(p => ({...p, grayscale: p.grayscale > 0 ? 0 : 100}))} className={`px-3 py-1 text-sm rounded-md transition ${editOptions.grayscale > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Grayscale</button>
                                         <button onClick={() => setEditOptions(p => ({...p, sepia: p.sepia > 0 ? 0 : 100}))} className={`px-3 py-1 text-sm rounded-md transition ${editOptions.sepia > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Sepia</button>
                                    </div>
                               </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300">Brightness: {editOptions.brightness}%</label>
                                    <input type="range" min="50" max="150" value={editOptions.brightness} onChange={e => setEditOptions(p => ({...p, brightness: +e.target.value}))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-emerald-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300">Contrast: {editOptions.contrast}%</label>
                                    <input type="range" min="50" max="150" value={editOptions.contrast} onChange={e => setEditOptions(p => ({...p, contrast: +e.target.value}))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-emerald-500" />
                                </div>
                            </div>
                            <div className="border-t border-slate-700 pt-4 space-y-4">
                                 <h5 className="font-semibold text-base text-cyan-400">Text Overlay</h5>
                                 <input type="text" value={editOptions.textOverlay.text} onChange={handleTextChange} placeholder="Add text..." className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Position</label>
                                        <select value={editOptions.textOverlay.position} onChange={e => setEditOptions(p => ({...p, textOverlay: {...p.textOverlay, position: e.target.value as any}}))} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                                            <option value="none">None</option>
                                            <option value="top">Top</option>
                                            <option value="bottom">Bottom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Font Family</label>
                                        <select value={editOptions.textOverlay.fontFamily} onChange={e => setEditOptions(p => ({...p, textOverlay: {...p.textOverlay, fontFamily: e.target.value}}))} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                                            {FONT_FAMILIES.map(font => <option key={font.value} value={font.value}>{font.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300">Font Size: {editOptions.textOverlay.fontSize}px</label>
                                        <input type="range" min="12" max="96" value={editOptions.textOverlay.fontSize} onChange={e => setEditOptions(p => ({...p, textOverlay: {...p.textOverlay, fontSize: +e.target.value}}))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300">Opacity: {Math.round(editOptions.textOverlay.opacity * 100)}%</label>
                                        <input type="range" min="0.1" max="1" step="0.1" value={editOptions.textOverlay.opacity} onChange={e => setEditOptions(p => ({...p, textOverlay: {...p.textOverlay, opacity: +e.target.value}}))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-emerald-500" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Color</label>
                                            <input type="color" value={editOptions.textOverlay.color} onChange={e => setEditOptions(p => ({...p, textOverlay: {...p.textOverlay, color: e.target.value}}))} className="w-12 h-10 p-1 bg-slate-700 border border-slate-600 rounded-md cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Style</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditOptions(p => ({...p, textOverlay: {...p.textOverlay, fontWeight: p.textOverlay.fontWeight === 'bold' ? 'normal' : 'bold'}}))} className={`px-3 py-1 text-sm rounded-md transition ${editOptions.textOverlay.fontWeight === 'bold' ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Bold</button>
                                                <button onClick={() => setEditOptions(p => ({...p, textOverlay: {...p.textOverlay, shadow: !p.textOverlay.shadow}}))} className={`px-3 py-1 text-sm rounded-md transition ${editOptions.textOverlay.shadow ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Shadow</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button onClick={resetEdits} className="text-sm text-slate-400 hover:text-white transition">Reset Manual Edits</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between pt-4">
                <button onClick={onBack} disabled={anyLoading} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition disabled:bg-slate-500">
                    &larr; Back
                </button>
                {appState.generatedImage && (
                    <button 
                        onClick={handleNextWithEdits} 
                        disabled={anyLoading}
                        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition disabled:bg-slate-500"
                    >
                        {isApplyingEdits ? 'Applying Edits...' : 'Next: Generate Voice \u2192'}
                    </button>
                )}
            </div>
        </div>
    );
};