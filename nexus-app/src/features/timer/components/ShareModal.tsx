import { useState } from 'react';
import type { TimerPreset } from '../store';
import { sanitizePreset } from '../../../utils/fileOps';
import { X, Copy, Link, Loader2, Check } from 'lucide-react';
import clsx from 'clsx';

interface ShareModalProps {
    preset: TimerPreset;
    onClose: () => void;
}

export const ShareModal = ({ preset, onClose }: ShareModalProps) => {
    const [activeTab, setActiveTab] = useState<'link' | 'json'>('link');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const generateLink = async () => {
        setLoading(true);
        setError(null);
        try {
            const sanitized = sanitizePreset(preset);
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitized)
            });

            if (!response.ok) throw new Error('Failed to connect to server');

            const { shortId } = await response.json();
            const link = `${window.location.protocol}//${window.location.host}/s/${shortId}`;
            setGeneratedLink(link);
        } catch (err) {
            setError('Could not generate link. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    const getJson = () => {
        const data = {
            version: 1,
            type: 'nexus-timer-preset',
            data: sanitizePreset(preset)
        };
        return JSON.stringify(data, null, 2);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share "{preset.name}"</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('link')}
                        className={clsx(
                            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'link'
                                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        Share via Link
                    </button>
                    <button
                        onClick={() => setActiveTab('json')}
                        className={clsx(
                            "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'json'
                                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        Copy JSON
                    </button>
                </div>

                <div className="p-6 min-h-[200px]">
                    {activeTab === 'link' ? (
                        <div className="space-y-4">
                            {!generatedLink ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                                        <Link className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Generate a short link to share this workout with others. The link is temporary and will expire when the server restarts.
                                    </p>
                                    <button
                                        onClick={generateLink}
                                        disabled={loading}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                                        <span>{loading ? 'Generating...' : 'Generate Short Link'}</span>
                                    </button>
                                    {error && (
                                        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">
                                        Your Link
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            readOnly
                                            value={generatedLink}
                                            className="flex-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-600 dark:text-gray-400 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleCopy(generatedLink)}
                                        className={clsx(
                                            "w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2",
                                            copied
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        )}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                                    </button>
                                    <button
                                        onClick={() => setGeneratedLink(null)}
                                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Generate New
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Copy the raw JSON data to share via messaging apps or save as a file.
                            </p>
                            <div className="relative">
                                <pre className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs font-mono h-32 overflow-y-auto text-gray-600 dark:text-gray-400">
                                    {getJson()}
                                </pre>
                            </div>
                            <button
                                onClick={() => handleCopy(getJson())}
                                className={clsx(
                                    "w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2",
                                    copied
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                                )}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
