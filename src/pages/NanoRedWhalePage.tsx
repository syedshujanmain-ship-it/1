import { ModeChatPage } from '@/components/ModeChatPage';

export function NanoRedWhalePage() {
  return (
    <ModeChatPage
      title="Nano Red Whale"
      systemModeFlags={{ builderMode: true }}
      placeholder="Describe your project..."
      emptyTitle="Nano Red Whale"
      emptyDescription="Full autonomous development. Describe any project idea and get a complete repository with code, tests, and docs."
      examples={['E-Commerce', 'Social Media', 'ML Model', 'Blockchain']}
      sendButtonText="Build"
    />
  );
}
