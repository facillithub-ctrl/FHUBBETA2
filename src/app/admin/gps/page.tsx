import ManageGPSActions from './components/ManageGPSActions';
// Importa do arquivo local actions.ts
import { getGPSActions } from './actions';

export default async function AdminGPSPage() {
    const actions = await getGPSActions();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2 dark:text-white">Configurar GPS de Aprendizagem</h1>
            <p className="text-gray-500 mb-6">Crie ações sugeridas que aparecerão para todos os alunos no dashboard.</p>
            
            <ManageGPSActions initialActions={actions} />
        </div>
    );
}