import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="bg-brand-purple rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          
          {/* Circles BG */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-green/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Pronto para transformar sua rotina?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de estudantes e profissionais que já estão usando o Facillit Hub para alcançar mais.
            </p>
            <Link 
              href="/register" 
              className="inline-block bg-white text-brand-purple px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-green hover:text-brand-dark transition-all duration-300 shadow-lg transform hover:-translate-y-1"
            >
              Criar Conta Gratuita
            </Link>
            <p className="mt-6 text-sm text-white/50">Sem cartão de crédito necessário • Plano gratuito para sempre</p>
          </div>
        </div>
      </div>
    </section>
  );
}