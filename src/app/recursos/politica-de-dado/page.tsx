"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const ModulePolicySection = ({ id, title, content }: { id: string, title: string, content: React.ReactNode }) => (
    <div id={id} className="pt-20 -mt-20">
        <h2 className="text-3xl font-bold text-dark-text mb-6 pb-2 border-b">{title}</h2>
        <div className="space-y-4">
            {content}
        </div>
    </div>
);

const PolicyTable = ({ headers, rows }: { headers: string[], rows: string[][] }) => (
    <div className="overflow-x-auto my-6">
        <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
                <tr>
                    {headers.map((header, i) => <th key={i} className="px-4 py-2 border font-bold text-left">{header}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className="bg-white">
                        {row.map((cell, j) => <td key={j} className="px-4 py-2 border" dangerouslySetInnerHTML={{ __html: cell }}></td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default function PoliticaDeDadosPage() {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const modules = [
        { id: 'write', title: 'Facillit Write' },
        { id: 'edu', title: 'Facillit Edu' },
        { id: 'games', title: 'Facillit Games' },
        { id: 'day', title: 'Facillit Day' },
        { id: 'play', title: 'Facillit Play' },
        { id: 'library', title: 'Facillit Library' },
        { id: 'connect', title: 'Facillit Connect' },
        { id: 'cnc', title: 'Facillit C&C' },
        { id: 'lab', title: 'Facillit Lab' },
        { id: 'test', title: 'Facillit Test' },
        { id: 'create', title: 'Facillit Create' },
        { id: 'finances', title: 'Facillit Finances' },
    ];

    return (
        <>
            <Header />
            <main>
                <section className="bg-brand-gradient text-white pt-32 pb-20 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-black">Detalhamento do Tratamento de Dados por Módulo</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto mt-4">Anexo à Política de Privacidade da Plataforma Facillit HUB</p>
                    </div>
                </section>

                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* --- BARRA LATERAL PARA TELAS GRANDES --- */}
                        <aside className="hidden lg:block lg:w-1/4 self-start sticky top-28">
                            <h3 className="font-bold text-lg mb-4">Navegue pelos Módulos</h3>
                            <ul className="space-y-2">
                                {modules.map(module => (
                                    <li key={module.id}>
                                        <a href={`#${module.id}`} className="text-text-muted hover:text-royal-blue font-medium transition-colors">{module.title}</a>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        {/* --- MENU DROPDOWN PARA TELAS PEQUENAS (MOBILE) --- */}
                        <div className="lg:hidden mb-4">
                            <button 
                                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                                className="w-full flex justify-between items-center p-4 border rounded-lg font-bold text-lg"
                            >
                                Navegue pelos Módulos
                                <i className={`fas fa-chevron-down transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}></i>
                            </button>
                            {isMobileMenuOpen && (
                                <nav className="mt-2 border rounded-lg p-4">
                                    <ul className="space-y-2">
                                        {modules.map(module => (
                                            <li key={module.id}>
                                                <a href={`#${module.id}`} onClick={() => setMobileMenuOpen(false)} className="block p-2 rounded-md text-text-muted hover:bg-gray-100 hover:text-royal-blue font-medium transition-colors">{module.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            )}
                        </div>
                        
                        <div className="lg:w-3/4 prose lg:prose-xl max-w-none space-y-12 text-text-muted">
                            
                            <ModulePolicySection id="write" title="Facillit Write" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Módulo especializado na produção, submissão, correção e aprimoramento de textos. Sua finalidade é oferecer uma ferramenta para que os usuários pratiquem a escrita e recebam feedback qualificado de corretores humanos ou por Inteligência Artificial.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Cadastro", "Nome Completo, E-mail", "Identificação do autor da redação e associação do conteúdo à sua conta.", "Inciso V: Execução de contrato."],
                                            ["Conteúdo Gerado pelo Usuário", "Redações, ensaios, comentários, anotações.", "Permitir a submissão, a correção (humana ou por IA), a atribuição de nota e o fornecimento de feedback.", "Inciso V: Execução de contrato."],
                                            ["Conteúdo Gerado pelo Usuário", "Conteúdo textual de redações e ensaios.", "Treinamento, validação e aprimoramento contínuo de modelos de Inteligência Artificial para correção automática.", "Inciso IX: Legítimo interesse; Inciso V: Execução de contrato."],
                                            ["Dados de Navegação e Uso", "Interações com o editor, tempo gasto na escrita, uso de ferramentas.", "Análise de usabilidade (UX Research) para otimização da interface.", "Inciso IX: Legítimo interesse."]
                                        ]}
                                    />
                                </>
                            }/>
                            
                            <ModulePolicySection id="edu" title="Facillit Edu" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Módulo central de gestão da aprendizagem (LMS). Sua finalidade é organizar o ambiente virtual de ensino, permitindo a criação de turmas, a distribuição de conteúdo, o gerenciamento de tarefas e o acompanhamento do progresso acadêmico.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Cadastro", "Nome Completo, E-mail, Identificador de Turma/Curso.", "Gerenciar a participação de alunos e professores em seus respectivos ambientes virtuais.", "Inciso V: Execução de contrato."],
                                            ["Conteúdo Gerado pelo Usuário", "Tarefas submetidas, respostas a exercícios, participação em fóruns.", "Viabilizar o processo de ensino-aprendizagem, incluindo entrega de atividades e avaliação.", "Inciso V: Execução de contrato."],
                                            ["Dados de Navegação e Uso", "Acesso a materiais, datas de conclusão de atividades, frequência.", "Acompanhamento do progresso individual e geração de relatórios de desempenho.", "Inciso V: Execução de contrato."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="games" title="Facillit Games" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Plataforma de aprendizado baseado em jogos (Game-Based Learning) e gamificação para ensinar e reforçar conceitos de forma interativa.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Cadastro", "Nome/Apelido (Nickname)", "Identificar o jogador, salvar seu progresso nos jogos e exibi-lo em placares de líderes (rankings).", "Inciso V: Execução de contrato."],
                                            ["Dados de Navegação e Uso", "Pontuações, tempo de resposta, padrões de erro, níveis concluídos.", "Operar a mecânica do jogo, registrar o desempenho e adaptar dinamicamente a dificuldade.", "Inciso V: Execução de contrato."],
                                            ["Dados de Navegação e Uso", "Padrões de interação agregados, taxas de conclusão de fases.", "Análise de dados de jogabilidade (gameplay analytics) para balanceamento e melhoria dos jogos.", "Inciso IX: Legítimo interesse."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="day" title="Facillit Day" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Ferramenta de organização pessoal e acadêmica, funcionando como uma agenda digital ou planejador (planner).</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Conteúdo Gerado pelo Usuário", "Tarefas, eventos de calendário, anotações, metas de estudo.", "Permitir ao usuário organizar sua rotina de estudos e compromissos pessoais.", "Inciso V: Execução de contrato."],
                                            ["Dados de Dispositivo Móvel", "Localização (geolocalização).", "Ativar funcionalidades opcionais e contextuais, como lembretes baseados em localização.", "Inciso I: Consentimento."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="play" title="Facillit Play" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Módulo de reprodução de mídia (media player) otimizado para conteúdo educacional como videoaulas e podcasts.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Navegação e Uso", "Vídeos assistidos, progresso de visualização (timestamp), interações com o player.", "Permitir a reprodução de conteúdo, salvar o progresso para o usuário continuar de onde parou.", "Inciso V: Execução de contrato."],
                                            ["Conteúdo Gerado pelo Usuário", "Anotações sincronizadas com o tempo do vídeo.", "Permitir que o usuário crie notas contextuais durante a visualização de aulas para facilitar a revisão.", "Inciso V: Execução de contrato."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="library" title="Facillit Library" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Biblioteca digital ou repositório de conteúdo para centralizar e organizar materiais de estudo.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Navegação e Uso", "Termos de busca, documentos acessados, itens favoritados ou salvos.", "Permitir a pesquisa e o acesso ao acervo, além de personalizar a experiência com recomendações.", "Inciso V: Execução de contrato."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="connect" title="Facillit Connect" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Ferramenta de comunicação e colaboração social para promover a interação entre alunos, professores e tutores.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Cadastro", "Nome, Foto de Perfil (opcional).", "Identificação dos participantes nas interações sociais e colaborativas.", "Inciso V: Execução de contrato."],
                                            ["Conteúdo Gerado pelo Usuário", "Mensagens em fóruns, chats, comentários, arquivos compartilhados.", "Viabilizar a comunicação e a colaboração entre os membros da comunidade de aprendizado.", "Inciso V: Execução de contrato."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="cnc" title="Facillit C&C" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Módulo voltado para educadores e administradores para criação, organização e gerenciamento do currículo acadêmico e planos de aula.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Cadastro", "Nome, E-mail, Nível de Permissão.", "Identificar e autenticar educadores para o gerenciamento de conteúdo curricular.", "Inciso V: Execução de contrato."],
                                            ["Conteúdo Gerado pelo Usuário", "Planos de aula, trilhas de aprendizagem, upload de materiais didáticos.", "Permitir que os educadores criem e organizem o conteúdo pedagógico.", "Inciso V: Execução de contrato."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="lab" title="Facillit Lab" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Laboratório virtual para oferecer um ambiente simulado onde os alunos podem realizar experimentos de ciências.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Conteúdo Gerado pelo Usuário", "Relatórios de experimentos, anotações, resultados inseridos.", "Permitir que o aluno documente e submeta suas descobertas e conclusões.", "Inciso V: Execução de contrato."],
                                            ["Dados de Navegação e Uso", "Ações realizadas na simulação, variáveis manipuladas, resultados gerados.", "Registrar o procedimento do aluno para avaliação pelo professor.", "Inciso V: Execução de contrato."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="test" title="Facillit Test" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Módulo de avaliação e testagem para criação, aplicação e correção de provas, testes e questionários.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Conteúdo Gerado pelo Usuário", "Respostas a questões de múltipla escolha, respostas dissertativas.", "Coletar as respostas do aluno para permitir a correção e a atribuição de uma nota.", "Inciso V: Execução de contrato."],
                                            ["Dados de Navegação e Uso", "Tempo de resposta, logs de acesso.", "Registrar a submissão da avaliação e aplicar medidas de segurança para garantir a integridade do processo.", "Inciso V: Execução de contrato; Inciso IX: Legítimo interesse."]
                                        ]}
                                    />
                                </>
                            }/>

                            <ModulePolicySection id="create" title="Facillit Create" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Ferramenta de autoria e criação de conteúdo multimídia, como apresentações, infográficos e mapas mentais.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Conteúdo Gerado pelo Usuário", "Apresentações, infográficos, mapas mentais, e todos os seus elementos.", "Permitir que o usuário utilize as ferramentas para criar e salvar seus próprios projetos.", "Inciso V: Execução de contrato."],
                                            ["Dados de Dispositivo Móvel", "Acesso à galeria de fotos e vídeos.", "Permitir que o usuário realize o upload de arquivos de mídia pessoal para incorporar em seus projetos.", "Inciso I: Consentimento."]
                                        ]}
                                    />
                                </>
                            }/>
                            
                            <ModulePolicySection id="finances" title="Facillit Finances" content={
                                <>
                                    <p><strong>Descrição Funcional (Inferida):</strong> Módulo de gestão financeira para gerenciar assinaturas, processar pagamentos e emitir faturas.</p>
                                    <PolicyTable
                                        headers={["Categoria de Dados", "Dados Específicos", "Finalidade", "Base Legal (LGPD)"]}
                                        rows={[
                                            ["Dados de Pagamento", "CPF, dados de cartão de crédito (tokenizados), endereço de faturamento.", "Processamento de pagamentos para assinaturas e serviços, gestão de cobranças e renovações.", "Inciso V: Execução de contrato."],
                                            ["Dados de Pagamento", "CPF, Nome Completo, Endereço.", "Cumprimento de obrigações fiscais, como a emissão de notas fiscais eletrônicas.", "Inciso II: Cumprimento de obrigação legal ou regulatória."]
                                        ]}
                                    />
                                </>
                            }/>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}