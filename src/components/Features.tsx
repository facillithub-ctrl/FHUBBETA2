"use client";

const features = [
  { icon: "fa-sync", title: "Integração Fluida", text: "Dados que fluem automaticamente entre módulos, eliminando retrabalho e erros manuais." },
  { icon: "fa-chart-pie", title: "Analytics em Tempo Real", text: "Dashboards poderosos para diretores e professores acompanharem o desempenho instantaneamente." },
  { icon: "fa-mobile-alt", title: "Mobile First", text: "Acesso completo em qualquer dispositivo. Estude e gerencie sua escola na palma da mão." },
];

export default function Features() {
  return (
    <section className="py-24 bg-brand-light" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-dark-text mb-4">Por que escolher o Hub?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Uma infraestrutura robusta desenhada para escalar com o seu crescimento.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold text-dark-text mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}