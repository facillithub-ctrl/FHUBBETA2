/* eslint-disable @next/next/no-img-element */
"use client";

import { UserProfile } from '@/app/dashboard/types';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Adapte esta interface conforme os dados reais da sua redação
export interface WriteShareStats {
    score: number;       // Nota da redação
    title: string;       // Título ou Tema
    essayDate?: string;  // Data de envio
    competency1?: number; // Exemplo de detalhe opcional
}

export type CardTheme = 'light';

interface WriteShareCardProps {
    profile: UserProfile;
    stats: WriteShareStats;
    innerRef: RefObject<HTMLDivElement>;
    avatarOverride?: string | null;
    logoOverride?: string | null;
    isExporting?: boolean;
    theme?: CardTheme;
    showAvatar?: boolean;
}

const BRAND = {
    purple: '#42047e',
    green: '#07f49e',
    dark: '#0f0f11',
    light: '#ffffff',
    gray: '#f4f4f5',
    gradient: 'linear-gradient(135deg, #42047e 0%, #07f49e 100%)'
};

const VerifiedBadge = () => (
    <div className="flex items-center justify-center w-6 h-6 ml-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={BRAND.green} />
            <path d="M7.5 12L10.5 15L16.5 9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
);

export const WriteShareCard = ({ 
    profile, 
    stats, 
    innerRef, 
    avatarOverride, 
    logoOverride, 
    isExporting = false,
    showAvatar = true
}: WriteShareCardProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    // Link direto para validar a redação ou perfil
    const shareUrl = `${baseUrl}/u/${profile.nickname}`;

    const safeAvatar = avatarOverride || (isExporting ? null : profile.avatar_url);
    const safeLogo = logoOverride || (isExporting ? null : "/assets/images/accont.svg");

    return (
        <div
            ref={innerRef}
            className="w-[540px] h-[960px] flex flex-col items-center relative overflow-hidden font-sans box-border bg-white"
        >
            {/* 1. BARRA DE GRADIENTE */}
            <div className="w-full h-5" style={{ background: BRAND.gradient }}></div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 flex flex-col items-center w-full px-10 pt-10 pb-10">
                
                {/* 2. LOGO */}
                <div className="mb-6 w-full flex justify-center">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-16 object-contain"
                            // Importante para evitar erro de CORS no html-to-image
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-3xl font-black tracking-tighter" style={{ color: BRAND.purple }}>
                            FACILLIT
                        </span>
                    )}
                </div>

                {/* TAG DE CONTEXTO */}
                <div className="mb-6 px-6 py-2 rounded-full border border-gray-100 bg-gray-50/50">
                    <span className="text-xs font-extrabold tracking-[0.25em] uppercase text-gray-400">
                        Resultado Oficial
                    </span>
                </div>

                {/* 3. TÍTULO/TEMA DA REDAÇÃO */}
                <div className="w-full text-center mb-4 px-4">
                    <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Tema da Redação
                    </h2>
                    <p className="text-2xl font-bold text-[#0f0f11] leading-tight line-clamp-3">
                        {/* Se o título tiver aspas, o React renderiza bem aqui, mas cuidado se fosse HTML puro */}
                        &ldquo;{stats.title}&rdquo;
                    </p>
                </div>

                {/* 4. NOTA EM DESTAQUE (HERO) */}
                <div className="my-auto flex flex-col items-center justify-center relative">
                    <div className="relative z-10">
                        <span className="text-[10rem] font-[900] leading-[0.85] tracking-tighter text-transparent bg-clip-text" style={{ backgroundImage: BRAND.gradient }}>
                            {stats.score}
                        </span>
                    </div>
                    <div className="mt-4 px-6 py-2 bg-[#07f49e] rounded-full shadow-lg transform -rotate-2">
                        <span className="text-sm font-black text-[#0f0f11] uppercase tracking-widest">
                            Pontuação Total
                        </span>
                    </div>
                </div>

                {/* 5. PERFIL DO ALUNO */}
                <div className="w-full mt-auto mb-8 flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    {showAvatar && (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-gray-200">
                             {safeAvatar ? (
                                <img
                                    src={safeAvatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    {...(!safeAvatar.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    N/A
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col text-left overflow-hidden">
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-[#0f0f11] truncate">
                                {profile.full_name}
                            </span>
                            {profile.verification_badge && <VerifiedBadge />}
                        </div>
                        <span className="text-sm font-medium text-purple-700">
                            @{profile.nickname}
                        </span>
                    </div>
                </div>

                {/* 6. FOOTER COM QR CODE */}
                <div className="w-full bg-[#f8f9fa] rounded-3xl p-3 flex items-center justify-between border border-gray-200/60 shadow-sm">
                    <div className="flex items-center gap-4 pl-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: BRAND.gradient }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#42047e]">
                                PRATIQUE EM
                            </span>
                            <span className="text-xl font-bold text-[#0f0f11] tracking-tight">
                                facillithub.com
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-white p-1.5 rounded-xl border border-gray-100">
                        <QRCodeSVG 
                            value={shareUrl} 
                            size={60}
                            fgColor="#000000" 
                            bgColor="#ffffff"
                            level={"M"}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};