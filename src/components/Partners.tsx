import Image from 'next/image';

export default function Partners() {
  // Lista de logos fictícios para exemplo
  const logos = [
    "Fundação_Bradesco_Logo.png", 
    "Amazon_Web_Services_Logo.svg.png", 
    "google-search-software-icon-vector-fast-intelligence-function_642872_wh1200.png",
    "logo-slogan-governo-federal-uniao-reconstrucao-alta-vetor-1-scaled.jpg"
  ];

  return (
    <section className="py-10 border-y border-gray-200 bg-white">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
          Tecnologia utilizada por instituições inovadoras
        </p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
           {logos.map((logo, index) => (
             <div key={index} className="relative h-8 w-32 hover:scale-110 transition-transform duration-300">
                <Image 
                    src={`/assets/images/LOGO/corp/${logo}`} 
                    alt="Parceiro" 
                    fill 
                    className="object-contain"
                />
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}