// components/financial/DownloadButton.tsx
'use client'

import { useState } from 'react';
import { Download } from 'lucide-react';

export const DownloadButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/financial/download');
            
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'financial-report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     text-sm font-medium flex items-center gap-2 transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="h-4 w-4" />
            {isLoading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด PDF'}
        </button>
    );
};