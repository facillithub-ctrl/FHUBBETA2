"use client";
import Image from 'next/image';

export default function RankingWidget({ readers }: { readers: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-trophy text-yellow-500"></i>
        Top Leitores
      </h3>

      <div className="space-y-3">
        {readers.map((r, index) => (
            <div key={index} className="flex items-center gap-3">
                <span className={`w-5 text-center font-bold text-sm ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                    #{index + 1}
                </span>
                <div className="relative w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                    {r.user?.avatar_url && <Image src={r.user.avatar_url} fill alt={r.user.nickname} className="object-cover" />}
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{r.user?.full_name}</p>
                    <p className="text-[10px] text-gray-400">{r.total_books_read} livros lidos</p>
                </div>
                {r.reading_streak > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                        <i className="fas fa-fire"></i> {r.reading_streak}
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
}