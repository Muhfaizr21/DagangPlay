import React from 'react';
import { Volume2 } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
}

interface AnnouncementBarProps {
    announcements: Announcement[];
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ announcements }) => {
    if (!announcements || announcements.length === 0) return null;

    return (
        <div className="w-full bg-gradient-to-r from-navy-deep/90 via-cyan/20 to-navy-deep/90 border-y border-cyan/10 backdrop-blur-md overflow-hidden flex items-center h-10">
            <div className="container mx-auto px-6 h-full flex items-center">
                <div className="flex items-center gap-2 pr-4 bg-navy-deep text-cyan z-10 shrink-0">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span className="font-heading text-[10px] uppercase tracking-[.25em] font-bold">INFO</span>
                </div>

                <div className="flex-1 marquee-container overflow-hidden relative">
                    <div className="flex gap-12 whitespace-nowrap marquee-track animate-marquee py-2 group-hover:pause">
                        {/* Duplicate content to create seamless loop */}
                        {[...announcements, ...announcements].map((ann, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-white font-body font-bold text-xs">{ann.title}</span>
                                <span className="text-slate-400 font-body text-xs cursor-default">{ann.content}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan/40 mx-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .marquee-track {
                    display: inline-flex;
                    animation: marquee 40s linear infinite;
                }
                .marquee-track:hover {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default AnnouncementBar;
