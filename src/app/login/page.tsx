"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Credenciais inválidas. Verifique o seu e-mail e palavra-passe.');
      setIsLoading(false);
    } else {
      router.refresh();
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 font-inter">
      
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 min-h-[600px]">
        
        {/* Lado Esquerdo: Info/Logo (Visualmente igual ao Register, mas com o logo Account) */}
        <div className="hidden md:flex w-1/3 bg-brand-purple text-white p-10 flex-col justify-between relative overflow-hidden">
           {/* Gradiente de fundo para dar profundidade */}
           <div className="absolute inset-0 bg-gradient-to-br from-brand-purple to-brand-green opacity-90 z-0"></div>
           
           <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
               <div className="relative w-40 h-40 mb-6">
                   {/* Logo Facillit Account */}
                   <Image 
                       src="/assets/images/accont.svg" 
                       alt="Facillit Account" 
                       fill
                       className="object-contain brightness-0 invert" 
                   />
               </div>
               <h2 className="text-3xl font-bold mb-2">Facillit Account</h2>
               <p className="text-white/80 text-sm">O seu acesso universal a todo o ecossistema.</p>
           </div>
           
           <div className="relative z-10 text-xs text-white/30 text-center">© 2025 Facillit Hub</div>
        </div>

        {/* Lado Direito: Formulário (Limpo e Coerente) */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <Link href="/" className="text-xs font-bold text-gray-400 hover:text-brand-purple transition-colors flex items-center gap-2 mb-6 uppercase tracking-wide">
                <i className="fas fa-arrow-left"></i> Voltar ao Site
              </Link>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta</h1>
              <p className="text-gray-500">Insira os seus dados para aceder.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-gray-700">Palavra-passe</label>
                  <Link href="#" className="text-xs text-brand-purple font-bold hover:underline">Esqueceu-se?</Link>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-brand-gradient text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-70"
              >
                {isLoading ? 'A autenticar...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm mb-4">Ainda não tem conta?</p>
              <Link href="/register" className="block w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:border-brand-purple hover:text-brand-purple transition-all text-center">
                Criar Conta Gratuita
              </Link>
               <div className="mt-4">
                  <Link href="/login/institucional" className="text-xs text-gray-400 hover:text-brand-green transition-colors flex items-center justify-center gap-1">
                      <i className="fas fa-university"></i> Acesso Institucional
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}