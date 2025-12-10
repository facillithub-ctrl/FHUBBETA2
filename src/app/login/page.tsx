"use client";

import { useState } from 'react';
import Link from 'next/link';
import { login } from './actions';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  // Captura mensagens de erro via URL (se houver) ou estado local
  const searchParams = useSearchParams();
  const urlError = searchParams.get('message');
  const [error, setError] = useState<string | null>(urlError);
  
  const router = useRouter();

  // Função wrapper para lidar com a Server Action de Login
  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Chama a server action diretamente
      const result = await login(formData);
      
      // Se retornou erro (definido no actions.ts)
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } 
      // Se não houve erro, o redirect acontece no server side (actions.ts)
    } catch (e) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 font-inter">
      
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 min-h-[600px]">
        
        {/* Lado Esquerdo: Identidade Visual (Espelhando o Registro) */}
        <div className="hidden md:flex w-1/3 bg-brand-purple text-white p-10 flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-brand-gradient opacity-90 z-0"></div>
             
             {/* Elementos decorativos de fundo */}
             <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-brand-green opacity-20 rounded-full blur-2xl"></div>

             <div className="relative z-10 h-full flex flex-col">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-8 shadow-inner">
                    <span className="text-xl font-bold">FH</span>
                 </div>
                 
                 <div className="my-auto">
                    <h2 className="text-3xl font-bold mb-6 leading-tight">Bem-vindo de volta!</h2>
                    <p className="text-white/80 text-lg font-light leading-relaxed">
                        Acesse seu painel, continue seus estudos e conecte-se com o ecossistema Facillit.
                    </p>
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/10 text-xs text-white/50">
                     © 2025 Facillit Hub.
                 </div>
             </div>
        </div>

        {/* Lado Direito: Formulário de Login */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white relative">
            
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-bold text-gray-800">Acesse sua conta</h1>
                <Link 
                    href="/register" 
                    className="text-sm font-semibold text-brand-purple hover:text-purple-800 transition-colors"
                >
                    Criar nova conta
                </Link>
            </div>

            <form action={handleLogin} className="space-y-6 max-w-md mx-auto w-full">
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                            E-mail
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                placeholder="seu@email.com"
                                className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                                Palavra-passe
                            </label>
                            {/* Link de recuperação de senha (placeholder funcional) */}
                            <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-brand-purple transition-colors">
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                <i className="fas fa-lock"></i>
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                minLength={6}
                                className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fade-in-right">
                        <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-gradient hover:bg-brand-gradient-hover text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-purple/20 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                           <i className="fas fa-circle-notch fa-spin text-sm"></i>
                           <span>Entrando...</span>
                        </>
                    ) : (
                        'Entrar na Plataforma'
                    )}
                </button>
            </form>
            
            <div className="mt-10 text-center">
                <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-arrow-left text-xs"></i> Voltar para Home
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}