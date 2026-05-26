import { ModeChatPage } from '@/components/ModeChatPage';

export function RWRTPage() {
  return (
    <ModeChatPage
      title="RW RTM"
      systemModeFlags={{ realTimeMode: true }}
      placeholder="Ask about current events..."
      emptyTitle="Real-Time Mode"
      emptyDescription="Get the latest real-time information on any topic."
      examples={['Latest news', 'Current weather', 'Stock prices']}
      sendButtonText="Search"
    />
  );
}
