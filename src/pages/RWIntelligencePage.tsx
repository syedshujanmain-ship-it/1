import { ModeChatPage } from '@/components/ModeChatPage';

export function RWIntelligencePage() {
  return (
    <ModeChatPage
      title="RW Intelligence"
      systemModeFlags={{ rwIntelligenceMode: true }}
      placeholder="Ask anything complex..."
      emptyTitle="RW Intelligence"
      emptyDescription="The ultimate super intelligent mode. Breaks all limits with deep reasoning."
      examples={['Solve a theory', 'Invent something', 'Complex analysis']}
      sendButtonText="Think"
    />
  );
}
