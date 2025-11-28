// src/app/dashboard/applications/library/portfolio/page.tsx
import { getPortfolioItems } from './actions';
import PortfolioCard from './PortfolioCard'; // Componente cliente abaixo

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <div className="max-w-7xl mx-auto px-6">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Portfólio Profissional</h1>
          <p className="text-gray-500 mt-2">Gerencie e compartilhe suas melhores produções acadêmicas.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <i className="fas fa-share-alt mr-2"></i> Compartilhar Link Público
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-royal-blue rounded-lg hover:bg-blue-700 shadow-sm">
            <i className="fas fa-plus mr-2"></i> Adicionar Projeto
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-sm font-medium mb-1">Visualizações Totais</div>
          <div className="text-3xl font-bold text-gray-800">1.2k</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-sm font-medium mb-1">Projetos Publicados</div>
          <div className="text-3xl font-bold text-gray-800">{items.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-sm font-medium mb-1">Curtidas</div>
          <div className="text-3xl font-bold text-gray-800">342</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <PortfolioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}