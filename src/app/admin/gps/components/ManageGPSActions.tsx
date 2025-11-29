"use client";

import { useState, useEffect } from 'react';
import { createOrUpdateGPSAction, deleteGPSAction, getResourcesForSelector } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import * as Icons from 'lucide-react';

const ICON_OPTIONS = ['PenTool', 'BookOpen', 'Gamepad2', 'PlayCircle', 'Lightbulb', 'Trophy', 'Zap', 'Star', 'Target', 'Compass', 'Map', 'Rocket', 'Flag', 'SpellCheck', 'Calculator', 'GraduationCap', 'AlertCircle', 'FileText'];

const COLOR_OPTIONS = [
    { label: 'Roxo (Write)', value: 'bg-purple-600' },
    { label: 'Azul (Test)', value: 'bg-blue-600' },
    { label: 'Verde (Edu)', value: 'bg-emerald-600' },
    { label: 'Laranja (Games)', value: 'bg-orange-500' },
    { label: 'Vermelho (Aviso)', value: 'bg-red-600' },
    { label: 'Ciano (Library)', value: 'bg-cyan-600' },
    { label: 'Preto (Destaque)', value: 'bg-gray-900' },
];

export default function ManageGPSActions({ initialActions }: { initialActions: any[] }) {
    const [actions, setActions] = useState(initialActions);
    const [currentAction, setCurrentAction] = useState<any>({
        title: '', description: '', module: 'write', action_link: '', priority: 'medium', active: true,
        icon_name: 'Star', bg_color: 'bg-blue-600', button_text: 'Acessar', image_url: '',
        target_role: 'all', trigger_condition: 'always'
    });
    
    // Estados do Construtor de Links
    const [routeType, setRouteType] = useState('dashboard');
    const [resourceId, setResourceId] = useState('');
    const [availableResources, setAvailableResources] = useState<any[]>([]); 
    const [isLoadingResources, setIsLoadingResources] = useState(false);

    const { addToast } = useToast();

    // 1. Busca recursos quando módulo ou tipo muda
    useEffect(() => {
        if (routeType === 'specific' && ['test', 'write', 'library'].includes(currentAction.module)) {
            setIsLoadingResources(true);
            getResourcesForSelector(currentAction.module)
                .then(data => setAvailableResources(data || []))
                .finally(() => setIsLoadingResources(false));
        } else {
            setAvailableResources([]);
        }
    }, [currentAction.module, routeType]);

    // 2. Função Geradora de Links (Deep Links)
    const generateLink = (mod: string, type: string, id: string) => {
        if (type === 'external') return currentAction.action_link;
        if (type === 'dashboard') return `/dashboard/applications/${mod}`;

        switch (mod) {
            case 'write': return `/dashboard/applications/write?action=new&promptId=${id}`;
            case 'test': return `/dashboard/applications/test?action=start&testId=${id}`;
            case 'library': return `/dashboard/applications/library?view=read&contentId=${id}`;
            default: return `/dashboard/applications/${mod}`;
        }
    };

    // 3. Atualizador de Estado Inteligente
    const handleRouteBuilderChange = (field: string, value: string) => {
        const newMod = field === 'module' ? value : currentAction.module;
        const newType = field === 'type' ? value : routeType;
        const newId = field === 'id' ? value : resourceId;

        // Resetar ID se trocar de módulo
        if (field === 'module') {
            setCurrentAction((prev: any) => ({ ...prev, module: value }));
            setResourceId('');
        }
        if (field === 'type') setRouteType(value);
        if (field === 'id') setResourceId(value);

        // Gera link automaticamente se não for URL manual
        if (newType !== 'external') {
            const link = generateLink(newMod, newType, newId);
            setCurrentAction((prev: any) => ({ ...prev, action_link: link, module: newMod }));
        }
    };

    // 4. Envio com Validação
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação: Item Específico sem ID selecionado
        if (routeType === 'specific' && !resourceId) {
            addToast({ title: "Atenção", message: "Selecione um item da lista para gerar o link.", type: "warning" });
            return;
        }

        // Validação: Link quebrado (terminando em =)
        if (currentAction.action_link.endsWith('=')) {
            addToast({ title: "Erro no Link", message: "O link gerado está incompleto. Selecione um recurso novamente.", type: "error" });
            return;
        }

        try {
            const res = await createOrUpdateGPSAction(currentAction);
            if (res.success) {
                addToast({ title: "Sucesso", message: "Ação salva corretamente.", type: "success" });
                window.location.reload();
            } else {
                // Mostra o erro real do banco
                addToast({ title: "Erro ao Salvar", message: res.error, type: "error" });
                console.error("Erro detalhado:", res.error);
            }
        } catch (error) {
            addToast({ title: "Erro Crítico", message: "Verifique o console.", type: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Tem certeza que deseja remover esta ação?")) return;
        await deleteGPSAction(id);
        window.location.reload();
    };

    const handleEdit = (action: any) => {
        setCurrentAction(action);
        // Tenta restaurar o estado do formulário baseado no link salvo
        if (action.action_link.startsWith('http')) {
            setRouteType('external');
        } else if (action.action_link.includes('?')) {
            setRouteType('specific');
            const match = action.action_link.match(/(?:promptId|testId|contentId|fileId)=([^&]*)/);
            if (match) setResourceId(match[1]);
        } else {
            setRouteType('dashboard');
            setResourceId('');
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20">
            
            {/* COLUNA 1: FORMULÁRIO */}
            <div className="xl:col-span-4 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 sticky top-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className={`p-2 rounded-lg ${currentAction.bg_color} text-white`}>
                            {/* @ts-ignore */}
                            <Icons.Edit3 size={20} />
                        </div>
                        <h3 className="font-black text-xl text-gray-800 dark:text-white">
                            {currentAction.id ? 'Editar Ação' : 'Criar Nova Ação'}
                        </h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* TÍTULO E DESCRIÇÃO */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">1. Informações Básicas</label>
                            <input 
                                className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-blue-500 outline-none transition-colors font-bold" 
                                placeholder="Título (ex: Leia 'Dom Casmurro')"
                                value={currentAction.title} 
                                onChange={e => setCurrentAction({...currentAction, title: e.target.value})} 
                                required 
                            />
                            <textarea 
                                className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:border-blue-500 outline-none transition-colors text-sm resize-none" 
                                placeholder="Descrição curta..."
                                rows={3}
                                value={currentAction.description} 
                                onChange={e => setCurrentAction({...currentAction, description: e.target.value})} 
                            />
                        </div>

                        {/* CONSTRUTOR DE LINK */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">2. Destino & Recurso</label>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <select 
                                        className="w-full p-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border-none shadow-sm outline-none cursor-pointer"
                                        value={currentAction.module}
                                        onChange={e => handleRouteBuilderChange('module', e.target.value)}
                                    >
                                        <option value="library">Biblioteca</option>
                                        <option value="write">Redação</option>
                                        <option value="test">Simulado</option>
                                        <option value="games">Games</option>
                                        <option value="play">Play (Vídeo)</option>
                                        <option value="edu">Gestão</option>
                                        <option value="external">URL Externa</option>
                                    </select>
                                    <select 
                                        className="w-full p-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border-none shadow-sm outline-none cursor-pointer"
                                        value={routeType}
                                        onChange={e => handleRouteBuilderChange('type', e.target.value)}
                                    >
                                        <option value="dashboard">Painel Geral</option>
                                        <option value="specific">Item Específico</option>
                                        <option value="external">URL Manual</option>
                                    </select>
                                </div>

                                {/* SELETOR DE RECURSO */}
                                {routeType === 'specific' && (
                                    <div className="relative">
                                        {isLoadingResources ? (
                                            <div className="text-xs text-center py-2 text-blue-500"><Icons.Loader2 className="animate-spin inline mr-1"/> Buscando itens...</div>
                                        ) : (
                                            <select 
                                                className="w-full p-3 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm outline-none cursor-pointer"
                                                value={resourceId}
                                                onChange={e => handleRouteBuilderChange('id', e.target.value)}
                                            >
                                                <option value="">Selecione o conteúdo...</option>
                                                {availableResources.length > 0 ? availableResources.map((res: any) => (
                                                    <option key={res.id} value={res.id}>{res.title}</option>
                                                )) : <option disabled>Nenhum item encontrado.</option>}
                                            </select>
                                        )}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-inner border border-gray-100 dark:border-gray-700">
                                    <Icons.Link size={14} className="text-gray-400 shrink-0"/>
                                    <input 
                                        className={`w-full text-xs bg-transparent outline-none truncate font-mono ${routeType === 'external' ? 'text-gray-800 dark:text-white' : 'text-gray-500 cursor-not-allowed'}`}
                                        value={currentAction.action_link}
                                        onChange={e => routeType === 'external' && setCurrentAction({...currentAction, action_link: e.target.value})}
                                        readOnly={routeType !== 'external'}
                                        placeholder="Link gerado automaticamente..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CONFIGURAÇÕES DE PÚBLICO (Novas Colunas) */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">3. Regras & Público</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Quem vê?</label>
                                    <select 
                                        className="w-full p-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 border border-transparent focus:border-blue-500 outline-none"
                                        value={currentAction.target_role || 'all'}
                                        onChange={e => setCurrentAction({...currentAction, target_role: e.target.value})}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="student">Alunos</option>
                                        <option value="teacher">Professores</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Quando?</label>
                                    <select 
                                        className="w-full p-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 border border-transparent focus:border-blue-500 outline-none"
                                        value={currentAction.trigger_condition || 'always'}
                                        onChange={e => setCurrentAction({...currentAction, trigger_condition: e.target.value})}
                                    >
                                        <option value="always">Sempre</option>
                                        <option value="low_grammar_score">Se nota C1 baixa</option>
                                        <option value="low_activity">Se inativo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ESTILO E VISUAL */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">4. Estilo</label>
                            
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {COLOR_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setCurrentAction({...currentAction, bg_color: opt.value})}
                                        className={`w-8 h-8 rounded-full shrink-0 transition-transform ${opt.value} ${currentAction.bg_color === opt.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                        title={opt.label}
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-6 gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl max-h-32 overflow-y-auto">
                                {ICON_OPTIONS.map(iconName => {
                                    // @ts-ignore
                                    const Icon = Icons[iconName] || Icons.HelpCircle;
                                    return (
                                        <button 
                                            key={iconName}
                                            type="button"
                                            onClick={() => setCurrentAction({...currentAction, icon_name: iconName})}
                                            className={`aspect-square flex items-center justify-center rounded-lg transition-all ${currentAction.icon_name === iconName ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        >
                                            <Icon size={18} />
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <input 
                                    className="border p-2 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="Texto do Botão"
                                    value={currentAction.button_text} 
                                    onChange={e => setCurrentAction({...currentAction, button_text: e.target.value})}
                                />
                                 <select 
                                    className="border p-2 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                                    value={currentAction.priority}
                                    onChange={e => setCurrentAction({...currentAction, priority: e.target.value})}
                                >
                                    <option value="medium">Normal</option>
                                    <option value="high">Alta Prioridade</option>
                                    <option value="low">Baixa</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="active"
                                    checked={currentAction.active} 
                                    onChange={e => setCurrentAction({...currentAction, active: e.target.checked})} 
                                />
                                <label htmlFor="active" className="text-sm font-medium dark:text-white">Ação Ativa</label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                            <button type="submit" className="flex-1 bg-black dark:bg-white dark:text-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md">
                                {currentAction.id ? 'Salvar Alterações' : 'Criar Ação'}
                            </button>
                            {currentAction.id && (
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setCurrentAction({ title: '', description: '', module: 'write', action_link: '', priority: 'medium', active: true, icon_name: 'Star', bg_color: 'bg-blue-600', button_text: 'Acessar', target_role: 'all', trigger_condition: 'always' });
                                        setRouteType('dashboard');
                                        setResourceId('');
                                    }} 
                                    className="px-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200"
                                >
                                    Limpar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* COLUNA 2: LISTA (Exibição) */}
            <div className="xl:col-span-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Central de Ações</h2>
                        <p className="text-gray-500">Gerencie o que aparece no Dashboard dos usuários.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {actions.map((action) => {
                        // @ts-ignore
                        const Icon = Icons[action.icon_name] || Icons.Star;
                        return (
                            <div key={action.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                                
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span className={`w-2 h-2 rounded-full ${action.active ? 'bg-green-500' : 'bg-red-500'}`} title={action.active ? "Ativo" : "Inativo"}></span>
                                </div>

                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 ${action.bg_color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={24} />
                                </div>

                                <div className="mb-4 flex-1">
                                    <h4 className="font-bold text-gray-800 dark:text-white text-lg leading-tight mb-2">{action.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{action.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {action.target_role !== 'all' && (
                                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-purple-100 text-purple-700 rounded-md">
                                            {action.target_role === 'student' ? 'Aluno' : 'Prof'}
                                        </span>
                                    )}
                                    {action.trigger_condition !== 'always' && (
                                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md">
                                            Condicional
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-md">
                                        {action.module}
                                    </span>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <button 
                                        onClick={() => handleEdit(action)} 
                                        className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1"
                                    >
                                        <Icons.Edit2 size={14} /> Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(action.id)} 
                                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                    >
                                        <Icons.Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}