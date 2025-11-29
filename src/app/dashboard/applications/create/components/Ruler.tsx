'use client';

interface RulerProps {
    width: string; // ex: '210mm'
}

export default function Ruler({ width }: RulerProps) {
  // Converte a string de largura para um número aproximado de ticks (assumindo 1 tick a cada 5mm visualmente)
  // 210mm ~= 42 ticks de 5mm
  const numWidth = parseInt(width.replace('mm', ''));
  const tickCount = Math.floor(numWidth / 5); 
  
  const ticks = Array.from({ length: tickCount }, (_, i) => i);

  return (
    <div className="w-full h-full bg-white/50 backdrop-blur mx-auto relative select-none flex mb-1 opacity-60 hover:opacity-100 transition-opacity overflow-hidden">
      {ticks.map((tick) => (
        <div key={tick} className="flex-1 relative group border-l border-transparent hover:border-gray-300 flex items-end">
          {tick % 2 === 0 && (
             <>
               <span className="absolute top-0.5 left-1 text-[8px] text-gray-400 font-mono group-hover:text-brand-purple transition-colors">
                 {tick / 2} cm
               </span>
               <div className="h-2 w-px bg-gray-300 absolute bottom-0 left-0 group-hover:bg-brand-purple" />
             </>
          )}
           {tick % 2 !== 0 && <div className="h-1 w-px bg-gray-200 absolute bottom-0 left-0" />}
        </div>
      ))}
    </div>
  );
}