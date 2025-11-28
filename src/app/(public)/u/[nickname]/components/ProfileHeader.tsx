import Link from 'next/link';
import Image from 'next/image';

export default function ProfileHeader({ currentUser }: { currentUser: any }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo reduzida para o perfil */}
        <Link href="/" className="flex items-center gap-2 group">
           <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
             <Image src="/assets/images/LOGO/png/isologo.png" fill alt="Facillit" className="object-contain" />
           </div>
           <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white hidden sm:block">
             Facillit<span className="text-royal-blue">Hub</span> <span className="text-xs text-gray-400 font-normal bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-1">Profile</span>
           </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          {currentUser ? (
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 pl-1 pr-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 relative overflow-hidden border border-white dark:border-gray-700">
                 {currentUser.avatar_url ? (
                    <Image src={currentUser.avatar_url} fill alt="Eu" className="object-cover" />
                 ) : (
                    <span className="flex items-center justify-center h-full w-full text-xs font-bold text-gray-500">{currentUser.nickname?.[0]}</span>
                 )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                 Voltar ao Dashboard
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-royal-blue transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="text-sm font-bold px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}