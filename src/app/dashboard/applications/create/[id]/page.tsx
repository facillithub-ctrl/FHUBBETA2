import { getDocument } from '../actions';
import PageCanvas from '../components/PageCanvas';
import { redirect } from 'next/navigation';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  // Em Next.js 15, params é uma Promise e deve ser aguardado
  const { id } = await params; 
  const doc = await getDocument(id);

  if (!doc) {
    redirect('/dashboard/applications/create');
  }

  return (
    <PageCanvas 
      initialContent={doc.content_json} 
      documentId={doc.id}
      initialTitle={doc.title}
    />
  );
}