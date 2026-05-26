import { ModeChatPage } from '@/components/ModeChatPage';

export function RWV1SuperPage() {
  return (
    <ModeChatPage
      title="RW V1 SUPER"
      systemModeFlags={{ rwV1SuperMode: true }}
      placeholder="Unleash ultimate power..."
      emptyTitle="RW V1 SUPER"
      emptyDescription="The ultimate combination mode. All powers united for maximum output."
      examples={['Mega project', 'Full stack app', 'Research paper']}
      sendButtonText="Super"
    />
  );
}
