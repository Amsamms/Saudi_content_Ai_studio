
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { decode, decodeAudioData } from '../utils/audio';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);


interface AudioPlayerProps {
    base64Audio: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64Audio }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    useEffect(() => {
        const prepareAudio = async () => {
            if (!base64Audio) return;
            try {
                // Safari requires the context to be created after a user interaction, but we create it here. 
                // Playback will be initiated by a user click, which should be fine.
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const audioBytes = decode(base64Audio);
                const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
                audioBufferRef.current = buffer;
                setIsReady(true);
            } catch (error) {
                console.error("Failed to decode audio data:", error);
                setIsReady(false);
            }
        };

        prepareAudio();

        return () => {
            sourceRef.current?.stop();
            setIsPlaying(false);
        };
    }, [base64Audio]);


    const togglePlay = () => {
        if (!isReady || !audioBufferRef.current || !audioContextRef.current) return;

        if (isPlaying) {
            sourceRef.current?.stop();
            setIsPlaying(false);
        } else {
            // Ensure context is running
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsPlaying(false);
            };
            source.start();
            sourceRef.current = source;
            setIsPlaying(true);
        }
    };

    return (
        <div className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
            <button
                onClick={togglePlay}
                disabled={!isReady}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white disabled:bg-slate-500 disabled:cursor-not-allowed transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-emerald-500"
            >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="text-slate-300">
                {isReady ? "Generated Voiceover Ready" : "Preparing audio..."}
            </div>
        </div>
    );
};
