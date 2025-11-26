"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';

// Tipo para os dados do formulário
type FormData = {
    fullName: string;
    email: string;
    password: string;
    pronoun: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
      fullName: '', email: '', password: '', pronoun: 'Ele/Dele',
      cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });
  
  const router = useRouter();
  const supabase = createClient();

  // Função para buscar endereço pelo CEP
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
      const cep = e.target.value.replace(/\D/g, '');
      if (cep.length !== 8) return;

      setCepLoading(true);
      try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();
          
          if (!data.erro) {
              setFormData(prev => ({
                  ...prev,
                  street: data.logradouro,
                  neighborhood: data.bairro,
                  city: data.localidade,
                  state: data.uf
              }));
          }
      } catch (err) {
          console.error("Erro ao buscar CEP", err);
      } finally {
          setCepLoading(false);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      // Máscara simples para CEP
      if (name === 'cep') {
          const masked = value.replace(/\D/g, '').substring(0, 8);
          setFormData(prev => ({ ...prev, [name]: masked }));
      } else {
          setFormData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { fullName, email, password, pronoun, cep, street, number, complement, neighborhood, city, state } = formData;

    if (!email || !password || !fullName || !cep || !number) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
    }

    // 1. Criação do utilizador no Supabase Auth
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    });

    if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
    }

    if (user) {
        // 2. Criação/Atualização do Perfil
        // AQUI ESTÁ A CORREÇÃO: Usamos .upsert() em vez de .insert()
        // Isso previne erros se o perfil já tiver sido criado por um trigger do banco de dados.
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: fullName,
            pronoun: pronoun,
            address_cep: cep,
            address_street: street,
            address_number: number,
            address_complement: complement,
            address_neighborhood: neighborhood,
            address_city: city,
            address_state: state,
            user_category: 'aluno', // Padrão para registo público
            has_completed_onboarding: false,
            updated_at: new Date().toISOString(),
        });

        if (profileError) {
            console.error("Erro ao salvar perfil:", profileError);
            // Mesmo com erro no perfil, o user foi criado, então tentamos redirecionar ou avisar
            setError("Conta criada, mas houve um erro ao salvar os detalhes do perfil. Tente fazer login.");
        } else {
            router.push('/login?registered=true');
        }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 font-inter">
      
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Lado Esquerdo: Banner/Info */}
        <div className="hidden md:flex w-1/3 bg-brand-purple text-white p-10 flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-brand-gradient opacity-90 z-0"></div>
             <div className="relative z-10">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6">
                     <i className="fas fa-user-plus text-2xl"></i>
                 </div>
                 <h2 className="text-3xl font-bold mb-4">Junte-se ao Facillit Hub</h2>
                 <p className="text-white/80 mb-6">Crie o seu Facillit Account para ter acesso a ferramentas que transformam o seu potencial em resultados reais.</p>
                 
                 <ul className="space-y-3 text-sm">
                     <li className="flex items-center gap-2"><i className="fas fa-check text-brand-green"></i> Correção de Redação IA</li>
                     <li className="flex items-center gap-2"><i className="fas fa-check text-brand-green"></i> Simulados Inteligentes</li>
                     <li className="flex items-center gap-2"><i className="fas fa-check text-brand-green"></i> Gestão de Tarefas</li>
                 </ul>
             </div>
             <div className="relative z-10 text-xs text-white/50 mt-8">
                 © 2025 Facillit Hub. Todos os direitos reservados.
             </div>
        </div>

        {/* Lado Direito: Formulário Completo */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Criar Conta</h1>
                <Link href="/login" className="text-sm text-brand-purple font-bold hover:underline">Já tenho conta</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Secção: Dados Pessoais */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-1">Dados de Acesso</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input type="text" name="fullName" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="Seu nome" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                <input type="email" name="email" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="seu@email.com" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe</label>
                                <input type="password" name="password" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" placeholder="Min. 8 caracteres" required minLength={8} />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Como quer ser tratado? (Pronome)</label>
                             <select name="pronoun" value={formData.pronoun} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none">
                                 <option value="Ele/Dele">Ele / Dele</option>
                                 <option value="Ela/Dela">Ela / Dela</option>
                                 <option value="Elu/Delu">Elu / Delu</option>
                                 <option value="Outro">Prefiro não informar</option>
                             </select>
                        </div>
                    </div>
                </div>

                {/* Secção: Endereço */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-1 mt-2">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="cep" 
                                    value={formData.cep} 
                                    onChange={handleChange} 
                                    onBlur={handleCepBlur} 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" 
                                    placeholder="00000000" 
                                    required 
                                    maxLength={8}
                                />
                                {cepLoading && <span className="absolute right-3 top-3 text-brand-purple"><i className="fas fa-spinner fa-spin"></i></span>}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
                            <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none text-gray-600" readOnly={!!formData.street} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                            <input type="text" name="number" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" required />
                        </div>
                         <div className="col-span-1 md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                            <input type="text" name="complement" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600" readOnly={!!formData.neighborhood} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600" readOnly={!!formData.city} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600" readOnly={!!formData.state} required />
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-brand-gradient text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-70"
                    >
                        {isLoading ? 'A criar a sua conta...' : 'Finalizar Registo'}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Ao criar conta, concorda com os nossos <Link href="/recursos/uso" className="underline">Termos de Uso</Link> e <Link href="/recursos/privacidade" className="underline">Política de Privacidade</Link>.
                    </p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}