import { ModeChatPage } from '@/components/ModeChatPage';

export function PlanningPage() {
  return (
    <ModeChatPage
      title="Planning"
      systemModeFlags={{ planningMode: true }}
      placeholder="What do you need to plan?"
      emptyTitle="Planning Model"
      emptyDescription="The ultimate planning assistant. Create detailed plans for any project or goal."
      examples={['Study schedule', 'Business plan', 'Event planning']}
      sendButtonText="Plan"
    />
  );
}
