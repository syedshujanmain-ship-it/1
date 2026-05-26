import { ModeChatPage } from '@/components/ModeChatPage';

export function WhaleCodePage() {
  return (
    <ModeChatPage
      title="Whale Code"
      systemModeFlags={{ whaleCodeMode: true }}
      placeholder="Describe your coding task..."
      emptyTitle="Whale Code V1"
      emptyDescription="The King of Codes. Generate any code in any language with zero errors."
      examples={['Build a React app', 'Python ML script', 'API with Node.js']}
      sendButtonText="Code"
    />
  );
}
