import Link from 'next/link'
import { login, signup } from './actions' // Importa as ações que criamos acima
import { SubmitButton } from '@/components/submit-button' // Se tiveres um componente de botão, senão use um normal

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
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
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar
      </Link>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Entrar no Ecossistema</h1>
          <p className="text-sm text-neutral-500">
            Digite suas credenciais para acessar os Hubs Educacional e Global.
          </p>
        </div>
        
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="voce@exemplo.com"
          required
        />
        
        <label className="text-md" htmlFor="password">
          Senha
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <button
          formAction={login}
          className="bg-blue-600 rounded-md px-4 py-2 text-foreground mb-2 hover:bg-blue-700 transition-colors text-white font-medium"
        >
          Entrar
        </button>
        
        <button
          formAction={signup}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2 hover:bg-foreground/5 transition-colors"
        >
          Criar conta
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-md">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}