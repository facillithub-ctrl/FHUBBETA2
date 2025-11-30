// src/app/recursos/atualizacoes/actions.ts
import { client } from "@/lib/sanity";

export interface ChangelogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  version?: string;
  category?: string;
  tags?: string[]; // Novos marcadores
  summary: string;
  content: any;
  actionText?: string;
  actionUrl?: string;
  coverImage?: any;
  author?: {
    name: string;
    image: any;
    isVerified?: boolean; // Novo campo
  };
}

export async function getChangelogPosts(): Promise<ChangelogPost[]> {
  // Nota: Assumindo que seu schema 'author' tem um campo boolean 'isVerified' ou 'verified'.
  // Se não tiver, você precisa adicionar lá também. Aqui busco como 'isVerified'.
  const query = `*[_type == "changelog"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    version,
    category,
    tags,
    summary,
    content,
    actionText,
    actionUrl,
    coverImage,
    author->{
        name,
        image,
        "isVerified": verified 
    }
  }`;

  return await client.fetch(query, {}, { next: { revalidate: 60 } });
}