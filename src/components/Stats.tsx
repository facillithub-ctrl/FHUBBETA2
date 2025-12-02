export default function Stats() {
  return (
    <section className="py-20 bg-brand-purple text-white relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/assets/grid.svg')]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2">xxx+</div>
            <div className="text-sm md:text-base opacity-80">Alunos Conectados</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2">x+</div>
            <div className="text-sm md:text-base opacity-80">Escolas Parceiras</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2">x+</div>
            <div className="text-sm md:text-base opacity-80">Atividades Realizadas</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2">xx%</div>
            <div className="text-sm md:text-base opacity-80">Taxa de Aprovação</div>
          </div>
        </div>
      </div>
    </section>
  );
}