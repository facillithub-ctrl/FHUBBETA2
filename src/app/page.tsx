import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Partners from '@/components/Partners';
import Features from '@/components/Features';
import Stats from '@/components/Stats';
import Modules from '@/components/Modules';
import Testimonials from '@/components/Testimonials';
import Faq from '@/components/Faq';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
// Importação do Banner da Campanha (Verifique se o caminho está correto)
import { CampaignBanner } from '@/components/campaign/CampaignBanner';

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Wrapper Principal - Fundo Claro */}
      <main className="relative bg-brand-light text-dark-text overflow-hidden selection:bg-brand-purple selection:text-white">
        
        {/* --- CAMADA DE FUNDO GLOBAL (Ambient Light) --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Grid Sutil Escuro */}
          <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-center opacity-[0.02] invert"></div>
          
          {/* Mancha Roxa Suave (Superior Direita) */}
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[100px]"></div>
          
          {/* Mancha Verde Suave (Inferior Esquerda) */}
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-green/10 rounded-full blur-[80px]"></div>
        </div>

        {/* --- SECÇÕES --- */}
        <div className="relative z-10 flex flex-col gap-0">
          <Hero />
          
          {/* DICA: Se quiser dar destaque máximo à campanha, mova o Banner para cá: */}
          {/* <div className="max-w-7xl mx-auto w-full px-6 -mt-10 mb-10 relative z-20"><CampaignBanner /></div> */}

          <Partners />
          <Features />
          <Stats />
          <Modules />
          <Testimonials />
          <Faq />
          <CallToAction />
          
          {/* Banner da Campanha (Posição atual: Final da página) */}
          <div className="py-10 bg-gradient-to-t from-white to-transparent">
             <div className="max-w-7xl mx-auto px-6">
                <CampaignBanner/>
             </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
