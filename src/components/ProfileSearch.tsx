"use client";

import { useState, useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProfiles } from '@/app/(public)/u/[nickname]/actions'; // Importa a action criada
import { VerificationBadge } from '@/components/VerificationBadge';

interface SearchResult {
  id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  verification_badge: string | null;
  badge?: string | null; // Compatibilidade
}

export default function ProfileSearch({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // Foca no input ao abrir
        setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Executa busca com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        startTransition(async () => {
          const data = await searchProfiles(query);
          setResults(data as SearchResult[]);
        });
      } else {
        setResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectProfile = (nickname: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(`/u/${nickname}`);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão de Ativação */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-brand-purple transition-all"
        title="Buscar usuários"
      >
        <i className="fas fa-search text-lg"></i>
      </button>

      {/* Modal de Busca */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                ref={modalRef}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
            >
                {/* Header do Input */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <i className="fas fa-search text-gray-400"></i>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar estudantes, professores..."
                        className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-base"
                    />
                    {isPending && <i className="fas fa-spinner fa-spin text-brand-purple"></i>}
                    {!isPending && query && (
                        <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-times-circle"></i>
                        </button>
                    )}
                </div>

                {/* Lista de Resultados */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="py-2">
                            {results.map(user => (
                                <div 
                                    key={user.id}
                                    onClick={() => handleSelectProfile(user.nickname)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden flex-shrink-0 border border-gray-100">
                                        {user.avatar_url ? (
                                            <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100">
                                                {user.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            <p className="font-bold text-gray-900 text-sm truncate">{user.full_name}</p>
                                            <VerificationBadge badge={user.verification_badge || user.badge} size="4px" />
                                        </div>
                                        <p className="text-gray-500 text-xs truncate">@{user.nickname}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query.length >= 2 && !isPending ? (
                        <div className="p-8 text-center text-gray-400">
                            <i className="far fa-sad-tear text-2xl mb-2"></i>
                            <p className="text-sm">Nenhum usuário encontrado.</p>
                        </div>
                    ) : (
                        <div className="p-4 text-xs text-gray-400 font-medium uppercase tracking-wider text-center">
                            Digite para buscar
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}