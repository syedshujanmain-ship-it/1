import { ModeChatPage } from '@/components/ModeChatPage';

export function TimetablePage() {
  return (
    <ModeChatPage
      title="Timetable"
      systemModeFlags={{ timetableMode: true }}
      placeholder="What schedule do you need?"
      emptyTitle="Timetable Model"
      emptyDescription="Create perfect timetables for any purpose. Study, work, fitness — everything."
      examples={['Study timetable', 'Workout schedule', 'Exam prep']}
      sendButtonText="Create"
    />
  );
}
