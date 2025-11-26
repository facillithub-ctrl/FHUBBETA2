"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-6xl">
            
            {/* Card Principal: Estilo Glass/Clean */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
                
                {/* Lado Esquerdo: Identidade Visual & Info */}
                <div className="lg:w-5/12 bg-brand-gradient text-white p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Background Decorativo */}
                    <div className="absolute inset-0 bg-brand-gradient opacity-10 z-0"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-purple rounded-full blur-[80px] opacity-40"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider mb-6 text-brand-green">
                            Fale Conosco
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                            Vamos construir algo <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-white">incrível</span>.
                        </h1>
                        <p className="text-white/70 mb-12 text-lg font-light">
                            Seja para tirar dúvidas, fechar parcerias ou resolver problemas técnicos, a nossa equipa está pronta para ouvir.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-5 group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-green group-hover:text-brand-dark transition-all duration-300">
                                    <i className="fas fa-envelope text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Email</h3>
                                    <p className="text-white/50 text-sm mb-1">Geral</p>
                                    <a href="mailto:contato@facillithub.com" className="text-white hover:text-brand-green transition-colors font-medium">contato@facillithub.com</a>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-5 group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-green group-hover:text-brand-dark transition-all duration-300">
                                    <i className="fas fa-building text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Sede</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        Av. Paulista, 1000 - Bela Vista<br/>
                                        São Paulo - SP, Brasil
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Siga-nos</h4>
                        <div className="flex gap-3">
                            <SocialButton icon="instagram" />
                            <SocialButton icon="linkedin-in" />
                            <SocialButton icon="youtube" />
                            <SocialButton icon="twitter" />
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Formulário Clean */}
                <div className="flex-1 p-8 md:p-16 bg-white flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Envie uma mensagem</h2>
                    
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Nome Completo" placeholder="Seu nome" type="text" />
                            <InputGroup label="E-mail Corporativo ou Pessoal" placeholder="seu@email.com" type="email" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Departamento</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <RadioOption id="suporte" label="Suporte" name="dept" defaultChecked />
                                <RadioOption id="vendas" label="Vendas" name="dept" />
                                <RadioOption id="parceria" label="Parceria" name="dept" />
                                <RadioOption id="outro" label="Outro" name="dept" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem</label>
                            <textarea 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none h-40 resize-none transition-all text-gray-700" 
                                placeholder="Conte-nos como podemos ajudar..."
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full py-4 bg-brand-dark text-white font-bold text-lg rounded-xl hover:bg-brand-purple hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                Enviar Mensagem
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                Ao enviar, você concorda com a nossa <a href="/recursos/privacidade" className="underline hover:text-brand-purple">Política de Privacidade</a>.
                            </p>
                        </div>
                    </form>
                </div>

            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- Componentes Menores para Organização ---

const InputGroup = ({ label, placeholder, type }: { label: string, placeholder: string, type: string }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        <input 
            type={type} 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all text-gray-700 placeholder:text-gray-400" 
            placeholder={placeholder} 
        />
    </div>
);

const RadioOption = ({ id, label, name, defaultChecked }: { id: string, label: string, name: string, defaultChecked?: boolean }) => (
    <div className="relative">
        <input type="radio" id={id} name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <label 
            htmlFor={id} 
            className="block text-center py-3 px-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-50 peer-checked:border-brand-purple peer-checked:bg-brand-purple/5 peer-checked:text-brand-purple transition-all"
        >
            {label}
        </label>
    </div>
);

const SocialButton = ({ icon }: { icon: string }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-green hover:text-brand-dark transition-all duration-300">
        <i className={`fab fa-${icon}`}></i>
    </a>
);