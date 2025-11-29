"use server";

import createClient from "@/utils/supabase/server";
import { GPSData, LearningAction, ModuleType } from "./types";

export async function getLearningGPSData(): Promise<GPSData> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { actions: [], stats: { completedToday: 0, streak: 0 } };

    // Busca perfil para saber se é Aluno ou Professor
    const { data: profile } = await supabase.from('profiles').select('user_category, streak_days').eq('id', user.id).single();
    const userRole = profile?.user_category || 'student'; // 'student', 'professor', 'diretor'

    const actions: LearningAction[] = [];

    // =====================================================================
    // 1. AÇÕES DO SISTEMA (GERENCIADAS PELO ADMIN)
    // =====================================================================
    const { data: systemActions } = await supabase
        .from('system_suggested_actions')
        .select('*')
        .eq('active', true);

    if (systemActions) {
        systemActions.forEach((sys: any) => {
            // FILTRO DE PERFIL: Se a ação for para 'teacher' e o user for 'student', pula.
            if (sys.target_role && sys.target_role !== 'all' && sys.target_role !== userRole) {
                return;
            }

            // Ações "Always" entram direto. 
            // Condicionais específicas (ex: low_grammar) podem ser tratadas aqui se tiverem lógica global
            // ou ignoradas se dependerem de cálculo complexo abaixo.
            // Por simplicidade, assumimos que ações do admin são 'always' ou compatíveis.
            if (!sys.trigger_condition || sys.trigger_condition === 'always') {
                actions.push({
                    id: sys.id,
                    title: sys.title,
                    description: sys.description,
                    module: sys.module as ModuleType,
                    category: 'pending',
                    priority: sys.priority || 'medium',
                    link: sys.action_link,
                    icon_name: sys.icon_name || 'Star',
                    bg_color: sys.bg_color || 'bg-blue-600',
                    button_text: sys.button_text || 'Acessar',
                    reason: 'Sugestão da Escola',
                    target_role: sys.target_role,
                    trigger_condition: sys.trigger_condition
                });
            }
        });
    }

    // =====================================================================
    // 2. INTELIGÊNCIA CRUZADA (WRITE -> TEST)
    // Se o aluno é fraco em Gramática (C1) na Redação -> Recomenda Teste
    // =====================================================================
    if (userRole === 'aluno' || userRole === 'vestibulando') {
        
        // Busca as últimas 3 correções de redação
        const { data: recentCorrections } = await supabase
            .from('essay_corrections')
            .select('grade_c1, essays(submitted_at)')
            .eq('essays.student_id', user.id) // Join implícito
            .order('created_at', { ascending: false })
            .limit(3);

        if (recentCorrections && recentCorrections.length > 0) {
            // Calcula média da Competência 1 (Norma Culta)
            const avgC1 = recentCorrections.reduce((acc, curr) => acc + (curr.grade_c1 || 0), 0) / recentCorrections.length;

            // Se média < 120 (em 200), aciona o alerta
            if (avgC1 < 120) {
                actions.push({
                    id: 'auto-fix-grammar',
                    title: 'Reforço: Gramática e Norma Culta',
                    description: 'Notamos dificuldade na Competência 1 das suas redações. Treine agora.',
                    module: 'test',
                    category: 'recovery', // Categoria especial de recuperação
                    priority: 'high',
                    // Link leva para um filtro automático de questões de gramática
                    link: '/dashboard/applications/test?subject=Gramática&difficulty=easy',
                    icon_name: 'SpellCheck', // Ícone específico
                    bg_color: 'bg-rose-600',
                    button_text: 'Fazer Exercícios',
                    reason: 'Baseado na sua média de Redação (C1)'
                });
            }
        }
    }

    // =====================================================================
    // 3. RECOMENDAÇÕES PARA PROFESSORES (DASHBOARD INTELIGENTE)
    // =====================================================================
    if (userRole === 'professor' || userRole === 'diretor') {
        const { count: pendingEssays } = await supabase
            .from('essays')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'submitted');

        if ((pendingEssays || 0) > 5) {
            actions.unshift({
                id: 'teacher-pending-essays',
                title: 'Correções Acumuladas',
                description: `Existem ${pendingEssays} redações aguardando sua avaliação.`,
                module: 'write',
                category: 'pending',
                priority: 'high',
                link: '/dashboard/applications/write?view=correction_queue',
                icon_name: 'AlertCircle',
                bg_color: 'bg-amber-600',
                button_text: 'Corrigir Fila',
                reason: 'Alta demanda'
            });
        }
    }

    return {
        // Ordena: High > Medium > Low
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