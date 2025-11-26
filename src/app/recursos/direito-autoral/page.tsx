import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function DireitoAutoralPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-brand-gradient text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white-text mb-4">Termo de Consentimento para Uso de Texto</h1>
                        <p className="text-lg text-text-white">Última Atualização: 02 de Outubro de 2025</p>
                    </div>
                </section>

                <section className="py-12 bg-white dark:bg-dark-background">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="prose lg:prose-xl max-w-none space-y-8 text-text-muted dark:text-dark-text-muted">

                            <p>
                                Prezado(a) Usuário(a), este documento detalha como seu texto, produzido e submetido em nossa plataforma, poderá ser utilizado por nós. Solicitamos que leia com atenção e manifeste seu consentimento de forma livre e informada.
                            </p>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">1. Titularidade dos Direitos Autorais</h2>
                                <p>
                                    Reforçamos que você continuará sendo o(a) titular de todos os direitos autorais sobre o texto original que você criou. A sua autoria e propriedade intelectual sobre a obra serão sempre respeitadas.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">2. Licença de Uso para Operação da Plataforma</h2>
                                <p>
                                    Para que possamos oferecer nossos serviços a você (como hospedar, processar, corrigir e devolver seu texto), ao submeter o conteúdo, você nos concede uma licença de uso. Esta licença é essencial e obrigatória para a utilização dos nossos serviços de correção e análise textual.
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li><strong>Finalidade:</strong> Exclusivamente para operar, desenvolver e aprimorar as funcionalidades da plataforma que você utiliza.</li>
                                    <li><strong>Abrangência:</strong> Mundial (para operar o serviço online sem restrições geográficas).</li>
                                    <li><strong>Exclusividade:</strong> Não exclusiva (você tem total liberdade para usar seu texto como desejar fora da plataforma).</li>
                                    <li><strong>Custos:</strong> Isenta de royalties (não haverá pagamento pela concessão desta licença).</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">3. Consentimentos Específicos</h2>
                                <p>
                                    Para além do uso básico, gostaríamos da sua permissão para utilizar seu texto em outras frentes que nos ajudam a evoluir e aprimorar a qualidade de nossos serviços para todos.
                                </p>
                                <div className="mt-4 space-y-4">
                                    <h3 className="text-xl font-bold text-dark-text dark:text-white">A. Treinamento de Inteligência Artificial (IA)</h3>
                                    <p>
                                        Para aprimorar continuamente a precisão e a qualidade de nossas ferramentas de correção automática, utilizamos os textos enviados para treinar nossos modelos de inteligência artificial. Este processo é fundamental para que nossa tecnologia aprenda e se torne mais eficaz.
                                    </p>
                                    <h3 className="text-xl font-bold text-dark-text dark:text-white">B. Uso para Marketing e Materiais Educacionais</h3>
                                    <p>
                                        Para demonstrar a eficácia de nossa plataforma e compartilhar exemplos de boas práticas, podemos usar trechos ou exemplos de seus textos em materiais de marketing e conteúdos educacionais. Nosso compromisso: Todo conteúdo utilizado para esta finalidade será rigorosamente anonimizado, removendo qualquer informação que possa identificar você.
                                    </p>
                                     <h3 className="text-xl font-bold text-dark-text dark:text-white">C. Análise de Dados para Pesquisa</h3>
                                    <p>
                                        Com o objetivo de realizar pesquisas, análises estatísticas e entender tendências de escrita, poderemos processar os dados do seu texto de forma agregada e anonimizada. Este processo remove permanentemente qualquer vínculo com sua identidade.
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">Declaração de Consentimento</h2>
                                <p>
                                    Ao concordar com os termos no momento do envio da sua redação, você declara que leu, compreendeu e concorda com os termos aqui apresentados, concedendo as permissões de forma livre e espontânea.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}