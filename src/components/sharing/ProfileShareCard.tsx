/* eslint-disable @next/next/no-img-element */
"use client";

import { UserProfile } from '@/app/dashboard/types';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface ShareCardStats {
    followers: number;
    following: number;
}

export type CardTheme = 'light' | 'dark';

interface ProfileShareCardProps {
    profile: UserProfile;
    stats: ShareCardStats;
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
    gray: '#f3f4f6',
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
    theme = 'light',
    showAvatar = true
}: ProfileShareCardProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    const profileUrl = `${baseUrl}/u/${profile.nickname}`;

    const safeAvatar = avatarOverride || (isExporting ? null : profile.avatar_url);
    const safeLogo = logoOverride || (isExporting ? null : "/assets/images/accont.svg");

    const isDark = theme === 'dark';

    // FUNDO LIMPO: Sem divs extras, apenas CSS puro para evitar artefactos
    const backgroundStyle = isDark 
        ? {
            backgroundColor: BRAND.dark,
            backgroundImage: `
                radial-gradient(circle at 100% 0%, rgba(7, 244, 158, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 0% 100%, rgba(66, 4, 126, 0.15) 0%, transparent 40%)
            `
          }
        : {
            backgroundColor: BRAND.light,
            backgroundImage: `
                radial-gradient(circle at 100% 0%, rgba(7, 244, 158, 0.1) 0%, transparent 45%),
                radial-gradient(circle at 0% 100%, rgba(66, 4, 126, 0.08) 0%, transparent 45%)
            `
          };

    return (
        <div
            ref={innerRef}
            // Tamanho Base: 540x960. Com pixelRatio 3 = 1620x2880 (Ultra HD)
            className="w-[540px] h-[960px] flex flex-col items-center relative overflow-hidden font-sans box-border"
            style={backgroundStyle}
        >
            {/* CONTEÚDO */}
            <div className="relative z-10 flex flex-col items-center w-full h-full pt-20 pb-16 px-10">
                
                {/* 1. HEADER LOGO */}
                <div className="w-full flex justify-center mb-10">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-14 object-contain"
                            // No dark mode, invertemos a cor para branco se for SVG preto
                            style={{ filter: isDark ? 'brightness(0) invert(1)' : 'none' }}
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-3xl font-bold tracking-widest opacity-80" style={{ color: isDark ? '#fff' : BRAND.purple }}>
                            FACILLIT
                        </span>
                    )}
                </div>

                {/* 2. AVATAR (Sem sombras difusas, apenas borda nítida) */}
                {showAvatar && (
                    <div className="relative mb-8">
                        {/* Borda Externa (Gradiente) */}
                        <div className="p-[5px] rounded-full" style={{ background: BRAND.gradient }}>
                            {/* Borda Interna (Sólida) */}
                            <div className="rounded-full border-[5px]" 
                                 style={{ borderColor: isDark ? BRAND.dark : '#fff', backgroundColor: isDark ? BRAND.dark : '#fff' }}>
                                <div className="w-52 h-52 rounded-full overflow-hidden relative bg-gray-100">
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
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <h1 className="text-[3rem] font-[900] tracking-tight leading-none"
                            style={{ color: isDark ? '#fff' : BRAND.dark }}>
                            {profile.full_name}
                        </h1>
                        {profile.verification_badge && profile.verification_badge !== 'none' && (
                            <VerifiedBadge />
                        )}
                    </div>
                    
                    {/* Username Pill - Sem blur, cor sólida com transparência alpha */}
                    <div className="inline-block px-6 py-2 rounded-full" 
                         style={{ 
                             backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(66, 4, 126, 0.05)',
                             border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'transparent'}`
                         }}>
                        <p className="text-2xl font-bold" 
                           style={{ color: isDark ? '#fff' : BRAND.purple }}>
                            @{profile.nickname}
                        </p>
                    </div>
                </div>

                {/* 4. MÉTRICAS (Design Limpo - Sem Sombras) */}
                <div className="flex items-center justify-center gap-6 w-full mb-auto">
                    <div className="flex-1 rounded-3xl p-6 flex flex-col items-center"
                         style={{ 
                             backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa', 
                             border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}`
                         }}>
                        <span className="text-4xl font-[900] leading-none mb-2" style={{ color: isDark ? '#fff' : BRAND.dark }}>
                            {stats.followers}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-60" style={{ color: isDark ? '#fff' : BRAND.dark }}>
                            Seguidores
                        </span>
                    </div>
                    
                    <div className="flex-1 rounded-3xl p-6 flex flex-col items-center"
                         style={{ 
                             backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa', 
                             border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}`
                         }}>
                        <span className="text-4xl font-[900] leading-none mb-2" style={{ color: isDark ? '#fff' : BRAND.dark }}>
                            {stats.following}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-60" style={{ color: isDark ? '#fff' : BRAND.dark }}>
                            Seguindo
                        </span>
                    </div>
                </div>

                {/* 5. QR CODE FOOTER */}
                <div className="w-full mt-10 relative rounded-[36px] overflow-hidden border border-gray-100/10">
                    <div className="h-3 w-full" style={{ background: BRAND.gradient }}></div>
                    
                    <div className="py-10 px-8 flex flex-row items-center justify-between"
                         style={{ backgroundColor: isDark ? '#151517' : 'white' }}>
                        
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: BRAND.green }}>
                                CONECTAR
                            </span>
                            <span className="text-2xl font-bold leading-tight" style={{ color: isDark ? '#fff' : BRAND.dark }}>
                                Escaneie<br/>o perfil
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-gray-100">
                            <QRCodeSVG 
                                value={profileUrl} 
                                size={110}
                                fgColor={BRAND.dark} 
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