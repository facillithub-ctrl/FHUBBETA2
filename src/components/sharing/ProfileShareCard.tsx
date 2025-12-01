/* eslint-disable @next/next/no-img-element */
"use client";

import { UserProfile } from '@/app/dashboard/types';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface ShareCardStats {
    followers: number;
    following: number;
}

interface ProfileShareCardProps {
    profile: UserProfile;
    stats: ShareCardStats;
    innerRef: RefObject<HTMLDivElement>;
    avatarOverride?: string | null;
    logoOverride?: string | null;
    isExporting?: boolean;
    showAvatar?: boolean;
}

const BRAND = {
    purple: '#42047e',
    green: '#07f49e',
    dark: '#0f0f11',
    gradient: 'linear-gradient(135deg, #42047e 0%, #07f49e 100%)'
};

const VerifiedBadge = () => (
    <div className="flex items-center justify-center w-6 h-6 rounded-full ml-2 relative z-10" 
         style={{ background: BRAND.gradient }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
        </svg>
    </div>
);

export const ProfileShareCard = ({ 
    profile, 
    stats, 
    innerRef, 
    avatarOverride, 
    logoOverride, 
    isExporting = false,
    showAvatar = true
}: ProfileShareCardProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    const profileUrl = `${baseUrl}/u/${profile.nickname}`;

    const safeAvatar = avatarOverride || (isExporting ? null : profile.avatar_url);
    const safeLogo = logoOverride || (isExporting ? null : "/assets/images/accont.svg");

    return (
        <div
            ref={innerRef}
            // Base: 540x960 (9:16). Fundo Branco Puro para nitidez máxima.
            className="w-[540px] h-[960px] flex flex-col items-center relative overflow-hidden font-sans box-border bg-white"
        >
            {/* DECORAÇÃO DE FUNDO (Clean & Sharp) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Formas vetoriais simples - Sem Blur complexo */}
                <svg className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.03]" viewBox="0 0 100 100">
                    <circle cx="100" cy="0" r="80" fill={BRAND.green} />
                </svg>
                <svg className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-[0.04]" viewBox="0 0 100 100">
                    <circle cx="0" cy="100" r="80" fill={BRAND.purple} />
                </svg>
            </div>

            {/* CONTEÚDO */}
            <div className="relative z-10 flex flex-col items-center w-full h-full pt-20 pb-16 px-10">
                
                {/* 1. HEADER LOGO */}
                <div className="w-full flex justify-center mb-12">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-16 object-contain"
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-3xl font-bold tracking-widest text-[#42047e] opacity-90">
                            FACILLIT
                        </span>
                    )}
                </div>

                {/* 2. AVATAR (Super Nítido) */}
                {showAvatar && (
                    <div className="relative mb-10">
                        {/* Anel de Gradiente Sólido (Sem box-shadow difuso) */}
                        <div className="p-[4px] rounded-full" style={{ background: BRAND.gradient }}>
                            <div className="rounded-full border-[6px] border-white bg-white">
                                <div className="w-56 h-56 rounded-full overflow-hidden relative bg-gray-50 border border-gray-100">
                                    {safeAvatar ? (
                                        <img
                                            src={safeAvatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            {...(!safeAvatar.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. NOME */}
                <div className="text-center w-full mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-[3.2rem] font-[800] tracking-tight leading-none text-[#0f0f11]">
                            {profile.full_name}
                        </h1>
                        {profile.verification_badge && profile.verification_badge !== 'none' && (
                            <VerifiedBadge />
                        )}
                    </div>
                    
                    <div className="inline-block">
                        <p className="text-2xl font-bold bg-clip-text text-transparent" 
                           style={{ backgroundImage: BRAND.gradient }}>
                            @{profile.nickname}
                        </p>
                    </div>
                </div>

                {/* 4. MÉTRICAS (Card Sólido) */}
                <div className="flex items-center justify-center gap-6 w-full mb-auto px-4">
                    <div className="flex-1 rounded-2xl p-6 flex flex-col items-center bg-[#f8f9fa] border border-[#e5e7eb]">
                        <span className="text-4xl font-[900] leading-none mb-2 text-[#0f0f11]">
                            {stats.followers}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-widest text-[#6b7280]">
                            Seguidores
                        </span>
                    </div>
                    
                    <div className="flex-1 rounded-2xl p-6 flex flex-col items-center bg-[#f8f9fa] border border-[#e5e7eb]">
                        <span className="text-4xl font-[900] leading-none mb-2 text-[#0f0f11]">
                            {stats.following}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-widest text-[#6b7280]">
                            Seguindo
                        </span>
                    </div>
                </div>

                {/* 5. FOOTER (Link Visual) */}
                <div className="w-full mt-10 mb-4 rounded-[28px] overflow-hidden border border-[#f3f4f6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white relative">
                    {/* Barra Lateral */}
                    <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: BRAND.gradient }}></div>

                    <div className="py-8 px-8 pl-10 flex flex-row items-center justify-between">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#42047e]">
                                PERFIL OFICIAL
                            </span>
                            <span className="text-xl font-bold text-[#0f0f11]">
                                facillithub.com
                            </span>
                        </div>
                        
                        {/* Ícone QR Simples e Nítido */}
                        <div className="p-1 bg-white border border-gray-100 rounded-lg">
                             <QRCodeSVG 
                                value={profileUrl} 
                                size={70}
                                fgColor="#000000" 
                                bgColor="#ffffff"
                                level={"M"}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};