import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const legalDocuments = [
  {
    category: "Geral",
    items: [
      { title: "Termos de Uso Facillit Hub", href: "/recursos/uso", desc: "Regras gerais para a utilização da nossa plataforma e serviços." },
      { title: "Política de Privacidade", href: "/recursos/privacidade", desc: "Como coletamos, usamos e protegemos os seus dados pessoais." },
      { title: "Política de Cookies", href: "/recursos/politica-cookies", desc: "Informações sobre o uso de cookies e tecnologias de rastreamento." }
    ]
  },
  {
    category: "Privacidade e Dados (Brasil / LGPD)",
    items: [
      { title: "Aviso de Direitos de Privacidade", href: "/recursos/privacidade-brasil", desc: "Seus direitos específicos sob a LGPD." },
      { title: "Proteção de Dados", href: "/recursos/politica-de-dado", desc: "Medidas de segurança e governança de dados." },
      { title: "Políticas de Dados por Módulo", href: "/recursos/politica-de-dado", desc: "Especificidades de dados para Write, Edu, Test, etc." }
    ]
  },
  {
    category: "Comercial e Propriedade",
    items: [
      { title: "Contrato de Assinatura", href: "/recursos/contrato-assinatura", desc: "Termos para assinantes dos planos pagos." },
      { title: "Direitos Autorais", href: "/recursos/direito-autoral", desc: "Diretrizes sobre propriedade intelectual dentro da plataforma." }
    ]
  }
];

export default function LegalHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-5xl">
          
          {/* Cabeçalho da Página */}
          <div className="text-center mb-16">
            <span className="text-brand-purple font-bold tracking-wider uppercase text-sm mb-2 block">Transparência e Confiança</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Centro de Documentação Legal</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Aqui você encontra todos os documentos que regem a nossa relação, organizados para facilitar o seu acesso à informação.
            </p>
          </div>

          {/* Grid de Documentos */}
          <div className="space-y-12">
            {legalDocuments.map((section, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-brand-gradient rounded-full"></div>
                  {section.category}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((doc) => (
                    <Link 
                      key={doc.title} 
                      href={doc.href}
                      className="group block p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <i className="fas fa-file-alt text-2xl text-gray-400 group-hover:text-brand-purple transition-colors"></i>
                        <i className="fas fa-arrow-right text-sm text-transparent group-hover:text-brand-green transition-colors -translate-x-2 group-hover:translate-x-0"></i>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-brand-purple transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {doc.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé da Secção */}
          <div className="mt-16 text-center p-8 bg-brand-dark rounded-3xl text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-brand-gradient opacity-10"></div>
            <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Dúvidas sobre os nossos termos?</h3>
                <p className="text-gray-300 mb-6">A nossa equipa de Proteção de Dados está à disposição.</p>
                <Link href="/recursos/contato" className="inline-block px-8 py-3 bg-white text-brand-purple font-bold rounded-full hover:scale-105 transition-transform">
                    Entrar em Contato
                </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}