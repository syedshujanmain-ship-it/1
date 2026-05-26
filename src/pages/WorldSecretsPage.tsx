import { ModeChatPage } from '@/components/ModeChatPage';

export function WorldSecretsPage() {
  return (
    <ModeChatPage
      title="World Secrets"
      systemModeFlags={{ deepSearch: true }}
      placeholder="What secrets do you want to uncover?"
      emptyTitle="World Secrets"
      emptyDescription="Uncover hidden facts and secrets from around the world."
      examples={['Conspiracy theories', 'Hidden places', 'Secret history']}
      sendButtonText="Reveal"
    />
  );
}
