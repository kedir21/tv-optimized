
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabs: { id: string; label: string }[];
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, tabs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const activeEl = document.getElementById(`tab-${activeTab}`);
        if (activeEl && scrollRef.current) {
            const scrollContainer = scrollRef.current;
            const scrollLeft = activeEl.offsetLeft - (scrollContainer.offsetWidth / 2) + (activeEl.offsetWidth / 2);
            scrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, [activeTab]);

    return (
        <div className="sticky top-0 z-40 border-b border-white/[0.04] overflow-hidden" style={{ backgroundColor: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar py-4"
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
                                <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/35 group-hover:text-white/60'
                                    }`}>
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-rose-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
