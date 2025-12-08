import Link from 'next/link';
import { login, signup } from './actions';
import Image from 'next/image';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen w-full flex bg-neutral-50">
      
      {/* Lado Esquerdo: Identidade Visual / Decorativo (Opcional, similar ao Register) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-violet-700 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/images/pattern.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 text-center text-white p-12">
          <div className="mb-6 flex justify-center">
             {/* Logo ou Mascote aqui se tiver */}
             <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <span className="text-4xl">FH</span>
             </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">Bem-vindo de volta!</h2>
          <p className="text-blue-100 text-lg max-w-md mx-auto">
            Acesse seu hub de aprendizado, conecte-se com histórias globais e gerencie sua carreira.
          </p>
        </div>
        {/* Círculos decorativos */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-24 right-24 w-32 h-32 bg-violet-400 rounded-full blur-2xl opacity-40"></div>
      </div>

      {/* Lado Direito: Formulário (Card Clean) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <Link
          href="/"
          className="absolute left-8 top-8 py-2 px-4 rounded-full text-neutral-600 hover:bg-neutral-100 flex items-center text-sm font-medium transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar para Home
        </Link>

        {/* Card de Login */}
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-neutral-100">
          <div className="flex flex-col gap-2 mb-8 text-center">
            <h1 className="text-3xl font-bold text-neutral-900">Entrar</h1>
            <p className="text-neutral-500">
              Digite suas credenciais para acessar o ecossistema.
            </p>
          </div>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-neutral-700 ml-1" htmlFor="email">
                Email
                </label>
                <input
                className="rounded-xl px-4 py-3 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                name="email"
                placeholder="seu@email.com"
                required
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-neutral-700 ml-1" htmlFor="password">
                Senha
                </label>
                <input
                className="rounded-xl px-4 py-3 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                />
            </div>

            <button
              formAction={login}
              className="mt-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
            >
              Acessar Plataforma
            </button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">ou</span>
                </div>
            </div>
            
            <button
              formAction={signup}
              className="border border-neutral-200 bg-white text-neutral-700 font-medium py-3 px-4 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
            >
              Criar nova conta
            </button>

            {searchParams?.message && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm text-center rounded-xl">
                {searchParams.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}