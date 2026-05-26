// UI Customization Hook - Manage all UI customization settings
import { useState, useEffect } from 'react';

export interface IconCustomization {
  id: string;
  visible: boolean;
  size: number; // 1-5 scale
  label: string;
  color: string;
  order: number;
}

export interface UICustomization {
  // Header icons
  icons: {
    settings: IconCustomization;
    downloadCode: IconCustomization;
    downloadPDF: IconCustomization;
    clearChat: IconCustomization;
    themeToggle: IconCustomization;
  };
  
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Layout
  layout: {
    headerHeight: number;
    iconSpacing: number;
    borderRadius: number;
  };
  
  // Protected elements (cannot be removed/edited)
  protected: {
    creatorName: string; // "Shujan" - cannot be changed
  };
}

const DEFAULT_CUSTOMIZATION: UICustomization = {
  icons: {
    settings: {
      id: 'settings',
      visible: true,
      size: 3,
      label: 'Settings',
      color: 'hsl(var(--primary))',
      order: 1,
    },
    downloadCode: {
      id: 'downloadCode',
      visible: true,
      size: 3,
      label: 'Download Code',
      color: '#10b981',
      order: 2,
    },
    downloadPDF: {
      id: 'downloadPDF',
      visible: true,
      size: 3,
      label: 'Download PDF',
      color: '#3b82f6',
      order: 3,
    },
    clearChat: {
      id: 'clearChat',
      visible: true,
      size: 3,
      label: 'Clear Chat',
      color: 'hsl(var(--destructive))',
      order: 4,
    },
    themeToggle: {
      id: 'themeToggle',
      visible: true,
      size: 3,
      label: 'Theme',
      color: 'hsl(var(--primary))',
      order: 5,
    },
  },
  colors: {
    primary: 'hsl(220, 90%, 56%)',
    secondary: 'hsl(220, 14%, 96%)',
    accent: 'hsl(220, 90%, 56%)',
    background: 'hsl(0, 0%, 100%)',
    text: 'hsl(222, 47%, 11%)',
  },
  layout: {
    headerHeight: 64,
    iconSpacing: 4,
    borderRadius: 8,
  },
  protected: {
    creatorName: 'Shujan',
  },
};

const STORAGE_KEY = 'redwhale_ui_customization';

export function useUICustomization() {
  const [customization, setCustomization] = useState<UICustomization>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure protected name cannot be changed
        parsed.protected.creatorName = 'Shujan';
        return { ...DEFAULT_CUSTOMIZATION, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load UI customization:', e);
    }
    return DEFAULT_CUSTOMIZATION;
  });

  // Save to localStorage whenever customization changes
  useEffect(() => {
    try {
      // Ensure protected name is always correct before saving
      const toSave = {
        ...customization,
        protected: {
          creatorName: 'Shujan',
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save UI customization:', e);
    }
  }, [customization]);

  const updateIconCustomization = (iconId: keyof UICustomization['icons'], updates: Partial<IconCustomization>) => {
    setCustomization(prev => ({
      ...prev,
      icons: {
        ...prev.icons,
        [iconId]: {
          ...prev.icons[iconId],
          ...updates,
        },
      },
    }));
  };

  const updateColors = (colors: Partial<UICustomization['colors']>) => {
    setCustomization(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...colors,
      },
    }));
  };

  const updateLayout = (layout: Partial<UICustomization['layout']>) => {
    setCustomization(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        ...layout,
      },
    }));
  };

  const resetToDefaults = () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
  };

  const getSortedIcons = () => {
    return Object.values(customization.icons).sort((a, b) => a.order - b.order);
  };

  return {
    customization,
    updateIconCustomization,
    updateColors,
    updateLayout,
    resetToDefaults,
    getSortedIcons,
  };
}
