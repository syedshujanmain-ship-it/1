import { ModeChatPage } from '@/components/ModeChatPage';

export function HackMasterPage() {
  return (
    <ModeChatPage
      title="Hack Master"
      systemModeFlags={{ hackMasterMode: true }}
      placeholder="What security task do you need?"
      emptyTitle="Hack Master"
      emptyDescription="Ultimate security and penetration testing tool. Learn ethical hacking."
      examples={['Security audit', 'Bug bounty', 'Network scan']}
      sendButtonText="Hack"
    />
  );
}
