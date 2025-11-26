"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';

export default function RegisterPage() {
  // Estados Básicos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Novos Estados
  const [fullName, setFullName] = useState(''); // É bom pedir o nome no registo
  const [pronoun, setPronoun] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!pronoun) {
        setError("Por favor, selecione um pronome.");
        return;
    }
    
    setIsLoading(true);
    setError(null);

    // Enviar dados extras nos metadados
    const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
            full_name: fullName,
            pronoun: pronoun,
            address: address,
            zip_code: zipCode,
            // O trigger no banco deve mapear estes campos para a tabela profiles
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message === 'User already registered' ? 'Este e-mail já está em uso.' : signUpError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      setIsLoading(false);
      setSuccess(true);
    } else {
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };
  
  // Ecrã de Sucesso (Mantido simples mas no estilo novo)
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-lg text-center animate-fade-in-up">
          <div className="mx-auto bg-green-100 text-brand-green w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
            <i className="fas fa-check text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">Conta criada!</h1>
          <p className="text-text-muted mb-8 text-lg">
            Enviámos um e-mail de confirmação para <strong>{email}</strong>.
          </p>
          <Link 
            href="/login" 
            className="inline-block w-full py-4 px-8 bg-brand-gradient text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-purple/20 transition-all"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  // Ecrã de Registo (Split Screen)
  return (
    <div className="min-h-screen flex w-full bg-white">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto z-10">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center lg:text-left mb-8">
            <Link href="/" className="inline-block mb-4">
                 <Image src="/assets/images/LOGO/isologo/preto.png" alt="Logo" width={40} height={40} />
            </Link>
            <h1 className="text-3xl font-bold text-dark-text">Criar Facillit Account</h1>
            <p className="text-text-muted mt-1">Junte-se ao ecossistema de inovação.</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Nome Completo */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-user text-gray-400 group-focus-within:text-brand-purple"></i>
                </div>
                <input 
                    type="text" 
                    placeholder="Nome Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple outline-none transition-all"
                />
            </div>

            {/* Pronome e CEP (Lado a Lado) */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fas fa-venus-mars text-gray-400 group-focus-within:text-brand-purple"></i>
                    </div>
                    <select 
                        value={pronoun}
                        onChange={(e) => setPronoun(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple outline-none transition-all appearance-none text-gray-600"
                    >
                        <option value="" disabled>Pronome</option>
                        <option value="ele/dele">Ele/Dele</option>
                        <option value="ela/dela">Ela/Dela</option>
                        <option value="neutro">Neutro</option>
                    </select>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fas fa-map-marker-alt text-gray-400 group-focus-within:text-brand-purple"></i>
                    </div>
                    <input 
                        type="text" 
                        placeholder="CEP / Postal"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple outline-none transition-all"
                    />
                </div>
            </div>

             {/* Endereço */}
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-home text-gray-400 group-focus-within:text-brand-purple"></i>
                </div>
                <input 
                    type="text" 
                    placeholder="Endereço (Rua, Nº, Cidade)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple outline-none transition-all"
                />
            </div>

            {/* Email */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400 group-focus-within:text-brand-purple"></i>
                </div>
                <input 
                    type="email" 
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple outline-none transition-all"
                />
            </div>

            {/* Password */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400 group-focus-within:text-brand-purple"></i>
                </div>
                <input 
                    type="password" 
                    placeholder="Crie uma senha forte"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple outline-none transition-all"
                />
            </div>

            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-check-circle text-gray-400 group-focus-within:text-brand-purple"></i>
                </div>
                <input 
                    type="password" 
                    placeholder="Confirme a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple outline-none transition-all"
                />
            </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
          
          <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-4 px-6 rounded-xl bg-brand-gradient text-white font-bold text-lg shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isLoading ? 'A criar conta...' : 'Começar Agora'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
             <p className="text-sm text-text-muted">
                Já tem conta?{' '}
                <Link href="/login" className="font-bold text-brand-purple hover:underline">
                    Fazer Login
                </Link>
             </p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: DECORAÇÃO (Cópia simplificada do Login para consistência) */}
      <div className="hidden lg:flex w-1/2 bg-brand-dark relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-90"></div>
        {/* Elementos decorativos animados */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-white/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        
        <div className="relative z-10 text-center text-white p-12 max-w-lg">
             <Image src="/assets/images/LOGO/isologo/branco.png" alt="Icon" width={80} height={80} className="mx-auto mb-6 opacity-90" />
             <h2 className="text-4xl font-bold mb-4">Bem-vindo ao Futuro.</h2>
             <p className="text-white/70">
                Ao criar a sua conta, você desbloqueia o acesso a ferramentas de produtividade, educação e gestão de carreira. Tudo integrado.
             </p>
        </div>
      </div>
    </div>
  );
}