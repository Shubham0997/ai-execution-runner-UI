import React, { useState, useRef } from 'react';
import { Play, Paperclip, X, Square, Upload } from 'lucide-react';
import type { ExecutionMode } from './MainPanel';

interface ImageItem {
    file: File;
    previewUrl: string;
}

interface PromptAreaProps {
    onRun: (prompt: string, files: File[]) => void;
    onKill?: () => void;
    isRunning: boolean;
    mode?: ExecutionMode;
}

export const PromptArea: React.FC<PromptAreaProps> = ({ onRun, onKill, isRunning, mode = 'standard' }) => {
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Onboarding Mode State
    const [companyName, setCompanyName] = useState('');
    const [mappingFile, setMappingFile] = useState<File | null>(null);
    const [dataFile, setDataFile] = useState<File | null>(null);
    const [onboardingInstructions, setOnboardingInstructions] = useState('');

    // Upload refs for Onboarding
    const mappingInputRef = useRef<HTMLInputElement>(null);
    const dataInputRef = useRef<HTMLInputElement>(null);

    const addFiles = (files: FileList | File[]) => {
        const newItems = Array.from(files)
            .filter((f) => f.type.startsWith('image/'))
            .map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
            }));
        setImages((prev) => [...prev, ...newItems]);
    };

    const removeImage = (idx: number) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[idx].previewUrl);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (mode === 'standard') {
                addFiles(e.dataTransfer.files);
            }
        }
    };

    const handleSubmit = () => {
        if (mode === 'standard') {
            onRun(prompt, images.map((i) => i.file));
        } else {
            // Construct the structured onboarding prompt
            const constructedPrompt = `# Company Onboarding Context

## Company Name
${companyName.trim()}

## Mapping Specification
File: ${mappingFile?.name || 'None'}

## Sample Data File
File: ${dataFile?.name || 'None'}

## User prompt
${onboardingInstructions.trim()}

## Objective
Generate:
1. New Parser extending BaseBillParser
2. Required REC population methods
3. Update ParserPicker
4. Generate corresponding FTL template`;

            // Collect files to send
            const filesToSend: File[] = [];
            if (mappingFile) filesToSend.push(mappingFile);
            if (dataFile) filesToSend.push(dataFile);

            onRun(constructedPrompt, filesToSend);
        }
    };

    const isRunDisabled = isRunning ||
        (mode === 'standard' && !prompt.trim() && images.length === 0) ||
        (mode === 'onboarding' && (!companyName.trim() || !mappingFile || !dataFile || !onboardingInstructions.trim()));

    return (
        <div className="flex flex-col gap-3">
            <div
                className={`relative flex flex-col rounded-xl border bg-panel transition-colors duration-200 ${mode === 'standard' && isDragging ? 'border-primary ring-1 ring-primary/50' : 'border-border focus-within:border-zinc-500'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {mode === 'standard' ? (
                    <>
                        <textarea
                            className="w-full min-h-[120px] bg-transparent p-4 outline-none resize-none text-sm text-zinc-200 placeholder:text-zinc-600 font-mono"
                            placeholder="System: Write your instructions here. Drag & drop images or click the attach icon."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isRunning}
                        />

                        {/* Uploaded Images Preview */}
                        {images.length > 0 && (
                            <div className="flex gap-3 px-4 pb-2 pt-0 flex-wrap">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative group rounded-md overflow-hidden h-16 w-16 border border-border bg-[#0a0a0a]">
                                        <img src={img.previewUrl} alt={`Upload ${idx}`} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col p-4 gap-6">
                        {/* Company Details */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Company Details</label>
                            <input
                                type="text"
                                placeholder="Company Name (Required)"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                disabled={isRunning}
                                className="w-full bg-[#0a0a0a] border border-border rounded-lg p-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                        </div>

                        {/* Required Files */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Required Files</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Mapping Spec Upload */}
                                <div className="flex flex-col gap-1.5">
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        className="hidden"
                                        ref={mappingInputRef}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setMappingFile(e.target.files[0]);
                                            }
                                        }}
                                        disabled={isRunning}
                                    />
                                    <button
                                        onClick={() => mappingInputRef.current?.click()}
                                        disabled={isRunning}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${mappingFile ? 'bg-zinc-800/50 border-zinc-600 text-zinc-200' : 'bg-[#0a0a0a] border-border text-zinc-400 hover:border-zinc-600'}`}
                                    >
                                        <span className="truncate pr-2">{mappingFile ? mappingFile.name : 'Upload Mapping Spec (.png, .jpg, .pdf)'}</span>
                                        <Upload className="h-4 w-4 shrink-0 text-zinc-500" />
                                    </button>
                                </div>

                                {/* Sample Data Upload */}
                                <div className="flex flex-col gap-1.5">
                                    <input
                                        type="file"
                                        accept=".dat,.txt"
                                        className="hidden"
                                        ref={dataInputRef}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setDataFile(e.target.files[0]);
                                            }
                                        }}
                                        disabled={isRunning}
                                    />
                                    <button
                                        onClick={() => dataInputRef.current?.click()}
                                        disabled={isRunning}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${dataFile ? 'bg-zinc-800/50 border-zinc-600 text-zinc-200' : 'bg-[#0a0a0a] border-border text-zinc-400 hover:border-zinc-600'}`}
                                    >
                                        <span className="truncate pr-2">{dataFile ? dataFile.name : 'Upload Sample Data (.dat, .txt)'}</span>
                                        <Upload className="h-4 w-4 shrink-0 text-zinc-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* User prompt */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">User prompt</label>
                            <textarea
                                className="w-full min-h-[80px] bg-[#0a0a0a] border border-border rounded-lg p-3 outline-none resize-y text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 transition-colors"
                                placeholder="Enter your prompt or specific instructions here (Required)..."
                                value={onboardingInstructions}
                                onChange={(e) => setOnboardingInstructions(e.target.value)}
                                disabled={isRunning}
                            />
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        {mode === 'standard' && (
                            <>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            addFiles(e.target.files);
                                            // Reset so same file can be re-selected
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach Image"
                                    disabled={isRunning}
                                >
                                    <Paperclip className="h-4 w-4" />
                                </button>
                                <span className="text-xs text-zinc-600 font-medium hidden sm:inline-block">Upload Context</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isRunning && onKill && (
                            <button
                                onClick={onKill}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                            >
                                <Square className="h-3.5 w-3.5" />
                                Stop
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isRunDisabled}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isRunDisabled
                                ? 'bg-primary/50 text-white/70 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                }`}
                        >
                            {isRunning ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" />
                                    Run Task
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
