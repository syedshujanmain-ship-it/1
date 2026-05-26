import { ModeChatPage } from '@/components/ModeChatPage';

export function HowToBuildPage() {
  return (
    <ModeChatPage
      title="How To Build"
      systemModeFlags={{ howToBuildMode: true }}
      placeholder="What do you want to build?"
      emptyTitle="How To Build"
      emptyDescription="Step-by-step guides for building anything. Materials, assembly, cost, and time included."
      examples={['Build a drone', 'Make a robot', 'Create a website']}
      sendButtonText="Guide"
    />
  );
}
