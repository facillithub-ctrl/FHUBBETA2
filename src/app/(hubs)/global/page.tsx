import { redirect } from 'next/navigation';

export default function GlobalHubPage() {
  // Redireciona automaticamente para a página principal do Hub (Stories)
  redirect('/global/stories');
}