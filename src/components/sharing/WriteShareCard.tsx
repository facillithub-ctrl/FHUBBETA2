/* eslint-disable @next/next/no-img-element */
"use client";

import { UserProfile } from '@/app/dashboard/types';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface WriteShareStats {
    score: number;
    title: string;
    essayDate?: string;
    badge?: string | null; // A tag do professor (Ex: "Exemplar", "Superação")
}

interface WriteShareCardProps {
    profile: UserProfile;
    stats: WriteShareStats;
    innerRef: RefObject<HTMLDivElement>;
    logoOverride?: string | null;
    isExporting?: boolean;
}

const BRAND = {
    purple: '#42047e',
    green: '#07f49e',
    black: '#0f0f11',
    white: '#ffffff',
    grayBg: '#f8f9fa',
    grayText: '#666666',
    gradientPrimary: 'linear-gradient(135deg, #42047e 0%, #07f49e 100%)'
};

const getScoreTheme = (score: number) => {
    if (score < 600) {
        return { mainColor: BRAND.black, label: 'Prática' };
    } else if (score < 840) {
        return { mainColor: BRAND.purple, label: 'Mandou Bem!' };
    } else {
        return { mainColor: BRAND.green, label: 'Excelente!' };
    }
};

const VerifiedBadge = ({ color }: { color: string }) => (
    <div className="flex items-center justify-center w-6 h-6 ml-1.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={color === BRAND.black ? BRAND.purple : color} />
            <path d="M7.5 12L10.5 15L16.5 9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
);

export const WriteShareCard = ({ 
    profile, 
    stats, 
    innerRef, 
    logoOverride, 
    isExporting = false,
}: WriteShareCardProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    const shareUrl = `${baseUrl}/u/${profile.nickname}`;
    const theme = getScoreTheme(stats.score);
    const safeLogo = logoOverride || (isExporting ? null : "/assets/images/write-logo-placeholder.svg"); 
    
    // Tag Prioritária: Se tiver badge do professor, usa ela. Senão, usa a do score.
    const displayTag = stats.badge || theme.label;

    return (
        <div
            ref={innerRef}
            className="w-[540px] h-[960px] flex flex-col relative overflow-hidden font-sans box-border bg-white"
        >
            {/* 1. HEADER GRADIENT (Com Tag do Professor) */}
            <div className="w-full h-[360px] flex flex-col items-center pt-14 rounded-b-[60px] text-white shadow-xl relative z-0" 
                 style={{ background: BRAND.gradientPrimary }}>
                
                {/* Logo Branco */}
                <div className="mb-6 opacity-95">
                     {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-20 w-auto object-contain brightness-0 invert"
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <div className="flex flex-col items-center text-white">
                            <i className="fas fa-file-signature text-5xl mb-2"></i>
                            <span className="text-2xl font-black tracking-tighter">FACILLIT WRITE</span>
                        </div>
                    )}
                </div>

                {/* TAG EM DESTAQUE */}
                <div className="bg-white/20 backdrop-blur-md px-8 py-2.5 rounded-full border border-white/30 flex items-center gap-3 shadow-sm">
                    <i className="fas fa-medal text-white text-lg"></i>
                    <span className="text-base font-bold uppercase tracking-widest text-white">
                        {displayTag}
                    </span>
                </div>
            </div>

            {/* 2. SCORE CARD (Flutuante com Nota e Tema) */}
            <div className="absolute top-[280px] left-1/2 transform -translate-x-1/2 w-[440px] bg-white rounded-[40px] p-8 flex flex-col items-center text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 z-10">
                <span className="text-xs font-bold uppercase tracking-[0.25em] mb-2" style={{ color: BRAND.grayText }}>
                    Nota da Redação
                </span>
                
                <div className="relative leading-none my-2">
                    <span className="text-[10rem] font-[900] tracking-tighter" style={{ color: theme.mainColor }}>
                        {stats.score}
                    </span>
                </div>
                
                <div className="w-full h-px bg-gray-100 my-6"></div>

                <div className="w-full px-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-2 text-gray-400">
                        Tema da Redação
                    </span>
                    <h2 className="text-xl font-bold leading-snug line-clamp-3 text-[#0f0f11]">
                        &ldquo;{stats.title}&rdquo;
                    </h2>
                </div>
            </div>

            {/* 3. FOOTER INFO (Nome, ID, Link) */}
            <div className="flex-1 flex flex-col items-center justify-end w-full px-10 pb-12 mt-auto">
                
                {/* Info do Aluno (Nome + Verificado + ID) */}
                <div className="flex flex-col items-center mb-12 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-3xl font-[900] tracking-tight text-[#0f0f11] text-center leading-tight">
                            {profile.full_name}
                        </h3>
                        {profile.verification_badge && <VerifiedBadge color={theme.mainColor} />}
                    </div>
                    
                    {/* Chip de ID para Busca */}
                    <div className="flex items-center gap-2 bg-gray-50 px-5 py-2 rounded-full border border-gray-100">
                        <i className="fas fa-search text-gray-400 text-xs"></i>
                        <span className="text-lg font-bold" style={{ color: theme.mainColor }}>
                            @{profile.nickname}
                        </span>
                    </div>
                </div>

                {/* Footer Link & QR */}
                <div className="w-full rounded-2xl p-4 flex items-center justify-between border border-gray-200 bg-gray-50/80">
                    <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: BRAND.gradientPrimary }}>
                            <i className="fas fa-arrow-right transform -rotate-45"></i>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: BRAND.purple }}>
                                ACESSE PERFIL
                            </span>
                            <span className="text-xl font-bold tracking-tight text-[#0f0f11]">
                                facillithub.com
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                        <QRCodeSVG 
                            value={shareUrl} 
                            size={55}
                            fgColor={BRAND.black} 
                            bgColor={BRAND.white}
                            level={"M"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};