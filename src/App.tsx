import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { UICustomizationProvider } from '@/contexts/UICustomizationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeTransitionOverlay } from '@/components/ThemeTransition';

import routes from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <UICustomizationProvider>
          <IntersectObserver />
          {/* Background */}
        <div className="fixed inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-950/5 via-transparent to-transparent" />
        </div>
        {/* Theme transition overlay */}
        <ThemeTransitionOverlay />

        {/* Full-screen app container */}
        <div className="relative z-10 h-full w-full">
          <div className="w-full h-full bg-background overflow-hidden relative">
            <div className="flex flex-col h-full w-full overflow-hidden">
              <main className="flex-1 overflow-hidden">
                <Routes>
                  {routes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
        </UICustomizationProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
