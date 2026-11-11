import SavedConversation from "@/components/app-home/saved-conversation";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversation_id: string }>;
}) {
  const { conversation_id } = await params;
  return <SavedConversation id={conversation_id} />;
}
