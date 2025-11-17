"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createSupabaseClient from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      setIsLoading(false);
    } else {
      router.refresh();
      router.push('/dashboard');
    }
  };

  return (
    // Fundo em gradiente com as novas cores da marca
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-purple to-brand-green">
      
      {/* 1. Cartão mais largo (max-w-lg) e com mais padding (p-10) */}
      <div className="w-full max-w-lg bg-bg-primary rounded-2xl shadow-2xl p-10 m-4">
        
        {/* 2. Novo Cabeçalho do Cartão */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <Image 
            src="/assets/images/accont.svg" // Logo Facillit Account
            alt="Facillit Account Logo" 
            width={140} 
            height={30} 
          />
          <p className="text-xs text-text-secondary text-right">
            Para saber mais informações sobre o Facillit Account 
            <Link href="/recursos/ajuda" className="font-bold text-text-primary hover:underline ml-1">
              clique aqui
            </Link>
          </p>
        </div>

        {/* 3. Isologo "F" preto */}
        <div className="text-center my-8">
          <Image 
            src="/assets/images/LOGO/isologo/preto.png" 
            alt="Facillit Hub Isologo" 
            width={40} 
            height={40} 
            className="mx-auto"
          />
        </div>
        
        {/* Títulos */}
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Digite o seu e-mail e senha para continuar
        </h1>
        <p className="text-text-secondary mb-8 text-sm">
          Entre no FacillitHub com a sua conta Facillit Account. Se você não tiver conta, precisará criar uma.
        </p>
        
        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">E-mail</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Digite seu E-mail..."
              // 4. Inputs mais largos e arredondados
              className="w-full p-4 border border-gray-300 rounded-xl text-sm" 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="sr-only">Senha</label>
            <input 
              type="password" 
              name="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Digite sua senha"
              // 4. Inputs mais largos e arredondados
              className="w-full p-4 border border-gray-300 rounded-xl text-sm" 
            />
          </div>
          
          {error && (<p className="text-red-500 text-sm text-center">{error}</p>)}
          
          {/* 5. Linha do Botão e "Esqueci minha senha" */}
          <div className="flex justify-between items-center pt-2">
            <Link href="#" className="text-sm font-medium text-brand-purple hover:underline">
              Esqueci minha senha
            </Link>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              // 4. Botão arredondado e com padding
              className="py-3 px-8 bg-gradient-to-r from-brand-purple to-brand-green text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        {/* 6. Divisor */}
        <hr className="my-8 border-gray-300" />

        {/* 7. Link de Registo */}
        <div className="text-center">
          <Link href="/register" className="font-bold text-text-primary hover:text-brand-purple hover:underline">
            Criar uma conta
          </Link>
        </div>

        {/* 8. Rodapé do Cartão com o texto exato */}
        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-xs text-text-secondary text-center font-medium">
            A Facillit Account faz parte do nosso ecossistema de soluções integradas.
          </p>
          <p className="text-xs text-text-secondary text-center mt-3">
            Com a Facillit Account, você acessa serviços e experiências oferecidas pela nossa plataforma, reunindo funcionalidades, integrações e recursos pensados para facilitar a gestão e otimizar o seu dia a dia — tudo em um só lugar.
          </p>
        </div>
      </div>
    </div>
  );
}