import { redirect } from 'next/navigation';

export default function GlobalPage() {
  // Por enquanto, o Hub Global redireciona direto para o Stories.
  // Futuramente, isso pode ser um Feed Geral agregando várias coisas.
  redirect('/global/stories');
}