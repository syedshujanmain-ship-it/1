import { ModeChatPage } from '@/components/ModeChatPage';

export function BuildWhalePage() {
  return (
    <ModeChatPage
      title="Whale Builder"
      systemModeFlags={{ buildWhaleMode: true }}
      placeholder="Describe what you want to build..."
      emptyTitle="Whale Builder V1"
      emptyDescription="Complete Android APK or file bundle generator. Describe any project and get full source code."
      examples={['E-Commerce App', 'Social Media', 'Chat App']}
      sendButtonText="Build"
    />
  );
}
