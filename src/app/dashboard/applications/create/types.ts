export interface CreateDocument {
  id: string;
  user_id: string;
  title: string;
  content_json: any; // JSONContent do Tiptap
  plain_text?: string;
  page_settings: PageSettings;
  created_at: string;
  updated_at: string;
}

export interface PageSettings {
  size: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin: 'normal' | 'narrow' | 'wide';
  bgColor?: string;
  lineStyle?: 'none' | 'ruled' | 'grid' | 'dotted';
}