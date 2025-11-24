import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // Classe w-full garante largura total.
    <footer className="w-full bg-[#050507] text-gray-400 text-sm border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
               <div className="relative w-8 h-8">
                  <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub" fill className="object-contain brightness-0 invert" />
               </div>
               <span className="text-2xl font-bold text-white">Facillit Hub</span>
            </div>
            <p className="text-gray-500 leading-relaxed max-w-sm">
              O sistema operacional completo para o futuro da educação e do trabalho.
            </p>
          </div>

          {/* Links - Education */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Educação</h4>
            <ul className="space-y-3">
              <li><Link href="/modulos/facillit-write" className="hover:text-brand-green transition-colors">Redação</Link></li>
              <li><Link href="/modulos/facillit-test" className="hover:text-brand-green transition-colors">Simulados</Link></li>
              <li><Link href="/modulos/facillit-games" className="hover:text-brand-green transition-colors">Games</Link></li>
            </ul>
          </div>

          {/* Links - Institucional */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Institucional</h4>
            <ul className="space-y-3">
              <li><Link href="/recursos/sobre-nos" className="hover:text-brand-green transition-colors">Sobre Nós</Link></li>
              <li><Link href="/recursos/contato" className="hover:text-brand-green transition-colors">Contato</Link></li>
              <li><Link href="/recursos/carreiras" className="hover:text-brand-green transition-colors">Carreiras</Link></li>
            </ul>
          </div>

          {/* Links - Legal (CORRIGIDOS) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/recursos/uso" className="hover:text-brand-green transition-colors">Termos de Uso</Link></li>
              <li><Link href="/recursos/privacidade" className="hover:text-brand-green transition-colors">Privacidade</Link></li>
              <li><Link href="/recursos/politica-de-dado" className="hover:text-brand-green transition-colors">Dados</Link></li>
              <li><Link href="/recursos/direito-autoral" className="hover:text-brand-green transition-colors">Direitos Autorais</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>&copy; {currentYear} Facillit Hub Tecnologia e Educação Ltda.</p>
          <div className="flex items-center gap-6">
             <span>Feito com <i className="fas fa-heart text-red-600 mx-1"></i> em São Paulo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}