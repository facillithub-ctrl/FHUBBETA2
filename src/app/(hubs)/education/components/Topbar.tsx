'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, LogOut, HelpCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function EducationTopbar({ onMenuClick }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
      
      {/* Mobile Menu & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        {/* Placeholder breadcrumb */}
        <div className="hidden sm:flex items-center text-sm text-neutral-500">
          <span className="font-medium text-neutral-800">Education</span>
          <span className="mx-2">/</span>
          <span>Dashboard</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Search Bar */}
        <div className="hidden md:flex relative group">
          <input 
            type="text" 
            placeholder="O que você quer estudar?" 
            className="pl-10 pr-4 py-2 bg-neutral-100 border border-transparent group-hover:bg-white group-hover:border-neutral-200 rounded-full text-sm w-64 focus:w-80 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-blue-500 transition-colors" size={18} />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-neutral-200 mx-1 hidden md:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 rounded-full hover:bg-neutral-50 transition-all p-1 pr-2 border border-transparent hover:border-neutral-200"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
              E
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-neutral-800 leading-none">Estudante</p>
              <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide mt-0.5">Free Plan</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="px-4 py-3 border-b border-neutral-100 mb-2">
                <p className="text-sm font-bold text-neutral-900">Minha Conta</p>
                <p className="text-xs text-neutral-500 truncate">usuario@exemplo.com</p>
              </div>
              
              <Link 
                href="/account" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <User size={16} />
                Perfil e Preferências
              </Link>
              
              <Link 
                href="/recursos/ajuda" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <HelpCircle size={16} />
                Central de Ajuda
              </Link>

              <div className="h-px bg-neutral-100 my-2"></div>

              <Link 
                href="/logout" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Sair da conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}