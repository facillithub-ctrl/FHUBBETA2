"use server";

import createClient from "@/utils/supabase/server";
import { GPSData, LearningAction, ModuleType } from "./types";

export async function getLearningGPSData(): Promise<GPSData> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { actions: [], stats: { completedToday: 0, streak: 0 } };

    const actions: LearningAction[] = [];

    // 1. AÇÕES DO SISTEMA (CRIADAS NO ADMIN)
    // Isso substitui os mocks "inatos". O Admin cria "Redação Express", "Desafio Diário", etc.
    const { data: systemActions } = await supabase
        .from('system_suggested_actions')
        .select('*')
        .eq('active', true)
        .limit(10); // Limite maior para permitir variedade

    systemActions?.forEach((sys: any) => {
        actions.push({
            id: sys.id,
            title: sys.title,
            description: sys.description,
            module: sys.module as ModuleType,
            category: 'pending', 
            priority: sys.priority || 'medium',
            link: sys.action_link,
            
            // Personalização Visual Total vinda do banco
            icon_name: sys.icon_name || 'Star',
            bg_color: sys.bg_color || 'bg-blue-600',
            image_url: sys.image_url,
            button_text: sys.button_text || 'Acessar',
            
            reason: 'Sugestão da Escola'
        });
    });

    // 2. DETECTOR DE FRAQUEZAS (IA - DADOS REAIS)
    const { data: recentErrors } = await supabase
        .from('student_answers')
        .select('questions(id, tests(subject))')
        .eq('student_id', user.id)
        .eq('is_correct', false)
        .order('created_at', { ascending: false })
        .limit(20);

    if (recentErrors && recentErrors.length > 0) {
        const subjectCounts: Record<string, number> = {};
        recentErrors.forEach((err: any) => {
            const subject = err.questions?.tests?.subject || 'Geral';
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });

        const weakSubject = Object.keys(subjectCounts).reduce((a, b) => subjectCounts[a] > subjectCounts[b] ? a : b);
        const errorCount = subjectCounts[weakSubject];

        if (errorCount >= 3) {
            actions.push({
                id: 'auto-fix-weakness',
                title: `Recuperar nota em ${weakSubject}`,
                description: `Identificamos ${errorCount} erros recentes. Clique para um treino focado.`,
                module: 'test',
                category: 'recommended',
                priority: 'high',
                link: `/dashboard/applications/test?subject=${encodeURIComponent(weakSubject)}`,
                
                icon_name: 'TrendingUp',
                bg_color: 'bg-red-600',
                button_text: 'Treinar Agora',
                reason: 'Baseado no seu desempenho'
            });
        }
    }

    // Busca estatísticas para o header (Opcional, mas útil)
    const { data: profile } = await supabase.from('profiles').select('streak_days').eq('id', user.id).single();

    return {
        // Ordena por prioridade (High > Medium > Low)
        actions: actions.sort((a, b) => {
            const map = { high: 3, medium: 2, low: 1 };
            return map[b.priority] - map[a.priority];
        }),
        stats: {
            completedToday: 0,
            streak: profile?.streak_days || 0
        }
    };
}