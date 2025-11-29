'use client';

export default function Ruler() {
  // Simula 21cm (A4)
  const ticks = Array.from({ length: 42 }, (_, i) => i);

  return (
    <div className="w-[210mm] h-8 bg-white/50 backdrop-blur border-b border-gray-200 mx-auto relative select-none flex mb-1 rounded-t-lg">
      {ticks.map((tick) => (
        <div key={tick} className="flex-1 relative group">
           {/* Marca Maior (cm) */}
          {tick % 2 === 0 && (
             <>
               <span className="absolute top-1 left-1 text-[9px] text-gray-400 font-mono group-hover:text-brand-purple transition-colors">
                 {tick / 2}
               </span>
               <div className="h-2.5 w-px bg-gray-300 absolute bottom-0 left-0 group-hover:bg-brand-purple" />
             </>
          )}
           {/* Marca Menor (0.5cm) */}
           <div className="h-1.5 w-px bg-gray-200 absolute bottom-0 left-1/2" />
        </div>
      ))}
    </div>
  );
}