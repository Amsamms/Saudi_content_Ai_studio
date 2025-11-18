
import React from 'react';
import { STEPS } from '../constants';

interface StepperProps {
    currentStep: number;
    steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {currentStep > stepIdx + 1 ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-emerald-600" />
                                </div>
                                <div
                                    className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 transition"
                                >
                                    {STEPS[stepIdx].icon}
                                </div>
                            </>
                        ) : currentStep === stepIdx + 1 ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-slate-700" />
                                </div>
                                <div
                                    className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-500 bg-slate-800"
                                    aria-current="step"
                                >
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-slate-700" />
                                </div>
                                <div
                                    className="group relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800 hover:border-slate-500 transition"
                                >
                                    <span className="h-2.5 w-2.5 rounded-full bg-transparent " aria-hidden="true" />
                                </div>
                            </>
                        )}
                        <span className="absolute top-10 -left-2 w-20 text-center text-xs text-slate-400 mt-2">{step}</span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
