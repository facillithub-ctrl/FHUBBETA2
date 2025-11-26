import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PoliticaDePrivacidadePage() {
    return (
        <>
            <Header />
            <main>
                <section className="bg-brand-gradient text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white-text mb-4">Política de Privacidade</h1>
                        <p className="text-lg text-text-white">Última Atualização: 02 de Outubro de 2025</p>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="prose lg:prose-xl max-w-none space-y-8 text-text-muted">
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">1. Introdução: Nosso Compromisso com a Sua Privacidade</h2>
                                <p>Este documento, a Política de Privacidade da FACILLIT HUB TECNOLOGIA E EDUCAÇÃO LTDA. (FACILLIT HUB, nós), tem como objetivo informar de maneira clara, transparente e detalhada como coletamos, utilizamos, armazenamos e protegemos os seus dados pessoais. Reconhecemos a importância fundamental da sua privacidade e nos comprometemos a tratar seus dados com o máximo de cuidado, segurança e em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD) e demais legislações aplicáveis, como o Marco Civil da Internet (Lei nº 12.965/2014) e o Estatuto da Criança e do Adolescente (Lei nº 8.069/1990).</p>
                                <p>Esta política se aplica a todos os Usuários (conforme definido em nossos Termos de Uso) que acessam ou utilizam nossa Plataforma o ecossistema digital integrado que inclui os subprodutos Facillit Edu, Facillit Games, Facillit Write e Facillit Day. A leitura atenta e a aceitação desta Política são requisitos indispensáveis para o uso de nossos serviços, sendo este documento parte indissociável dos Termos de Uso.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">2. Definições-Chave para a Sua Compreensão</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Dados Pessoais:</strong> Qualquer informação relacionada a uma pessoa natural identificada ou identificável. Exemplos incluem nome, e-mail, CPF e endereço IP.</li>
                                    <li><strong>Titular:</strong> A pessoa natural a quem se referem os dados pessoais que são objeto de tratamento (você, o Usuário).</li>
                                    <li><strong>Tratamento:</strong> Toda e qualquer operação realizada com dados pessoais, como coleta, produção, recepção, classificação, utilização, acesso, armazenamento, eliminação, entre outras.</li>
                                    <li><strong>Controlador:</strong> Pessoa natural ou jurídica a quem competem as decisões referentes ao tratamento de dados pessoais. O Controlador define por que e como os dados são tratados.</li>
                                    <li><strong>Operador:</strong> Pessoa natural ou jurídica que realiza o tratamento de dados pessoais em nome do Controlador, seguindo suas instruções.</li>
                                    <li><strong>Encarregado de Proteção de Dados (DPO):</strong> Pessoa indicada pelo Controlador e Operador para atuar como canal de comunicação entre a organização, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD).</li>
                                    <li><strong>LGPD:</strong> Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), o marco legal brasileiro que regula o tratamento de dados pessoais.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">3. Nosso Papel no Tratamento dos Seus Dados: Controlador ou Operador?</h2>
                                <p className="mb-4">A LGPD define diferentes responsabilidades dependendo do papel que uma entidade desempenha no tratamento de dados. O seu relacionamento com o FACILLIT HUB determina nosso papel, o que tem implicações diretas sobre como você exerce seus direitos.</p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">FACILLIT HUB como Controlador</h3>
                                <p>Atuamos como Controlador dos dados pessoais quando você, como Usuário Individual, se cadastra diretamente em nossa Plataforma. Neste cenário, nós tomamos as decisões sobre quais dados coletar, para quais finalidades e por quanto tempo, sendo o ponto de contato direto para o exercício de todos os seus direitos de titular.</p>
                                <h3 className="text-xl font-bold text-dark-text mt-6 mb-2">FACILLIT HUB como Operador</h3>
                                <p>Atuamos como Operador quando sua conta é criada, fornecida ou gerenciada por um Usuário Institucional (como uma escola, curso ou empresa). Nesse caso, a dinâmica de responsabilidades é diferente: O Usuário Institucional é o Controlador dos dados. É a instituição que determina as finalidades do tratamento e possui a responsabilidade primária de obter o consentimento legalmente válido de cada usuário vinculado, especialmente o consentimento específico dos pais ou responsáveis legais no caso de crianças e adolescentes. Nós, como Operador, tratamos os dados pessoais estritamente de acordo com as instruções lícitas do Controlador (a instituição) e para as finalidades delimitadas no contrato de prestação de serviços.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">4. Quais Dados Coletamos, Para Quê e Com Qual Base Legal?</h2>
                                <p className="mb-4">A coleta de dados no FACILLIT HUB segue rigorosamente os princípios da finalidade, adequação e necessidade da LGPD. Coletamos apenas os dados estritamente necessários para oferecer, manter e aprimorar nossos serviços. A tabela abaixo detalha as nossas atividades de tratamento de dados:</p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border text-sm my-4">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 border font-bold">Categoria de Dados</th>
                                                <th className="px-4 py-2 border font-bold">Dados Específicos Coletados</th>
                                                <th className="px-4 py-2 border font-bold">Finalidade Específica do Tratamento</th>
                                                <th className="px-4 py-2 border font-bold">Base Legal (LGPD, Art. 7º)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-4 py-2 border">Dados de Cadastro</td>
                                                <td className="px-4 py-2 border">Nome Completo, E-mail.</td>
                                                <td className="px-4 py-2 border">Identificação do usuário, criação e gestão da conta, envio de comunicações essenciais sobre o serviço.</td>
                                                <td className="px-4 py-2 border">Inciso V: Execução de contrato.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border">Dados de Pagamento</td>
                                                <td className="px-4 py-2 border">CPF, dados de cartão de crédito (processados por parceiro), endereço de faturamento.</td>
                                                <td className="px-4 py-2 border">Processamento de pagamentos para usuários pagantes, cumprimento de obrigações fiscais e legais relacionadas.</td>
                                                <td className="px-4 py-2 border">Inciso V: Execução de contrato; Inciso II: Cumprimento de obrigação legal ou regulatória.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border">Dados de Verificação Profissional (Tutores/Corretores)</td>
                                                <td className="px-4 py-2 border">CPF, Documento de Identidade (RG, CNH), Diplomas e Certificados.</td>
                                                <td className="px-4 py-2 border">Verificar a identidade e a qualificação profissional para garantir a segurança da plataforma e a qualidade dos serviços de tutoria e correção.</td>
                                                <td className="px-4 py-2 border">Inciso V: Execução de contrato; Inciso IX: Legítimo interesse do controlador em manter um ambiente seguro e qualificado.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border">Conteúdo Gerado pelo Usuário</td>
                                                <td className="px-4 py-2 border">Redações, anotações, planos de aula, tarefas, comentários, imagens e vídeos enviados para a Plataforma.</td>
                                                <td className="px-4 py-2 border" dangerouslySetInnerHTML={{ __html: '1. Operação da Plataforma: Permitir o funcionamento dos serviços. <br/> 2. Pesquisa e Desenvolvimento (P&D) e Treinamento de Inteligência Artificial (IA): Utilizar o conteúdo para treinar, validar e aprimorar nossos algoritmos. <br/> 3. Análise: Entender como os usuários interagem com a plataforma para otimizar a experiência.' }}></td>
                                                <td className="px-4 py-2 border" dangerouslySetInnerHTML={{ __html: '1. Inciso V: Execução de contrato. <br/> 2. Inciso V: Execução de contrato e Inciso IX: Legítimo interesse. <br/> 3. Inciso IX: Legítimo interesse.' }}></td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border">Dados de Navegação e Uso (Logs)</td>
                                                <td className="px-4 py-2 border">Endereço de Protocolo de Internet (IP), data e hora de acesso, tipo de navegador, páginas visitadas.</td>
                                                <td className="px-4 py-2 border" dangerouslySetInnerHTML={{ __html: '1. Segurança: Monitorar atividades suspeitas e proteger a plataforma. <br/> 2. Obrigação Legal: Cumprir a obrigação de guarda de registros de acesso do Marco Civil da Internet.' }}></td>
                                                <td className="px-4 py-2 border" dangerouslySetInnerHTML={{ __html: '1. Inciso IX: Legítimo interesse. <br/> 2. Inciso II: Cumprimento de obrigação legal.' }}></td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border">Dados de Dispositivo Móvel (com permissão)</td>
                                                <td className="px-4 py-2 border">Acesso à galeria de fotos e vídeos; Acesso à localização (opcional).</td>
                                                <td className="px-4 py-2 border" dangerouslySetInnerHTML={{ __html: 'Galeria: Permitir que o usuário realize o upload de arquivos. <br/> Localização: Ativar funcionalidades opcionais baseadas em geolocalização.' }}></td>
                                                <td className="px-4 py-2 border">Inciso I: Consentimento.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">5. Tratamento de Dados de Crianças e Adolescentes</h2>
                                <p>Compreendemos que nosso público-alvo inclui estudantes que podem ser menores de 18 anos. A proteção de seus dados é nossa prioridade máxima, seguindo as diretrizes do Estatuto da Criança e do Adolescente (ECA) e do Artigo 14 da LGPD. Todo e qualquer tratamento de dados pessoais de crianças e adolescentes é condicionado ao consentimento específico e em destaque, dado por, pelo menos, um dos pais ou pelo responsável legal. Quando a conta do menor é criada por um Usuário Institucional (escola), a responsabilidade de obter e gerenciar esse consentimento parental é da instituição, que atua como Controladora dos dados.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">6. Com Quem Compartilhamos Seus Dados?</h2>
                                <p>O FACILLIT HUB não vende seus dados pessoais. O compartilhamento ocorre apenas quando estritamente necessário para a prestação de nossos serviços, como com Provedores de Serviços e Parceiros Tecnológicos, Usuários Institucionais, Autoridades Públicas ou em caso de Operações Societárias.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">7. Por Quanto Tempo Guardamos Seus Dados?</h2>
                                <p>Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados ou para atender a obrigações legais. Dados da Conta são mantidos enquanto sua conta estiver ativa. Registros de Acesso (Logs) são guardados por 6 meses, conforme o Marco Civil da Internet. Ao aceitar nossos Termos de Uso, você concede uma licença perpétua e irrevogável para usar o conteúdo que você gera (como redações) para o treinamento e aprimoramento de nossos modelos de Inteligência Artificial, de forma que não estejam mais atrelados à sua identidade após o encerramento da conta.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">8. Seus Direitos como Titular de Dados</h2>
                                <p>A LGPD lhe concede direitos sobre seus dados, como: Confirmação da existência de tratamento, Acesso aos dados, Correção, Anonimização, bloqueio ou eliminação, Portabilidade, Eliminação dos dados tratados com consentimento, Informação sobre compartilhamento, Informação sobre a possibilidade de não consentir, Revogação do consentimento e Revisão de decisões automatizadas.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">9. Como Exercer Seus Direitos e Contatar Nosso DPO</h2>
                                <p>Para exercer qualquer um dos seus direitos ou para esclarecer dúvidas, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: <strong>privacidade@facillithub.com.br</strong>. As solicitações serão respondidas nos prazos previstos na LGPD.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">10. Como Protegemos Seus Dados</h2>
                                <p>Adotamos um conjunto de medidas técnicas e administrativas robustas para proteger seus dados pessoais, incluindo controles de acesso rigorosos, criptografia de dados em trânsito e em repouso, e monitoramento contínuo de nossos sistemas.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">11. Alterações a esta Política de Privacidade</h2>
                                <p>Poderemos atualizar esta Política de Privacidade periodicamente. Quando as alterações forem materiais, notificaremos os usuários com antecedência. Recomendamos a revisão regular deste documento.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-dark-text mb-4">12. Legislação Aplicável e Foro</h2>
                                <p>Esta Política de Privacidade será regida pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, como o competente para dirimir quaisquer questões oriundas deste documento.</p>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}