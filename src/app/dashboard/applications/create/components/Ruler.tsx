'use client';

export default function Ruler() {
  const ticks = Array.from({ length: 42 }, (_, i) => i);
  return (
    <div className="w-[210mm] h-6 bg-white/50 backdrop-blur border-b border-gray-200 mx-auto relative select-none flex mb-1 rounded-t-lg opacity-60 hover:opacity-100 transition-opacity">
      {ticks.map((tick) => (
        <div key={tick} className="flex-1 relative group border-l border-transparent hover:border-gray-300">
          {tick % 2 === 0 && (
             <>
               <span className="absolute top-0.5 left-1 text-[8px] text-gray-400 font-mono group-hover:text-brand-purple transition-colors">
                 {tick / 2}
               </span>
               <div className="h-2 w-px bg-gray-300 absolute bottom-0 left-0 group-hover:bg-brand-purple" />
             </>
          )}
           <div className="h-1 w-px bg-gray-200 absolute bottom-0 left-1/2" />
        </div>
      ))}
    </div>
  );
}