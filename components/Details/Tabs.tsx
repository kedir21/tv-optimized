
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabs: { id: string; label: string }[];
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, tabs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Center active tab on mobile scroll
    useEffect(() => {
        const activeEl = document.getElementById(`tab-${activeTab}`);
        if (activeEl && scrollRef.current) {
            const scrollContainer = scrollRef.current;
            const scrollLeft = activeEl.offsetLeft - (scrollContainer.offsetWidth / 2) + (activeEl.offsetWidth / 2);
            scrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, [activeTab]);

    return (
        <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                id={`tab-${tab.id}`}
                                onClick={() => onTabChange(tab.id)}
                                className="relative whitespace-nowrap py-1 group outline-none"
                            >
                                <span className={`text-sm lg:text-base font-bold transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                                    }`}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-[17px] left-0 right-0 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
