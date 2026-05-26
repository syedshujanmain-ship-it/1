import { ModeChatPage } from '@/components/ModeChatPage';

export function WebSecretPage() {
  return (
    <ModeChatPage
      title="Web Secret"
      systemModeFlags={{ webSecretMode: true }}
      placeholder="What hidden website do you want?"
      emptyTitle="Web Secret"
      emptyDescription="Discover hidden websites and secret tools for any purpose."
      examples={['AI tools list', 'Free resources', 'Secret websites']}
      sendButtonText="Find"
    />
  );
}
