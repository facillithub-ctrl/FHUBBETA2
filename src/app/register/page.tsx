"use client"; // <--- CORRIGIDO (sem o '=')

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  /**
   * Função de registo (ETAPA 1 do seu plano) - SIMPLIFICADA
   * 1. Apenas cria o utilizador no 'auth.users'.
   * 2. Um Trigger no Supabase (que já existe) trata de criar
   * o "Perfil Mínimo" em 'public.profiles' automaticamente.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    // 1. Criar o utilizador no serviço de Autenticação (ETAPA 1)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    if (signUpError) {
      setError(signUpError.message === 'User already registered' ? 'Este e-mail já está em uso.' : signUpError.message);
      setIsLoading(false);
      return;
    }

    // 2. VERIFICAÇÃO DE SUCESSO
    // Se o 'signUp' funcionou e retornou um utilizador...
    if (authData.user) {
      // ... o Trigger já criou o perfil.
      // O 'has_completed_onboarding' já está 'false' por default no DB.
      // Não precisamos de fazer mais nada no 'profiles'.
      
      // 3. Sucesso!
      setIsLoading(false);
      setSuccess(true);
    } else {
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };
  
  // Ecrã de Sucesso
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-purple to-brand-green">
        <div className="w-full max-w-lg bg-bg-primary rounded-2xl shadow-2xl p-10 m-4 text-center">
          <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-check text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Conta criada com sucesso!</h1>
          <p className="text-text-secondary mb-6">
            Enviámos um e-mail de confirmação. Por favor, verifique a sua caixa de entrada para ativar a sua conta.
          </p>
          <Link 
            href="/login" 
            className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-brand-purple to-brand-green text-white rounded-xl font-bold inline-block"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  // Ecrã de Registo
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-purple to-brand-green">
      
      {/* Cartão de Autenticação Branco */}
      <div className="w-full max-w-lg bg-bg-primary rounded-2xl shadow-2xl p-10 m-4">
        
        {/* Cabeçalho do Cartão */}
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

        {/* Isologo "F" preto */}
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
          Novo por aqui?
        </h1>
        <p className="text-text-secondary mb-8 text-sm">
          Primeiro, vamos precisar de algumas informações para criar sua conta
        </p>
        
        {/* Formulário de Registo */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">E-mail</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Digite aqui um email de acesso..."
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
              placeholder="Crie uma senha..."
              className="w-full p-4 border border-gray-300 rounded-xl text-sm" 
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="sr-only">Repita a senha</label>
            <input 
              type="password" 
              name="confirmPassword" 
              id="confirmPassword" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              placeholder="Repita a sua senha..."
              className="w-full p-4 border border-gray-300 rounded-xl text-sm" 
            />
          </div>
          
          {error && (<p className="text-red-500 text-sm text-center">{error}</p>)}
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-brand-purple to-brand-green text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar conta'}
            </button>
          </div>
        </form>

        {/* Divisor */}
        <hr className="my-8 border-gray-300" />

        {/* Link de Login */}
        <div className="text-center">
          <Link href="/login" className="font-bold text-text-primary hover:text-brand-purple hover:underline">
            Acessar minha conta
          </Link>
        </div>

        {/* Rodapé do Cartão */}
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