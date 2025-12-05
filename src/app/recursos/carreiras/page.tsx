"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  ShieldCheck, Rocket, Users, AlertTriangle, CheckCircle2, 
  BadgeCheck, TrendingUp, Briefcase, ScrollText, MousePointerClick, 
  Ban, Scale, GraduationCap, Globe2, Sparkles, Zap, Layout, Send, Loader2
} from 'lucide-react';

export default function AmbassadorPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    socialHandle: '',
    portfolioLink: '',
    niche: 'educacao'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulação de envio para API
    // Na prática, aqui você faria um fetch('/api/ambassadors', { body: formData })
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    alert("Inscrição enviada com sucesso! Entraremos em contato pelo e-mail comercial@facillithub.com.br.");
    setFormData({ fullName: '', email: '', phone: '', socialHandle: '', portfolioLink: '', niche: 'educacao' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-32 pb-20">
        
        {/* --- HERO SECTION --- */}
        <section className="relative container mx-auto px-6 text-center mb-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-brand-purple/20 text-brand-purple text-xs font-bold uppercase tracking-wider mb-8 shadow-sm animate-fade-in-right">
                <Rocket size={14} />
                Programa Oficial Beta 1.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight animate-fade-in-right" style={{ animationDelay: '100ms' }}>
                Torne-se a Voz do <br />
                <span className="text-transparent bg-clip-text bg-brand-gradient">Ecossistema Facillit</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-right" style={{ animationDelay: '200ms' }}>
                Focado exclusivamente em <strong>Educação</strong> e <strong>Produtividade Global</strong>. Junte-se à revolução que transforma a jornada digital.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-right" style={{ animationDelay: '300ms' }}>
                <a href="#inscricao" className="group px-8 py-4 bg-brand-gradient text-white font-bold text-lg rounded-full hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
                    <ScrollText size={20} className="group-hover:rotate-12 transition-transform" />
                    Quero me Inscrever
                </a>
            </div>
        </section>

        {/* --- O CONCEITO: POWER USER --- */}
        <section className="container mx-auto px-6 mb-24">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-brand-purple/5 border border-gray-100 relative overflow-hidden group">
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-purple/10 rounded-[2.5rem] transition-colors pointer-events-none"></div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            O que é ser um <span className="text-brand-purple">Power User</span>?
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed text-justify">
                            Você não vende uma ferramenta; você demonstra uma <strong>jornada de transformação</strong> nas verticais de Educação e Produtividade.
                        </p>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                <div className="mt-1 bg-brand-green/10 p-2 rounded-lg text-brand-green h-fit"><CheckCircle2 size={20} /></div>
                                <div>
                                    <strong className="block text-gray-900 mb-1">Prova Social de Uso</strong>
                                    <p className="text-sm text-gray-600">Conteúdo real: "Como organizo minha semana" ou "Estudando para o exame".</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="order-1 lg:order-2 bg-gradient-to-br from-brand-light to-white rounded-3xl p-10 border border-gray-200 shadow-inner">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-brand-purple text-white rounded-xl shadow-lg shadow-brand-purple/20">
                                <Briefcase size={24} />
                            </div>
                            <h3 className="font-bold text-2xl text-gray-900">Perfil Desejado</h3>
                        </div>
                        <ul className="space-y-4">
                            {["Foco em Educação ou Produtividade", "Criação de Tutoriais e Vlogs", "Pessoa Jurídica (B2B)", "Compliance CVM e CONAR"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                    <div className="w-2 h-2 rounded-full bg-brand-green shrink-0"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* --- VERTICAIS E MÓDULOS (Apenas Global e Education) --- */}
        <section className="bg-white py-24 border-y border-gray-100">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Suas Ferramentas de Trabalho</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Conheça os módulos das verticais B2C que você irá utilizar e promover.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Vertical Global */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe2 className="text-brand-green" size={32} />
                            <h3 className="text-2xl font-bold text-gray-900">Facillit Global</h3>
                        </div>
                        <p className="text-gray-600 mb-6">Foco: Produtividade, organização e lifestyle.</p>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Stories - Destaque */}
                            <Link href="/modulos/facillit-stories" className="sm:col-span-2 group relative p-6 rounded-2xl bg-gradient-to-r from-brand-purple/5 via-white to-brand-green/5 hover:from-brand-purple/10 hover:to-brand-green/10 transition-all duration-300 border border-brand-purple/20 hover:border-brand-purple/40 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-4 right-4 bg-brand-purple text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wide">
                                    <Sparkles size={10} /> Destaque
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm text-brand-purple group-hover:scale-110 transition-transform">
                                        <Layout size={28} />
                                    </div>
                                    <div>
                                        <strong className="block text-xl mb-1 text-gray-900 group-hover:text-brand-purple transition-colors">Facillit Stories</strong>
                                        <p className="text-sm text-gray-600 leading-snug max-w-md">
                                            A ferramenta central para conectar sua audiência. Compartilhe rotina e lifestyle.
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/modulos/facillit-day" className="group p-5 rounded-xl bg-gray-50 hover:bg-brand-green hover:text-white transition-all duration-300 border border-gray-100 hover:shadow-lg">
                                <strong className="block text-lg mb-1 flex items-center gap-2"><Zap size={18} /> Facillit Day</strong>
                                <span className="text-sm opacity-70 group-hover:opacity-100">Agenda Inteligente</span>
                            </Link>
                            <Link href="/modulos/facillit-connect" className="group p-5 rounded-xl bg-gray-50 hover:bg-brand-green hover:text-white transition-all duration-300 border border-gray-100 hover:shadow-lg">
                                <strong className="block text-lg mb-1 flex items-center gap-2"><Users size={18} /> Facillit Connect</strong>
                                <span className="text-sm opacity-70 group-hover:opacity-100">Networking</span>
                            </Link>
                        </div>
                    </div>

                    {/* Vertical Education */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <GraduationCap className="text-brand-purple" size={32} />
                            <h3 className="text-2xl font-bold text-gray-900">Facillit for Education</h3>
                        </div>
                        <p className="text-gray-600 mb-6">Foco: Estudos, vestibular e desenvolvimento.</p>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Link href="/modulos/facillit-write" className="group p-5 rounded-xl bg-gray-50 hover:bg-brand-purple hover:text-white transition-all duration-300 border border-gray-100 hover:shadow-lg">
                                <strong className="block text-lg mb-1">Facillit Write</strong>
                                <span className="text-sm opacity-70 group-hover:opacity-100">Redação IA</span>
                            </Link>
                            <Link href="/modulos/facillit-library" className="group p-5 rounded-xl bg-gray-50 hover:bg-brand-purple hover:text-white transition-all duration-300 border border-gray-100 hover:shadow-lg">
                                <strong className="block text-lg mb-1">Facillit Library</strong>
                                <span className="text-sm opacity-70 group-hover:opacity-100">Gestão de Conteúdo</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- BENEFÍCIOS --- */}
        <section className="container mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center mb-4"><BadgeCheck /></div>
                <h3 className="font-bold text-lg mb-2">Selo de Verificado</h3>
                <p className="text-gray-600 text-sm">Badge oficial de "Embaixador".</p>
              </div>
              <div className="p-8 rounded-3xl bg-white shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center mb-4"><TrendingUp /></div>
                <h3 className="font-bold text-lg mb-2">Comissões</h3>
                <p className="text-gray-600 text-sm">CPA e RevShare agressivo.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Users /></div>
                <h3 className="font-bold text-lg mb-2">Acesso Enterprise</h3>
                <p className="text-gray-600 text-sm">Conta Full gratuita para uso.</p>
              </div>
            </div>
        </section>

        {/* --- COMPLIANCE --- */}
        <section className="container mx-auto px-6 mb-20">
          <div className="bg-yellow-50 border border-yellow-200 rounded-[2rem] p-8 md:p-12">
             <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="text-yellow-600" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">Compliance e Brand Safety</h3>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/60 p-5 rounded-xl border border-yellow-100">
                    <strong className="block text-brand-purple mb-2">Education (Menores)</strong>
                    <p className="text-sm text-gray-600">Respeito ao ECA/CONAR. Vedado imperativos de consumo direto.</p>
                </div>
                <div className="bg-white/60 p-5 rounded-xl border border-yellow-100">
                    <strong className="block text-brand-green mb-2">Global (Finanças)</strong>
                    <p className="text-sm text-gray-600">Conforme CVM/ANBIMA. Vedada recomendação de investimento.</p>
                </div>
             </div>
          </div>
        </section>

        {/* --- FORMULÁRIO DE INSCRIÇÃO --- */}
        <section id="inscricao" className="container mx-auto px-6 max-w-4xl mb-24">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-brand-dark p-8 md:p-10 text-white text-center">
                <h2 className="text-3xl font-bold mb-2">Inscreva-se no Programa</h2>
                <p className="opacity-80">Preencha seus dados para análise do time de parcerias.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                {/* Dados Pessoais */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Users size={18} className="text-brand-purple"/> Dados Pessoais
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                            <input 
                                required 
                                type="text" 
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Seu nome oficial" 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">E-mail Profissional</label>
                            <input 
                                required 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="contato@voce.com" 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                            <input 
                                required 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000" 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Informações Profissionais */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Rocket size={18} className="text-brand-green"/> Perfil Profissional
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Principal Rede Social (@)</label>
                            <input 
                                required 
                                type="text" 
                                name="socialHandle"
                                value={formData.socialHandle}
                                onChange={handleChange}
                                placeholder="@seuusuario (Insta/TikTok)" 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Link do Mídia Kit / Portfólio</label>
                            <input 
                                type="url" 
                                name="portfolioLink"
                                value={formData.portfolioLink}
                                onChange={handleChange}
                                placeholder="https://" 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Foco de Atuação</label>
                            <select 
                                name="niche"
                                value={formData.niche}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none bg-white"
                            >
                                <option value="educacao">Educação / Estudos</option>
                                <option value="produtividade">Produtividade / Lifestyle</option>
                                <option value="ambos">Ambos</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Botão de Envio */}
                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-4 bg-brand-gradient text-white font-bold text-lg rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <> <Loader2 className="animate-spin" /> Enviando... </>
                        ) : (
                            <> <Send size={20} /> Enviar Candidatura </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                        Ao enviar, você concorda que seus dados serão processados para fins de seleção. 
                        Dúvidas? Contate <a href="mailto:comercial@facillithub.com.br" className="text-brand-purple hover:underline">comercial@facillithub.com.br</a>
                    </p>
                </div>
            </form>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}