import { ModeChatPage } from '@/components/ModeChatPage';

export function ZipWhalePage() {
  return (
    <ModeChatPage
      title="ZIP Whale"
      systemModeFlags={{ proMode: true }}
      placeholder="What files do you need?"
      emptyTitle="ZIP Whale"
      emptyDescription="Generate complete file bundles and ZIP archives instantly."
      examples={['Project bundle', 'Code archive', 'Document pack']}
      sendButtonText="ZIP"
    />
  );
}
