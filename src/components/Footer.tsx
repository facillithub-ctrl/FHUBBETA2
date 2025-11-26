import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-brand-dark text-white pt-16 pb-8 border-t border-white/5 font-inter">
        <div className="container mx-auto px-6">
            
            {/* Topo: Marca e Descrição */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b border-white/10 pb-12">
                <div className="max-w-sm">
                    <Link href="/" className="flex items-center gap-3 mb-4">
                        <div className="relative w-10 h-10 brightness-0 invert">
                            <Image src="/assets/images/LOGO/png/logoazul.svg" alt="Facillit Hub" fill className="object-contain" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Facillit Hub</span>
                    </Link>
                    <p className="text-gray-400 text-sm">
                        O ecossistema digital inteligente que conecta educação, produtividade e negócios numa única plataforma.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    {/* Redes Sociais */}
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-purple flex items-center justify-center transition-all"><i className="fab fa-instagram"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-purple flex items-center justify-center transition-all"><i className="fab fa-linkedin-in"></i></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-purple flex items-center justify-center transition-all"><i className="fab fa-youtube"></i></a>
                </div>
            </div>

            {/* Links Legais (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                
                {/* Coluna 1 */}
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Avisos Legais</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/recursos/legal" className="hover:text-brand-green transition-colors">Avisos Legais Gerais</Link></li>
                        <li><Link href="/recursos/privacidade" className="hover:text-brand-green transition-colors">Política de Privacidade</Link></li>
                        <li><Link href="/recursos/uso" className="hover:text-brand-green transition-colors">Termos de Uso Facillit Hub</Link></li>
                    </ul>
                </div>

                {/* Coluna 2 */}
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Privacidade & Dados</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/recursos/privacidade-brasil" className="hover:text-brand-green transition-colors">Aviso de Direitos de Privacidade / Brasil</Link></li>
                        <li><Link href="/recursos/protecao-dados" className="hover:text-brand-green transition-colors">Proteção de Dados / Brasil</Link></li>
                        <li><Link href="/recursos/politica-cookies" className="hover:text-brand-green transition-colors">Política de Cookies</Link></li>
                    </ul>
                </div>

                {/* Coluna 3 */}
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Regulação</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/recursos/direitos-autorais" className="hover:text-brand-green transition-colors">Direitos Autorais na Plataforma</Link></li>
                        <li><Link href="/recursos/dados-modulos" className="hover:text-brand-green transition-colors">Políticas de Dados Específicas por Módulo</Link></li>
                        <li><Link href="/recursos/contrato-assinatura" className="hover:text-brand-green transition-colors">Contrato de Assinatura</Link></li>
                    </ul>
                </div>

                {/* Coluna 4 (Institucional/Contato) */}
                <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Institucional</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/recursos/sobre-nos" className="hover:text-brand-green transition-colors">Sobre Nós</Link></li>
                        <li><Link href="/recursos/carreiras" className="hover:text-brand-green transition-colors">Trabalhe Conosco</Link></li>
                        <li><Link href="/recursos/contato" className="hover:text-brand-green transition-colors">Fale Conosco</Link></li>
                    </ul>
                </div>
            </div>

            {/* Rodapé Inferior */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} Facillit Hub Tecnologia Ltda. Todos os direitos reservados.</p>
                <div className="flex gap-6">
                    <span>CNPJ: 00.000.000/0001-00</span>
                    <span>Feito com <i className="fas fa-bolt text-brand-purple mx-1"></i> por Facillit Team</span>
                </div>
            </div>
        </div>
    </footer>
  );
}