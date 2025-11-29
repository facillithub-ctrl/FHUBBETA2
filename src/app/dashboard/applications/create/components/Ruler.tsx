'use client';

export default function Ruler() {
  // Simulação de régua em cm/mm para largura A4 (210mm)
  // Aproximadamente 800px de largura de visualização
  const ticks = Array.from({ length: 42 }, (_, i) => i); // Marcas a cada 5mm visual

  return (
    <div className="w-[210mm] h-6 bg-gray-100 border-b border-gray-300 mx-auto relative select-none flex">
      {ticks.map((tick) => (
        <div 
          key={tick} 
          className="flex-1 border-l border-gray-400 h-full relative"
        >
          {tick % 2 === 0 && (
             <>
               <span className="absolute top-0 left-1 text-[8px] text-gray-500 font-mono">
                 {tick / 2}
               </span>
               <div className="h-2 w-px bg-gray-400 absolute bottom-0 left-0" />
             </>
          )}
           <div className="h-1 w-px bg-gray-300 absolute bottom-0 left-1/2" />
        </div>
      ))}
    </div>
  );
}