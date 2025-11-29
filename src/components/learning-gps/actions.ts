'use server'

import createClient from '@/utils/supabase/server';
import { GPSAction } from './types';

export type GPSData = {
    recommendations: GPSAction[];
    shortcuts: {
        write: GPSAction[];
        test: GPSAction[];
        library: GPSAction[];
    };
};

export async function getLearningGPSData(): Promise<GPSData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { recommendations: [], shortcuts: { write: [], test: [], library: [] } };

  const recommendations: GPSAction[] = [];

  // 1. RECOMENDAÇÕES DO PROFESSOR (Via Correção de Redação)
  const { data: corrections } = await supabase
    .from('essay_corrections')
    .select('id, recommended_test_id, additional_link, essays!inner(title)')
    .eq('essays.student_id', user.id)
    .order('corrected_at', { ascending: false })
    .limit(3);

  corrections?.forEach((c: any) => {
      if (c.recommended_test_id) {
          recommendations.push({
              id: `rec-test-${c.id}`,
              title: "Reforço Indicado",
              description: `Treino focado na redação "${c.essays.title}".`,
              module: 'test',
              link: `/dashboard/applications/test?testId=${c.recommended_test_id}&action=start`,
              icon_name: 'Target',
              bg_color: 'bg-red-600',
              priority: 'high',
              type: 'recommendation',
              source: 'Professor'
          });
      }
      if (c.additional_link) {
          recommendations.push({
              id: `rec-link-${c.id}`,
              title: "Material Extra",
              description: "Conteúdo de apoio sugerido pelo professor.",
              module: 'library',
              link: c.additional_link,
              icon_name: 'Link',
              bg_color: 'bg-indigo-600',
              priority: 'medium',
              type: 'recommendation',
              source: 'Professor'
          });
      }
  });

  // 2. AÇÕES DO ADMIN (GPS DO SISTEMA)
  // CORREÇÃO: Removido filtro de prioridade 'high' para mostrar tudo que estiver ativo
  const { data: adminData } = await supabase
    .from('system_suggested_actions')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: false }) // High primeiro, depois Medium/Low
    .limit(5); // Aumentado limite para garantir visibilidade

  adminData?.forEach((item: any) => {
      recommendations.push({
          id: item.id,
          title: item.title,
          description: item.description,
          module: item.module,
          link: item.action_link,
          icon_name: item.icon_name || 'Star',
          bg_color: item.bg_color || 'bg-blue-600',
          priority: item.priority,
          type: 'system',
          source: 'Facillit'
      });
  });

  // 3. ATALHOS INTELIGENTES (Menu de Módulos)
  const shortcuts = {
      write: [
          { id: 'w-new', title: 'Escrever Redação', description: 'Novo tema', module: 'write', link: '/dashboard/applications/write?action=new', icon_name: 'PenTool', type: 'shortcut' },
          { id: 'w-hist', title: 'Minhas Correções', description: 'Ver histórico', module: 'write', link: '/dashboard/applications/write?tab=history', icon_name: 'History', type: 'shortcut' },
          { id: 'w-lib', title: 'Temas', description: 'Banco de temas', module: 'write', link: '/dashboard/applications/write?view=prompts_library', icon_name: 'Book', type: 'shortcut' }
      ] as GPSAction[],
      test: [
          { id: 't-turbo', title: 'Modo Turbo', description: 'Treino 5min', module: 'test', link: '/dashboard/applications/test?action=turbo', icon_name: 'Zap', type: 'shortcut' },
          { id: 't-list', title: 'Simulados', description: 'Ver lista', module: 'test', link: '/dashboard/applications/test?tab=browse', icon_name: 'List', type: 'shortcut' },
          { id: 't-res', title: 'Resultados', description: 'Analytics', module: 'test', link: '/dashboard/applications/test?tab=analytics', icon_name: 'BarChart', type: 'shortcut' }
      ] as GPSAction[],
      library: [
          { id: 'l-drive', title: 'Meu Drive', description: 'Arquivos', module: 'library', link: '/dashboard/applications/library?tab=drive', icon_name: 'Folder', type: 'shortcut' },
          { id: 'l-disc', title: 'Descobrir', description: 'Conteúdos', module: 'library', link: '/dashboard/applications/library?tab=discover', icon_name: 'Compass', type: 'shortcut' },
          { id: 'l-port', title: 'Portfólio', description: 'Projetos', module: 'library', link: '/dashboard/applications/library?tab=portfolio', icon_name: 'Briefcase', type: 'shortcut' }
      ] as GPSAction[]
  };

  return { recommendations, shortcuts };
}