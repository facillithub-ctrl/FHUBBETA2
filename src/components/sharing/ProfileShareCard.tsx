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
}

const VerifiedBadge = ({ type }: { type: string | boolean }) => {
    // Azul Premium ou Vermelho Exclusivo
    const color = type === 'red' ? '#ef4444' : '#2563EB'; 
    const Icon = type === 'red' ? (
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
    ) : (
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
    );

    return (
        <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full shadow-sm ml-1.5 ring-2 ring-white" style={{ backgroundColor: color }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {Icon}
            </svg>
        </div>
    );
};

export const ProfileShareCard = ({ profile, stats, innerRef, avatarOverride, logoOverride, isExporting = false }: ProfileShareCardProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    const profileUrl = `${baseUrl}/u/${profile.nickname}`;

    // Fontes de imagem seguras (Base64)
    const safeAvatar = avatarOverride || (isExporting ? null : profile.avatar_url);
    const safeLogo = logoOverride || (isExporting ? null : "/assets/images/accont.svg");

    return (
        <div
            ref={innerRef}
            // Estrutura Base: 9:16 Ratio (400x711 aprox), Bordas Arredondadas
            className="w-[400px] h-[711px] flex flex-col items-center relative overflow-hidden font-sans box-border bg-white"
        >
            {/* --- FUNDO PREMIUM (GRADIENTES SUAVES) --- */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    background: `
                        radial-gradient(circle at 0% 0%, #E9ECFF 0%, transparent 50%),
                        radial-gradient(circle at 100% 0%, #E4FFF8 0%, transparent 50%),
                        radial-gradient(circle at 100% 100%, #F2E6FF 0%, transparent 50%),
                        radial-gradient(circle at 0% 100%, #E4FFFA 0%, transparent 50%),
                        linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)
                    `
                }}
            />
            
            {/* Textura de Ruído (Opcional - via CSS simples para não travar export) */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="relative z-10 flex flex-col items-center w-full h-full pt-10 pb-0">
                
                {/* 1. HEADER */}
                <div className="flex flex-col items-center gap-2 mb-8 w-full px-8">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-8 object-contain opacity-90 drop-shadow-sm"
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-lg font-bold text-gray-400 tracking-widest">FACILLIT</span>
                    )}
                    <span className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase opacity-80">
                        Perfil Oficial
                    </span>
                </div>

                {/* 2. AVATAR (Elemento de Destaque) */}
                <div className="relative mb-6 group">
                    {/* Glow de fundo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-brand-purple/20 to-brand-green/20 rounded-full blur-2xl opacity-60"></div>
                    
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#8B5CF6] via-[#EC4899] to-[#10B981] shadow-2xl shadow-purple-900/10">
                        <div className="p-[3px] bg-white rounded-full">
                            <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-50 relative">
                                {safeAvatar ? (
                                    <img
                                        src={safeAvatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        {...(!safeAvatar.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. NOME E USERNAME */}
                <div className="text-center mb-8 px-4 w-full">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <h1 className="text-[2.1rem] font-[800] text-[#0E0E0F] tracking-tight leading-tight">
                            {profile.full_name}
                        </h1>
                        {profile.verification_badge && profile.verification_badge !== 'none' && (
                            <VerifiedBadge type={profile.verification_badge as string} />
                        )}
                    </div>
                    <div className="inline-block px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
                        <p className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-green">
                            @{profile.nickname}
                        </p>
                    </div>
                </div>

                {/* 4. MÉTRICAS (Glass Cards) */}
                <div className="flex items-center justify-center gap-4 w-full px-8 mb-auto">
                    {/* Card Seguidores */}
                    <div className="flex-1 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex flex-col items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                        <span className="text-2xl font-[800] text-gray-800 leading-none mb-1">
                            {stats.followers}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Seguidores
                        </span>
                    </div>
                    
                    {/* Card Seguindo */}
                    <div className="flex-1 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 flex flex-col items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                        <span className="text-2xl font-[800] text-gray-800 leading-none mb-1">
                            {stats.following}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Seguindo
                        </span>
                    </div>
                </div>

                {/* 5. QR CODE SECTION (Apple Wallet Style) */}
                <div className="w-full mt-6 relative">
                    <div className="bg-white rounded-t-[32px] pt-1 px-1 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)]">
                        {/* Faixa de Gradiente no Topo */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-brand-purple via-pink-400 to-brand-green rounded-t-[28px] opacity-80 mb-6 mx-auto w-[40px]"></div>
                        
                        <div className="px-8 pb-10 flex flex-row items-center justify-between">
                            <div className="flex flex-col items-start gap-1.5">
                                <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded">
                                    Conectar
                                </p>
                                <p className="text-sm font-semibold text-gray-600">
                                    Escaneie para ver<br/>o perfil completo.
                                </p>
                                <p className="text-xs text-gray-400 mt-1 font-mono">
                                    facillithub.com
                                </p>
                            </div>

                            <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-inner">
                                <QRCodeSVG 
                                    value={profileUrl} 
                                    size={90}
                                    fgColor="#111827" 
                                    bgColor="#ffffff"
                                    level={"M"}
                                    imageSettings={safeLogo ? {
                                        src: safeLogo,
                                        x: undefined,
                                        y: undefined,
                                        height: 20,
                                        width: 20,
                                        excavate: true,
                                    } : undefined}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};