import createClient from '@/utils/supabase/server';
import { getDocument } from '../actions';
import EditorCanvas from '../components/EditorCanvas';
import { redirect } from 'next/navigation';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) {
    redirect('/dashboard/applications/create');
  }

  return (
    <EditorCanvas 
      initialContent={doc.content_json} 
      documentId={doc.id}
      initialTitle={doc.title}
    />
  );
}