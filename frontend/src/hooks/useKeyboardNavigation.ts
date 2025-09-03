import { useCallback, useEffect } from 'react';

type TabKey = 'current' | 'historical' | 'future' | 'ai' | 'actions';

interface UseKeyboardNavigationProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isEnabled?: boolean;
}

export const useKeyboardNavigation = ({ 
  activeTab, 
  setActiveTab, 
  isEnabled = true 
}: UseKeyboardNavigationProps) => {
  const tabs: TabKey[] = ['current', 'historical', 'future', 'ai', 'actions'];
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    // Only handle keyboard navigation when focus is on a tab button
    const activeElement = document.activeElement;
    if (!activeElement || !activeElement.getAttribute('role')?.includes('tab')) {
      return;
    }

    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        setActiveTab(tabs[nextIndex]);
        // Focus the new active tab
        setTimeout(() => {
          const nextTab = document.getElementById(`${tabs[nextIndex]}-tab`);
          nextTab?.focus();
        }, 0);
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        setActiveTab(tabs[nextIndex]);
        // Focus the new active tab
        setTimeout(() => {
          const nextTab = document.getElementById(`${tabs[nextIndex]}-tab`);
          nextTab?.focus();
        }, 0);
        break;
        
      case 'Home':
        event.preventDefault();
        setActiveTab(tabs[0]);
        setTimeout(() => {
          const firstTab = document.getElementById(`${tabs[0]}-tab`);
          firstTab?.focus();
        }, 0);
        break;
        
      case 'End':
        event.preventDefault();
        setActiveTab(tabs[tabs.length - 1]);
        setTimeout(() => {
          const lastTab = document.getElementById(`${tabs[tabs.length - 1]}-tab`);
          lastTab?.focus();
        }, 0);
        break;
    }
  }, [activeTab, setActiveTab, isEnabled, tabs]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    getTabProps: (tab: TabKey) => ({
      tabIndex: activeTab === tab ? 0 : -1,
      onFocus: () => {
        // When a tab receives focus, make it active
        if (tab !== activeTab) {
          setActiveTab(tab);
        }
      }
    })
  };
};