// UI Customization Context - REAL-TIME UI updates with IMMEDIATE effect
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useUICustomization } from '@/hooks/useUICustomization';
import type { UICustomization } from '@/hooks/useUICustomization';

interface UICustomizationContextValue {
  customization: UICustomization;
  updateIconCustomization: ReturnType<typeof useUICustomization>['updateIconCustomization'];
  updateColors: ReturnType<typeof useUICustomization>['updateColors'];
  updateLayout: ReturnType<typeof useUICustomization>['updateLayout'];
  resetToDefaults: ReturnType<typeof useUICustomization>['resetToDefaults'];
  getSortedIcons: ReturnType<typeof useUICustomization>['getSortedIcons'];
  forceUpdate: () => void;
}

const UICustomizationContext = createContext<UICustomizationContextValue | null>(null);

export function UICustomizationProvider({ children }: { children: ReactNode }) {
  const customizationHook = useUICustomization();
  const { customization } = customizationHook;
  const [, setUpdateTrigger] = useState(0);

  // Force update function
  const forceUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  // Apply color customizations to CSS variables in real-time
  useEffect(() => {
    const root = document.documentElement;
    
    console.log('🎨 Applying UI Customization to DOM...', customization);
    
    // Apply custom colors to CSS variables
    if (customization.colors.primary) {
      root.style.setProperty('--custom-primary', customization.colors.primary);
    }
    if (customization.colors.secondary) {
      root.style.setProperty('--custom-secondary', customization.colors.secondary);
    }
    if (customization.colors.accent) {
      root.style.setProperty('--custom-accent', customization.colors.accent);
    }
    if (customization.colors.background) {
      root.style.setProperty('--custom-background', customization.colors.background);
    }
    if (customization.colors.text) {
      root.style.setProperty('--custom-text', customization.colors.text);
    }

    // Apply layout customizations
    root.style.setProperty('--custom-header-height', `${customization.layout.headerHeight}px`);
    root.style.setProperty('--custom-icon-spacing', `${customization.layout.iconSpacing}px`);
    root.style.setProperty('--custom-border-radius', `${customization.layout.borderRadius}px`);

    console.log('✅ UI Customization applied successfully!');
    
    // Force re-render of all components
    forceUpdate();
  }, [customization]);

  return (
    <UICustomizationContext.Provider value={{ ...customizationHook, forceUpdate }}>
      {children}
    </UICustomizationContext.Provider>
  );
}

export function useUICustomizationContext() {
  const context = useContext(UICustomizationContext);
  if (!context) {
    throw new Error('useUICustomizationContext must be used within UICustomizationProvider');
  }
  return context;
}
