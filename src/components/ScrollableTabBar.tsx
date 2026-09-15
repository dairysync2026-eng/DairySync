import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ScrollableTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  canAccessTab: (tabId: string) => boolean;
}

export const ScrollableTabBar: React.FC<ScrollableTabBarProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  canAccessTab,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  // Check scroll boundary status
  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // tolerance of 2px
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      checkScrollability();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollability);

    // ResizeObserver for container size adjustments
    const ro = new ResizeObserver(() => checkScrollability());
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollability);
      ro.disconnect();
    };
  }, [checkScrollability, tabs]);

  // Scroll active tab into view whenever it changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeTab]);

  // Scroll buttons navigation handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Convert vertical mouse wheel into horizontal scroll on this container
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.deltaY !== 0 && !e.shiftKey) {
      // If user is scrolling vertically over the tabs bar, slide horizontally
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      if (maxScroll > 0) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
        checkScrollability();
      }
    }
  };

  // Drag-to-scroll support for mouse users
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftStart(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier
    scrollContainerRef.current.scrollLeft = scrollLeftStart - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative group print:hidden select-none">
      {/* Outer Shell matching the design in user image with rounded corners and border */}
      <div className="relative flex items-center bg-white p-1.5 rounded-3xl border-2 border-slate-200 shadow-sm transition-all">
        
        {/* Left Scroll Navigation Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll tabs left"
            className="absolute left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 hover:bg-slate-100 text-slate-700 shadow-md border border-slate-200 transition-all hover:scale-110 shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-slate-800" />
          </button>
        )}

        {/* Left Fade Gradient Mask */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 rounded-l-3xl bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        )}

        {/* Inner Scrollable Track */}
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center space-x-2 overflow-x-auto scroll-smooth w-full px-1 py-1 cursor-grab active:cursor-grabbing ${
            isDragging ? 'cursor-grabbing' : ''
          } [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAllowed = canAccessTab(tab.id);

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 scale-100'
                    : isAllowed
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-98'
                    : 'text-slate-400 bg-slate-50/80 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200'
                }`}
                title={
                  isAllowed
                    ? tab.label
                    : `${tab.label} (Access Restricted to Authorized Personnel)`
                }
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : isAllowed
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                {!isAllowed && (
                  <Lock
                    className={`w-3.5 h-3.5 ml-1 shrink-0 ${
                      isActive ? 'text-rose-300' : 'text-rose-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Fade Gradient Mask */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 rounded-r-3xl bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
        )}

        {/* Right Scroll Navigation Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll tabs right"
            className="absolute right-2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 hover:bg-slate-100 text-slate-700 shadow-md border border-slate-200 transition-all hover:scale-110 shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-slate-800" />
          </button>
        )}

      </div>

      {/* Subtle helper note on mobile / small screens if overflow exists */}
      {canScrollRight && (
        <div className="flex sm:hidden justify-end mt-1 px-3">
          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
            <span>Swipe for more tabs</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      )}
    </div>
  );
};
