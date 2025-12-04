import { getWriteModuleData } from '../actions';
import ManagePrompts from './components/ManagePrompts';

export default async function AdminWritePage() {
    const { data, error } = await getWriteModuleData();

    if (error || !data) {
        return <div className="text-red-500">Erro ao carregar dados: {error || 'Nenhum dado encontrado.'}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-dark-text dark:text-white">Gerenciar Módulo Write</h1>
            
            <div className="space-y-10">
                <ManagePrompts prompts={data.prompts || []} />  
            </div>
        </div>
    );
}