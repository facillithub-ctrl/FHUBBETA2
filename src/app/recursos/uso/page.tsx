import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TermosDeUsoPage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-brand-gradient text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white-text mb-4">Termos e Condições de Uso da Plataforma Facillit HUB</h1>
                        <p className="text-lg text-text-white">Última Atualização: 02 de Outubro de 2025</p>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="prose lg:prose-xl max-w-none space-y-8 text-text-muted">

                            <p>
                                Bem-vindo(a) à Facillit Hub! Estes Termos e Condições de Uso (Termos) constituem um contrato legalmente vinculativo entre você (Usuário) e a FACILLIT HUB TECNOLOGIA E EDUCAÇÃO LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº  63.048.416/0001-08
, com sede em Praça Marechal Deodoro, 76, Santa Cecilia, São Paulo, SP, Brasil. (Facillit Hub, nós, nosso). Ao criar uma conta, acessar ou utilizar a plataforma Facillit Hub, incluindo nosso website, aplicativos e quaisquer serviços associados (coletivamente, os Serviços), você declara que leu, compreendeu e concorda em cumprir integralmente estes Termos e nossa <Link href="/recursos/privacidade" className="text-royal-blue underline">Política de Privacidade</Link>, que é parte integrante deste documento. <strong>SE VOCÊ NÃO CONCORDA COM QUALQUER PARTE DESTES TERMOS, VOCÊ NÃO DEVE ACESSAR OU UTILIZAR NOSSOS SERVIÇOS.</strong>
                            </p>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">1. DEFINIÇÕES</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Plataforma:</strong> Refere-se ao ambiente digital da Facillit Hub, acessível via website [facillithub.com.br] e aplicativos, onde os Serviços são oferecidos.</li>
                                    <li><strong>Usuário:</strong> Qualquer pessoa física que cria uma conta e utiliza os Serviços da Plataforma.</li>
                                    <li><strong>Conteúdo do Usuário:</strong> Refere-se a todo e qualquer texto, informação ou material que o Usuário envia, publica ou exibe na Plataforma, incluindo, mas não se limitando a, redações submetidas na seção Facillit Write.</li>
                                    <li><strong>Facillit Write:</strong> Módulo específico dos Serviços destinado à produção textual, que oferece correção e análise de redações por meio de uma tecnologia híbrida de Inteligência Artificial e tutores humanos.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">2. OBJETO DOS SERVIÇOS</h2>
                                <p>A Facillit Hub oferece uma plataforma educacional online com ferramentas e recursos para auxiliar estudantes em sua jornada de aprendizado, com foco especial na melhoria da escrita através do módulo Facillit Write. Os Serviços podem incluir, entre outros, a submissão de redações, correção automatizada por Inteligência Artificial, revisão por tutores humanos, fornecimento de feedback, análise de desempenho e acesso a materiais educacionais.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">3. CADASTRO, CONTA E ELEGIBILIDADE</h2>
                                <p><strong>3.1.</strong> Para utilizar os Serviços, o Usuário deve criar uma conta, fornecendo informações verdadeiras, precisas e completas. O Usuário é o único responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.</p>
                                <p><strong>3.2. Idade Mínima:</strong> Os Serviços são destinados a pessoas com idade igual ou superior a 16 (dezesseis) anos. Ao criar uma conta, você declara e garante que possui a idade mínima exigida. A utilização dos Serviços por menores de 16 anos só é permitida com o consentimento específico e em destaque de um dos pais ou responsável legal, que deverá supervisionar o uso da conta.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">4. PROPRIEDADE INTELECTUAL</h2>
                                <p><strong>4.1. Conteúdo da Facillit Hub:</strong> Todos os direitos de propriedade intelectual sobre a Plataforma, o software, as marcas, logotipos, designs, textos, gráficos e outros conteúdos fornecidos pela Facillit Hub (Conteúdo da Facillit Hub) são de titularidade exclusiva da Facillit Hub ou de seus licenciantes. Estes Termos não concedem ao Usuário qualquer direito de usar o Conteúdo da Facillit Hub, exceto conforme estritamente necessário para a utilização dos Serviços.</p>
                                <p><strong>4.2. Conteúdo do Usuário:</strong> Você retém todos os direitos de propriedade intelectual sobre o Conteúdo do Usuário que você cria e submete à Plataforma.</p>
                                <p><strong>4.3. Licença de Uso para a Facillit Hub:</strong> Ao submeter Conteúdo do Usuário à Plataforma, você concede à Facillit Hub uma licença mundial, não exclusiva, isenta de royalties, sublicenciável e transferível para usar, hospedar, armazenar, reproduzir, modificar, criar obras derivadas (como as redações corrigidas e analisadas), comunicar, publicar e distribuir tal Conteúdo do Usuário.</p>
                                <p><strong>4.4. Finalidade da Licença:</strong> Esta licença é concedida com o único e exclusivo propósito de permitir que a Facillit Hub opere, desenvolva, aprimore, promova e preste os Serviços a você e a outros usuários, conforme descrito nestes Termos e em nossa Política de Privacidade.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">5. USO DE SEU CONTEÚDO PARA FINALIDADES ESPECÍFICAS</h2>
                                <p><strong>5.1. Análise de Dados para Aprimoramento do Serviço:</strong> Com o objetivo de realizar pesquisas acadêmicas, análises estatísticas e aprimorar constantemente nossos serviços educacionais, a Facillit Hub poderá processar os dados de sua redação e de seu desempenho de forma agregada e anonimizada. O processo de anonimização remove permanentemente toda e qualquer informação que possa levar à sua identificação.</p>
                                <p><strong>5.2. Consentimento para Treinamento de Inteligência Artificial:</strong> Para aprimorar continuamente a qualidade de nossas ferramentas, a Facillit Hub utiliza as redações enviadas para treinar, desenvolver e validar seus modelos de inteligência artificial. Este processo é essencial para que nossa tecnologia aprenda com uma ampla variedade de estilos de escrita. Ao concordar com estes termos, você afirma: <strong>&quot;Li e concordo que minhas redações sejam utilizadas para o treinamento e aprimoramento da inteligência artificial da Facillit Hub&quot;.</strong></p>
                                <p><strong>5.3. Consentimento para Uso em Marketing e Materiais Educacionais:</strong> Para demonstrar a eficácia de nossa plataforma, gostaríamos de ter a sua permissão para utilizar, ocasionalmente, trechos de suas redações em nossos materiais de marketing e conteúdos educacionais, sempre de forma anonimizada. Este consentimento é opcional. <strong>&quot;Sim, autorizo o uso de trechos anonimizados de minhas redações para fins educacionais e de marketing pela Facillit Hub.&quot;</strong></p>
                                <p><strong>5.4. Gerenciamento de Permissões:</strong> Você pode, a qualquer momento, revisar e alterar suas permissões de consentimento na seção &quot;Configurações de Privacidade&quot; de sua conta. A revogação do consentimento não afetará a legalidade do tratamento realizado anteriormente.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">6. OBRIGAÇÕES DO USUÁRIO E CONDUTA</h2>
                                <p>O Usuário concorda em não utilizar os Serviços para enviar conteúdo ilegal, ofensivo ou que viole direitos de terceiros; tentar obter acesso não autorizado; interferir no desempenho dos Serviços; ou utilizar a plataforma para qualquer finalidade comercial sem autorização.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">7. PRIVACIDADE E PROTEÇÃO DE DADOS</h2>
                                <p>A Facillit Hub está comprometida com a proteção de seus dados pessoais. Nossa <Link href="/recursos/privacidade" className="text-royal-blue underline">Política de Privacidade</Link> detalha como coletamos, usamos, armazenamos e protegemos suas informações em conformidade com a LGPD.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">8. LIMITAÇÃO DE RESPONSABILIDADE</h2>
                                <p>Os Serviços são fornecidos &quot;no estado em que se encontram&quot;. A Facillit Hub não garante que os Serviços serão ininterruptos ou livres de erros. Na máxima extensão permitida pela lei, a Facillit Hub não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">9. MODIFICAÇÃO E RESCISÃO</h2>
                                <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento e notificaremos você sobre alterações materiais. O uso continuado dos Serviços após as alterações constituirá sua aceitação. Você pode encerrar este acordo excluindo sua conta. A Facillit Hub pode suspender ou encerrar sua conta se você violar estes Termos.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">10. DISPOSIÇÕES GERAIS</h2>
                                <p>Estes Termos serão regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer questões oriundas destes Termos. Em caso de dúvidas, entre em contato conosco através do e-mail: [e-mail de contato].</p>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}