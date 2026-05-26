import ChatPage from './pages/ChatPage';
import { WhaleCodePage } from './pages/WhaleCodePage';
import { BuildWhalePage } from './pages/BuildWhalePage';
import { HowToBuildPage } from './pages/HowToBuildPage';
import { PlanningPage } from './pages/PlanningPage';
import { TimetablePage } from './pages/TimetablePage';
import { RWIntelligencePage } from './pages/RWIntelligencePage';
import { RWV1SuperPage } from './pages/RWV1SuperPage';
import { WebSecretPage } from './pages/WebSecretPage';
import { HackMasterPage } from './pages/HackMasterPage';
import { WorldSecretsPage } from './pages/WorldSecretsPage';
import { ZipWhalePage } from './pages/ZipWhalePage';
import { NanoRedWhalePage } from './pages/NanoRedWhalePage';
import { APISettingsPage } from './pages/APISettingsPage';
import UICustomizationPage from './pages/UICustomizationPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Red Whale',
    path: '/',
    element: <ChatPage />
  },
  {
    name: 'RW V1 SUPER',
    path: '/rw-v1-super',
    element: <RWV1SuperPage />
  },
  {
    name: 'Whale Code V1',
    path: '/whale-code',
    element: <WhaleCodePage />
  },
  {
    name: 'Build Whale V1',
    path: '/build-whale',
    element: <BuildWhalePage />
  },
  {
    name: 'How To Build',
    path: '/how-to-build',
    element: <HowToBuildPage />
  },
  {
    name: 'Planning Model',
    path: '/planning',
    element: <PlanningPage />
  },
  {
    name: 'Timetable Model',
    path: '/timetable',
    element: <TimetablePage />
  },
  {
    name: 'RW Intelligence',
    path: '/rw-intelligence',
    element: <RWIntelligencePage />
  },
  {
    name: 'Web Secret',
    path: '/web-secret',
    element: <WebSecretPage />
  },
  {
    name: 'Hack Master',
    path: '/hack-master',
    element: <HackMasterPage />
  },
  {
    name: 'World Secrets',
    path: '/world-secrets',
    element: <WorldSecretsPage />
  },
  {
    name: 'ZIP WHALE',
    path: '/zip-whale',
    element: <ZipWhalePage />
  },
  {
    name: 'NANO RED WHALE',
    path: '/nano-red-whale',
    element: <NanoRedWhalePage />
  },
  {
    name: 'API Settings',
    path: '/api-settings',
    element: <APISettingsPage />,
    visible: false
  },
  {
    name: 'UI Customization',
    path: '/ui-customization',
    element: <UICustomizationPage />,
    visible: false
  }
];

export default routes;
