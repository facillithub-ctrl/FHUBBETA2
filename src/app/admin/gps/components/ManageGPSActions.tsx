"use client";

import { useState, useEffect } from 'react';
import { createOrUpdateGPSAction, deleteGPSAction, getResourcesForSelector } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import * as Icons from 'lucide-react';

const ICON_OPTIONS = ['PenTool', 'BookOpen', 'Gamepad2', 'PlayCircle', 'Lightbulb', 'Trophy', 'Zap', 'Star', 'Target', 'Compass', 'Map', 'Rocket', 'Flag'];

const COLOR_OPTIONS = [
    { label: 'Roxo (Write)', value: 'bg-pink-600' },
    { label: 'Azul (Test)', value: 'bg-blue-600' },
    { label: 'Verde (Create)', value: 'bg-emerald-600' },
    { label: 'Laranja (Games)', value: 'bg-orange-500' },
    { label: 'Vermelho (Play)', value: 'bg-red-600' },
    { label: 'Cinza (Neutro)', value: 'bg-gray-600' },
    { label: 'Preto (Destaque)', value: 'bg-gray-900' },
];

export default function ManageGPSActions({ initialActions }: { initialActions: any[] }) {
    const [actions, setActions] = useState(initialActions);
    const [currentAction, setCurrentAction] = useState<any>({
        title: '', description: '', module: 'write', action_link: '', priority: 'medium', active: true,
        icon_name: 'Star', bg_color: 'bg-blue-600', button_text: 'Acessar', image_url: ''
    });
    
    // Controle do Construtor
    const [routeType, setRouteType] = useState('dashboard');
    const [resourceId, setResourceId] = useState('');
    const [availableResources, setAvailableResources] = useState<any[]>([]); // Lista de Testes/Temas
    const [isLoadingResources, setIsLoadingResources] = useState(false);

    const { addToast } = useToast();

    // Busca recursos quando muda o módulo
    useEffect(() => {
        if (routeType === 'specific' && (currentAction.module === 'test' || currentAction.module === 'write')) {
            setIsLoadingResources(true);
            getResourcesForSelector(currentAction.module)
                .then(data => setAvailableResources(data))
                .finally(() => setIsLoadingResources(false));
        }
    }, [currentAction.module, routeType]);

    // Lógica de Geração de Link
    const generateLink = (mod: string, type: string, id: string) => {
        if (type === 'external') return currentAction.action_link; // Mantém o que foi digitado

        switch (mod) {
            case 'write':
                if (type === 'dashboard') return '/dashboard/applications/write';
                if (type === 'specific') return `/dashboard/applications/write?action=new&promptId=${id}`;
                break;
            case 'test':
                if (type === 'dashboard') return '/dashboard/applications/test';
                if (type === 'specific') return `/dashboard/applications/test?view=detail&testId=${id}`;
                break;
            case 'play':
                if (type === 'dashboard') return '/modulos/facillit-play';
                break;
            default:
                return `/dashboard/applications/${mod}`;
        }
        return '';
    };

    // Atualiza o link automaticamente
    const handleRouteBuilderChange = (field: string, value: string) => {
        let newMod = field === 'module' ? value : currentAction.module;
        let newType = field === 'type' ? value : routeType;
        let newId = field === 'id' ? value : resourceId;

        // CORREÇÃO AQUI: Tipagem explícita para (prev: any)
        if (field === 'module') setCurrentAction((prev: any) => ({ ...prev, module: value }));
        if (field === 'type') setRouteType(value);
        if (field === 'id') setResourceId(value);

        if (newType !== 'external') {
            const link = generateLink(newMod, newType, newId);
            // CORREÇÃO AQUI: Tipagem explícita para (prev: any)
            setCurrentAction((prev: any) => ({ ...prev, action_link: link, module: newMod }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createOrUpdateGPSAction(currentAction);
        addToast({ title: "Salvo", message: "Ação atualizada.", type: "success" });
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Apagar?")) return;
        await deleteGPSAction(id);
        window.location.reload();
    };

    // Preencher formulário ao clicar em editar
    const handleEdit = (action: any) => {
        setCurrentAction(action);
        // Tenta inferir o tipo de rota baseado no link existente
        if (action.action_link.includes('?')) {
            setRouteType('specific');
            // Extrai o ID se possível (lógica simples)
            const idMatch = action.action_link.match(/(?:testId|promptId)=([^&]*)/);
            if (idMatch) setResourceId(idMatch[1]);
        } else if (action.action_link.startsWith('http')) {
            setRouteType('external');
        } else {
            setRouteType('dashboard');
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
            {/* EDITOR */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-fit sticky top-6">
                <h3 className="font-black text-xl mb-6 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
                    {currentAction.id ? '✏️ Editar Ação' : '✨ Nova Ação'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Conteúdo */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase text-gray-500">Conteúdo</label>
                        <input 
                            className="w-full border p-3 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Título (ex: Simulado ENEM 2024)"
                            value={currentAction.title} 
                            onChange={e => setCurrentAction({...currentAction, title: e.target.value})} 
                            required 
                        />
                        <textarea 
                            className="w-full border p-3 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Descrição motivadora..."
                            rows={2}
                            value={currentAction.description} 
                            onChange={e => setCurrentAction({...currentAction, description: e.target.value})} 
                        />
                    </div>

                    {/* Construtor de Rotas */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-3">
                        <label className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <Icons.Map size={14}/> Destino
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <select 
                                className="border p-2 rounded-lg text-sm dark:bg-gray-700 dark:text-white outline-none"
                                value={currentAction.module}
                                onChange={e => handleRouteBuilderChange('module', e.target.value)}
                            >
                                <option value="write">Redação</option>
                                <option value="test">Simulados</option>
                                <option value="games">Games</option>
                                <option value="play">Play (Aulas)</option>
                                <option value="create">Create</option>
                                <option value="library">Library</option>
                                <option value="external">Link Externo</option>
                            </select>

                            <select 
                                className="border p-2 rounded-lg text-sm dark:bg-gray-700 dark:text-white outline-none"
                                value={routeType}
                                onChange={e => handleRouteBuilderChange('type', e.target.value)}
                            >
                                <option value="dashboard">Dashboard</option>
                                <option value="specific">Específico (ID)</option>
                                <option value="external">URL Manual</option>
                            </select>
                        </div>

                        {/* SELETOR DE RECURSO (DROPDOWN DINÂMICO) */}
                        {routeType === 'specific' && (
                            <div className="relative">
                                {isLoadingResources ? (
                                    <div className="text-xs text-gray-500 p-2"><Icons.Loader2 className="animate-spin inline mr-2"/> Carregando opções...</div>
                                ) : (
                                    <select 
                                        className="w-full border p-2 rounded-lg text-sm dark:bg-gray-700 dark:text-white outline-none"
                                        value={resourceId}
                                        onChange={e => handleRouteBuilderChange('id', e.target.value)}
                                    >
                                        <option value="">Selecione um item...</option>
                                        {availableResources.map((res: any) => (
                                            <option key={res.id} value={res.id}>
                                                {res.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="relative">
                            <input 
                                className="w-full border p-2 pl-8 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-500 font-mono"
                                value={currentAction.action_link} 
                                onChange={e => setCurrentAction({...currentAction, action_link: e.target.value})} 
                                placeholder="O link será gerado aqui..."
                                readOnly={routeType !== 'external'}
                            />
                            <Icons.Link className="absolute left-2.5 top-2.5 text-gray-400" size={12} />
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase text-gray-500">Aparência</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Ícone</label>
                                <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 h-20 overflow-y-auto">
                                    {ICON_OPTIONS.map(iconName => {
                                        // @ts-ignore
                                        const Icon = Icons[iconName];
                                        return (
                                            <button 
                                                key={iconName}
                                                type="button"
                                                onClick={() => setCurrentAction({...currentAction, icon_name: iconName})}
                                                className={`p-1.5 rounded-md transition-all ${currentAction.icon_name === iconName ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                <Icon size={16} />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Cor</label>
                                <div className="space-y-1 h-20 overflow-y-auto">
                                    {COLOR_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCurrentAction({...currentAction, bg_color: opt.value})}
                                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 ${currentAction.bg_color === opt.value ? 'bg-gray-100 dark:bg-gray-600 font-bold' : ''}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${opt.value}`}></div>
                                            <span className="dark:text-gray-300">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Prioridade</label>
                                <select 
                                    className="w-full border p-2 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                                    value={currentAction.priority} 
                                    onChange={e => setCurrentAction({...currentAction, priority: e.target.value})}
                                >
                                    <option value="high">Alta (Urgente)</option>
                                    <option value="medium">Média</option>
                                    <option value="low">Baixa</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Botão</label>
                                <input 
                                    className="w-full border p-2 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                                    value={currentAction.button_text} 
                                    onChange={e => setCurrentAction({...currentAction, button_text: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="active"
                                checked={currentAction.active} 
                                onChange={e => setCurrentAction({...currentAction, active: e.target.checked})} 
                            />
                            <label htmlFor="active" className="text-sm font-medium dark:text-white">Ação Ativa (Visível)</label>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex gap-2">
                        <button type="submit" className="flex-1 bg-black dark:bg-white dark:text-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md">
                            {currentAction.id ? 'Salvar Alterações' : 'Criar Ação'}
                        </button>
                        {currentAction.id && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    setCurrentAction({ title: '', description: '', module: 'write', action_link: '', priority: 'medium', active: true, icon_name: 'Star', bg_color: 'bg-blue-600', button_text: 'Acessar' });
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

            {/* LISTA PREVIEW */}
            <div className="xl:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-500 dark:text-gray-400">Ações no Dashboard dos Alunos</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{actions.length} ações</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actions.map((action) => {
                        // @ts-ignore
                        const Icon = Icons[action.icon_name] || Icons.Star;
                        return (
                            <div key={action.id} className="relative group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${action.bg_color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(action)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100"><Icons.Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(action.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100"><Icons.Trash2 size={16} /></button>
                                    </div>
                                </div>
                                
                                <h4 className="font-bold text-gray-800 dark:text-white text-lg">{action.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 mb-4 min-h-[40px]">{action.description}</p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] uppercase font-bold mb-1 ${action.active ? 'text-green-500' : 'text-gray-400'}`}>
                                            {action.active ? '● Ativo' : '○ Inativo'}
                                        </span>
                                        <span className="text-xs text-gray-400 truncate max-w-[150px] font-mono bg-gray-50 dark:bg-gray-900 px-1 rounded">
                                            {action.action_link}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                                        {action.button_text}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}