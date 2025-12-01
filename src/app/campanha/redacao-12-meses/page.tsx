'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  CheckCircle2, ArrowRight, PenTool, BookOpen, Target, Zap, Lock,
  PlayCircle, Gamepad2, Library, BrainCircuit, Star, ShieldCheck
} from 'lucide-react'
import Image from 'next/image'

// Importações do seu projeto
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import createClient from '@/utils/supabase/client'

// --- DADOS DOS MÓDULOS EDUCATIVOS ---
const educationalModules = [
  {
    title: "Facillit Write",
    subtitle: "O Laboratório de Redação",
    description: "Editor inteligente que utiliza IA para correção gramatical instantânea, combinado com a análise argumentativa profunda feita por nossos professores humanos. Escreva, receba feedback e reescreva até a perfeição.",
    icon: PenTool,
    color: "text-brand-purple",
    bgAccent: "bg-brand-purple/10",
    imageSrc: "/assets/modulespervw/write/dashboard.jpeg" // Exemplo de caminho
  },
  {
    title: "Facillit Test",
    subtitle: "Simulados e Diagnósticos",
    description: "Banco de questões focado em repertório e gramática aplicada. Realize simulados cronometrados que geram um diagnóstico preciso das competências que você precisa melhorar.",
    icon: Target,
    color: "text-brand-green",
    bgAccent: "bg-brand-green/10",
    imageSrc: "/assets/images/marcas/test.png"
  },
  {
    title: "Facillit Library",
    subtitle: "Biblioteca de Repertório",
    description: "Acesse um acervo curado de redações nota 1000 analisadas, citações filosóficas, dados estatísticos e alusões históricas prontas para usar em seus textos.",
    icon: Library,
    color: "text-blue-600",
    bgAccent: "bg-blue-100",
    imageSrc: "/assets/images/marcas/library.png"
  },
  {
    title: "Facillit Create",
    subtitle: "Mapas Mentais e Organização",
    description: "Ferramenta visual para estruturar seu 'brainstorming' antes de começar a escrever. Organize teses, argumentos e propostas de intervenção visualmente.",
    icon: BrainCircuit,
    color: "text-orange-600",
    bgAccent: "bg-orange-100",
    imageSrc: "/assets/images/marcas/create.png"
  },
  {
    title: "Facillit Play",
    subtitle: "Streaming de Conteúdo",
    description: "Aulas em vídeo curtas e diretas ao ponto sobre as 5 competências do ENEM, gêneros textuais e análises de temas quentes para o próximo ciclo.",
    icon: PlayCircle,
    color: "text-red-600",
    bgAccent: "bg-red-100",
    imageSrc: "/assets/images/marcas/play.png"
  },
  {
    title: "Facillit Games",
    subtitle: "Aprendizagem Lúdica",
    description: "Fixe regras gramaticais complexas (como crase e pontuação) através de desafios interativos e jogos rápidos. Aprender não precisa ser chato.",
    icon: Gamepad2,
    color: "text-indigo-600",
    bgAccent: "bg-indigo-100",
    imageSrc: "/assets/images/marcas/games.png"
  },
];

// --- COMPONENTE DE ITEM DO MÓDULO COM PARALLAX RESPONSIVO ---
function ModuleItem({ module, index }: { module: typeof educationalModules[0], index: number }) {
  const ref = useRef(null);
  const isEven = index % 2 === 0;
  
  // Parallax apenas para desktop (ajustado via CSS/Media Queries no transform)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const yText = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const yImage = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-16 md:py-24 overflow-hidden border-b border-gray-50 last:border-0">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col-reverse ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-20`}>
          
          {/* Texto */}
          <motion.div 
            style={{ y: typeof window !== 'undefined' && window.innerWidth > 1024 ? yText : 0, opacity }} 
            className="flex-1 w-full text-center lg:text-left"
          >
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${module.bgAccent} ${module.color}`}>
              <module.icon size={28} />
            </div>
            <h4 className={`text-base font-bold mb-2 uppercase tracking-wider ${module.color}`}>{module.subtitle}</h4>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">{module.title}</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">{module.description}</p>
            
            {/* Indicador visual simples */}
            <div className={`h-1 w-24 bg-gray-100 rounded-full mx-auto lg:mx-0`}>
              <div className={`h-full w-1/3 rounded-full ${module.bgAccent.replace('/10', '')} opacity-50`}></div>
            </div>
          </motion.div>

          {/* Imagem (Mockup) */}
          <motion.div 
            style={{ y: typeof window !== 'undefined' && window.innerWidth > 1024 ? yImage : 0, opacity }}
            className="flex-1 w-full relative h-[300px] md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border-[6px] md:border-[8px] border-gray-100 shadow-2xl bg-gray-50 group hover:border-gray-200 transition-colors"
          >
             {/* Use Image component real aqui. Usando div para placeholder com ícone se a imagem não carregar */}
             <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                {/* Se você tiver as imagens, descomente a linha abaixo e remova o div do ícone */}
                {/* <Image src={module.imageSrc} alt={module.title} fill className="object-cover" /> */}
                
                <div className="text-center p-8 opacity-40">
                    <module.icon size={80} className="mx-auto mb-4 text-gray-400" />
                    <span className="font-bold text-gray-500 uppercase tracking-widest">Mockup {module.title}</span>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// --- PÁGINA PRINCIPAL ---
export default function CampaignPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      whatsapp: formData.get('whatsapp'),
      status: 'pending'
    }
    const { error } = await supabase.from('campaign_redacao_12meses').insert([data])
    setLoading(false)
    if (!error) setSubmitted(true)
    else alert('Ocorreu um erro ao processar sua inscrição. Tente novamente.')
  }

  return (
    <div className="min-h-screen bg-white font-inter text-gray-900 selection:bg-brand-purple selection:text-white">
      <Header />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 bg-white">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Esquerda: Copywriting */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }} 
              className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-brand-green text-xs md:text-sm font-bold uppercase tracking-wide mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-green"></span>
                </span>
                Vagas Abertas - Ciclo 2025
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-gray-900">
                12 Meses para escrever como um <span className="text-brand-purple">aprovado</span>.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Você escreve melhor em 12 meses. Sem custo. Sem complicação. Sem métodos milagrosos. 
                Acesso ao ecossistema Facillit Hub com <strong className="text-brand-purple">professores reais</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm font-medium text-gray-500 mb-8 lg:mb-0">
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-brand-green" /> Metodologia Validada</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-brand-green" /> Correção Humana</div>
              </div>
            </motion.div>
            
            {/* Direita: Formulário */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }} 
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 relative w-full max-w-md mx-auto lg:max-w-full"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-purple to-brand-green rounded-t-2xl" />
               {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Bolsa Emergencial</h3>
                        <p className="text-sm text-gray-500">Acesso Premium 100% Gratuito</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Nome</label>
                        <input name="full_name" required type="text" placeholder="Seu nome completo" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">E-mail</label>
                        <input name="email" required type="email" placeholder="Seu melhor e-mail" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">WhatsApp</label>
                        <input name="whatsapp" type="tel" placeholder="(00) 00000-0000" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all" />
                    </div>
                    <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-70 text-lg mt-2">
                      {loading ? 'Processando...' : 'Liberar Acesso Gratuito'} <ArrowRight size={20} />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4"><Lock size={12} /> Seus dados estão 100% seguros.</div>
                </form>
               ) : (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-brand-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Inscrição Realizada!</h3>
                  <p className="text-gray-500 mb-6">Verifique seu e-mail para acessar a plataforma.</p>
                  <button onClick={() => window.location.href = '/dashboard'} className="text-brand-purple font-bold hover:underline text-sm">Ir para Login &rarr;</button>
                </div>
               )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Ecossistema (Features Zig-Zag) */}
      <div className="bg-white relative z-20 pb-10">
        <div className="container mx-auto px-6 pt-10 pb-16 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
            Tudo o que você precisa em <span className="text-brand-purple">um só lugar</span>.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Esqueça as plataformas fragmentadas. O Facillit Hub integra 6 módulos poderosos para acelerar sua aprovação.
          </p>
        </div>
        
        {educationalModules.map((module, index) => (
          <ModuleItem key={module.title} module={module} index={index} />
        ))}
      </div>

      {/* 3. Professores */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Quem vai corrigir sua redação?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Nada de robôs genéricos ou estagiários. Aqui você tem contato com especialistas que vivem a sala de aula.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* Card Professor 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-full overflow-hidden bg-gray-200 border-2 border-brand-purple/20">
                 <Image src="/assets/images/time/pedro.JPG" alt="Prof. Pedro" fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Prof. Pedro</h3>
                <p className="text-brand-purple font-medium text-sm mb-2">Especialista em Linguagens</p>
                <p className="text-xs text-gray-500">Focado na estrutura argumentativa e coesão textual. Vai te ensinar a não fugir do tema.</p>
              </div>
            </div>
             {/* Card Professor 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-full overflow-hidden bg-gray-200 border-2 border-brand-purple/20">
                 <Image src="/assets/images/time/igor.jpg" alt="Prof. Igor" fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Prof. Igor</h3>
                <p className="text-brand-purple font-medium text-sm mb-2">Mestre em Literatura</p>
                <p className="text-xs text-gray-500">Responsável por ampliar seu repertório sociocultural para garantir os 200 pontos na competência 2.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENEFÍCIOS PREMIUM (Dark Contrast Section) */}
      <section className="py-24 bg-brand-dark text-white relative overflow-hidden">
        {/* Efeitos de Fundo */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[120px] pointer-events-none -mt-40 -mr-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-green/10 rounded-full blur-[100px] pointer-events-none -mb-20 -ml-20"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Lista de Benefícios */}
            <div>
               <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-brand-green text-xs font-bold mb-6 border border-white/5">
                  CONTA PREMIUM DESBLOQUEADA
               </div>
               <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                 Por que liberar o <br/><span className="text-brand-green">Premium de graça?</span>
               </h2>
               <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                 Queremos democratizar o acesso à correção de alto nível. Durante este ciclo de 12 meses, removemos a barreira financeira para que você foque apenas na sua aprovação.
               </p>
               
               <ul className="space-y-6">
                 {[
                   { title: "Correções Ilimitadas", desc: "Envie quantas redações quiser até a data do ENEM." },
                   { title: "Inteligência Artificial", desc: "Feedback instantâneo de gramática antes do professor ler." },
                   { title: "Acesso aos Simulados", desc: "Participe do ranking nacional e teste seu nível." },
                   { title: "Material Exclusivo", desc: "Biblioteca completa de repertórios e citações." }
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green flex-shrink-0 mt-1">
                       <CheckCircle2 size={16} strokeWidth={3} />
                     </div>
                     <div>
                       <strong className="block text-white text-lg">{item.title}</strong>
                       <span className="text-gray-400 text-sm">{item.desc}</span>
                     </div>
                   </li>
                 ))}
               </ul>
            </div>

            {/* Card de Preço/Oferta */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative transform hover:scale-[1.02] transition-transform duration-300">
               <div className="absolute top-0 right-0 bg-brand-green text-brand-dark text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-2xl">
                 OFFERTA POR TEMPO LIMITADO
               </div>

               <div className="text-center border-b border-white/10 pb-8 mb-8">
                 <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Valor do Plano Anual</p>
                 <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl text-gray-500 line-through decoration-red-500/60 decoration-2">R$ 997</p>
                    <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">-100% OFF</span>
                 </div>
                 <div className="text-6xl md:text-7xl font-black text-white mt-4 tracking-tighter">
                   R$ 0<span className="text-3xl text-gray-500 font-normal">,00</span>
                 </div>
                 <p className="text-gray-400 text-sm mt-4">Sem cartão de crédito. Sem letras miúdas.</p>
               </div>
               
               <div className="space-y-4">
                 <button 
                   onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                   className="w-full py-5 bg-brand-green text-brand-dark font-black text-lg rounded-xl hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(7,244,158,0.2)] flex items-center justify-center gap-3"
                 >
                    <Zap size={22} className="fill-current" />
                    Resgatar Minha Bolsa
                 </button>
                 <p className="text-center text-xs text-gray-500">
                   *Ao clicar, você garante sua vaga na turma de 2025.
                 </p>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Dúvidas Frequentes</h2>
          
          <div className="space-y-4">
            <details className="group bg-gray-50 rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-colors hover:border-gray-300">
              <summary className="flex items-center justify-between p-6 font-medium text-gray-900 list-none select-none">
                É realmente 100% gratuito?
                <span className="transition-transform group-open:rotate-180 text-gray-400">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-gray-600 px-6 pb-6 pt-0 leading-relaxed border-t border-gray-200/50 mt-2">
                <br/>Sim. Estamos oferecendo bolsas integrais para a turma deste ciclo de lançamento. Você não precisará cadastrar cartão de crédito em momento algum para acessar o plano gratuito.
              </div>
            </details>

            <details className="group bg-gray-50 rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-colors hover:border-gray-300">
              <summary className="flex items-center justify-between p-6 font-medium text-gray-900 list-none select-none">
                Como funcionam as correções?
                <span className="transition-transform group-open:rotate-180 text-gray-400">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-gray-600 px-6 pb-6 pt-0 leading-relaxed border-t border-gray-200/50 mt-2">
                <br/>Você envia sua redação (digitada ou foto) pela plataforma Facillit Write. Nossa IA faz uma pré-análise instantânea de gramática e estrutura, e depois nossos professores validam e comentam os pontos de argumentação detalhadamente.
              </div>
            </details>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}