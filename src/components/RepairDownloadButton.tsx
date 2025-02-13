'use client'

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Repair } from '@/types/repairs';

interface RepairDownloadButtonProps {
    repair: Repair;
}

export const RepairDownloadButton = ({ repair }: RepairDownloadButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/repairs/${repair.id}/download`);
           
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `repair-bill-${repair.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading bill:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="inline-flex items-center p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            title="ดาวน์โหลดใบเสร็จ"
        >
            <Download 
                className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} 
            />
        </button>
    );
};
