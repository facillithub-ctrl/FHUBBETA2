// CAMINHO: src/app/modulos/facillit-stories/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import ContactCTA from '@/components/ContactCTA';
import Link from 'next/link';

const FeatureIcon = ({ icon, title, text }: { icon: string, title: string, text: string }) => (
    <div className="feature-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="text-brand-purple text-3xl mb-4"><i className={`fas ${icon}`}></i></div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-text-muted">{text}</p>
    </div>
);

const StatCard = ({ value, label }: { value: string, label: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center border-b-4 border-brand-purple">
        <p className="text-4xl font-extrabold text-brand-dark">{value}</p>
        <p className="text-text-muted mt-2">{label}</p>
    </div>
);

export default function FacillitStoriesPage() {
    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-brand-purple to-brand-dark text-white pt-32 pb-24 text-center relative overflow-hidden">
                    {/* Elementos decorativos de fundo */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <i className="fas fa-quote-left absolute top-20 left-20 text-9xl"></i>
                        <i className="fas fa-quote-right absolute bottom-20 right-20 text-9xl"></i>
                    </div>

                    <div className="container mx-auto px-6 flex flex-col items-center relative z-10">
                        <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
                            <i className="fas fa-book-reader text-4xl"></i>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Facillit Stories</h1>
                        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
                            Onde leitores se encontram. <br/>
                            <span className="font-bold">A sua rede social literária global.</span>
                        </p>
                        <div className="mt-10 flex gap-4">
                             <Link href="/register" className="px-8 py-3 bg-white text-brand-purple font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                                Criar Conta Gratuita
                             </Link>
                             <Link href="/login" className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                                Já tenho conta
                             </Link>
                        </div>
                    </div>
                </section>

                {/* Conceito: Conexão Social */}
                <section className="py-20 bg-background-light">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="uppercase tracking-wider text-brand-purple font-bold text-sm mb-2">Conceito Global</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-6">Mais que leitura, conexão.</h2>
                            <p className="text-text-muted mb-6 text-lg">
                                O <strong>Facillit Library</strong> guarda o conhecimento. O <strong>Facillit Stories</strong> conecta as pessoas.
                            </p>
                            <p className="text-text-muted mb-4">
                                Imagine um espaço onde pode partilhar aquele trecho que mudou o seu dia, descobrir o que os seus amigos estão realmente a ler e participar em comunidades de fãs de fantasia ou clássicos.
                            </p>
                            <ul className="space-y-3 mt-6">
                                <li className="flex items-center gap-3 text-dark-text">
                                    <i className="fas fa-check-circle text-green-500"></i> Feed social de leituras
                                </li>
                                <li className="flex items-center gap-3 text-dark-text">
                                    <i className="fas fa-check-circle text-green-500"></i> Listas públicas (Lendo, Quero Ler, Lidos)
                                </li>
                                <li className="flex items-center gap-3 text-dark-text">
                                    <i className="fas fa-check-circle text-green-500"></i> Sem pressão académica ou notas
                                </li>
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <FeatureIcon icon="fa-users" title="Comunidades" text="Grupos temáticos globais para discutir os seus géneros favoritos." />
                            <FeatureIcon icon="fa-heart" title="Social" text="Curta, comente e siga perfis literários inspiradores." />
                            <FeatureIcon icon="fa-list-alt" title="Listas" text="Organize a sua vida literária e inspire outros." />
                            <FeatureIcon icon="fa-magic" title="Descoberta" text="IA que recomenda livros baseada no seu gosto, não na escola." />
                        </div>
                    </div>
                </section>

                {/* Seção de Visualização (Mockup) */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-text mb-12">O Instagram dos Leitores</h2>
                        <div className="max-w-5xl mx-auto bg-gray-50 rounded-2xl p-4 shadow-xl border border-gray-100">
                             {/* Placeholder visual para o feed do Stories */}
                             <div className="aspect-video rounded-xl bg-white flex items-center justify-center border border-gray-200">
                                <div className="text-center">
                                    <i className="fas fa-images text-6xl text-gray-200 mb-4"></i>
                                    <p className="text-gray-400">Preview da Interface Social</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>

                {/* Dados */}
                <section className="py-20 bg-background-light">
                    <div className="container mx-auto px-6">
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <StatCard value="Global" label="Acesso Universal" />
                            <StatCard value="Social" label="Foco na Comunidade" />
                            <StatCard value="24/7" label="Feed Interativo" />
                            <StatCard value="Livros" label="Paixão Compartilhada" />
                        </div>
                    </div>
                </section>

                <ContactCTA />
            </main>
            <Footer />
        </>
    );
}