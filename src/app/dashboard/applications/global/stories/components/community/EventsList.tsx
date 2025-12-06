"use client";

import Image from 'next/image';

export default function EventsList({ events }: { events: any[] }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-calendar-alt text-brand-purple"></i>
        Eventos da Comunidade
      </h3>

      {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum evento agendado.</p>
      ) : (
          <div className="space-y-4">
            {events.map(evt => (
                <div key={evt.id} className="flex gap-3 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-purple flex flex-col items-center justify-center font-bold border border-purple-100">
                        <span className="text-xs uppercase">{new Date(evt.start_time).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg leading-none">{new Date(evt.start_time).getDate()}</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-brand-purple transition-colors line-clamp-1">{evt.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                             <div className="relative w-4 h-4 rounded-full overflow-hidden bg-gray-200">
                                 {evt.host?.avatar_url && <Image src={evt.host.avatar_url} fill alt="Host" />}
                             </div>
                             <span className="text-xs text-gray-500">{evt.type === 'live' ? 'Live com' : 'Debate:'} {evt.host?.full_name}</span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );
}