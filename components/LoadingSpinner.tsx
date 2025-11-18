
import React from 'react';

interface LoadingSpinnerProps {
    text: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 my-8">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
            <p className="text-slate-300 text-lg">{text}</p>
        </div>
    );
};
