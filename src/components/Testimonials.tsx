import Image from 'next/image';

const testimonialsData = [
  { name: 'João Silva', role: 'Estudante', text: 'O Facillit Hub transformou a maneira como organizo meus estudos. Tudo em um só lugar!', img: '1' },
  { name: 'Maria Oliveira', role: 'Diretora', text: 'A facilidade de gestão escolar com o módulo Edu é incomparável. Economizamos horas por semana.', img: '2' },
  { name: 'Carlos Souza', role: 'Empresário', text: 'Centralizar a comunicação e tarefas da empresa no Hub aumentou nossa produtividade em 30%.', img: '3' },
  { name: 'Ana Pereira', role: 'Vestibulanda', text: 'Os simulados e a correção de redação foram essenciais para minha aprovação.', img: '4' },
];

const TestimonialCard = ({ name, role, text, img }: any) => (
  <div className="w-[350px] flex-shrink-0 bg-white border border-gray-100 p-8 rounded-2xl mx-4 shadow-md">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-green p-0.5">
         <Image src={`https://i.pravatar.cc/150?img=${img}`} alt={name} width={48} height={48} className="rounded-full" />
      </div>
      <div>
        <strong className="block text-dark-text font-bold">{name}</strong>
        <span className="text-xs text-brand-purple font-semibold">{role}</span>
      </div>
    </div>
    {/* CORREÇÃO: Usando &quot; para aspas seguras */}
    <p className="text-gray-600 text-sm italic leading-relaxed">&quot;{text}&quot;</p>
  </div>
);

export default function Testimonials() {
  return (
    <section className="py-24 overflow-hidden bg-brand-light">
      <div className="container mx-auto text-center mb-12">
        <h2 className="text-3xl font-black text-dark-text">Quem usa, recomenda</h2>
      </div>
      
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-brand-light to-transparent z-20"></div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-brand-light to-transparent z-20"></div>

        <div className="flex w-max animate-[scroll_40s_linear_infinite] hover:pause py-4">
          {[...testimonialsData, ...testimonialsData, ...testimonialsData].map((item, idx) => (
            <TestimonialCard key={idx} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
} 