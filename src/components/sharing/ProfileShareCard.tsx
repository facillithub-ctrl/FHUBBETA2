/* eslint-disable @next/next/no-img-element */
"use client";

import { UserProfile } from '@/app/dashboard/types';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface ShareCardStats {
    followers: number;
    following: number;
}

export type CardTheme = 'light';

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
    gray: '#f4f4f5',
    gradient: 'linear-gradient(135deg, #42047e 0%, #07f49e 100%)'
};

const VerifiedBadge = () => (
    <div className="flex items-center justify-center w-8 h-8 ml-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={BRAND.green} />
            <path d="M7.5 12L10.5 15L16.5 9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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

    const memberSinceYear = profile.created_at 
        ? new Date(profile.created_at).getFullYear() 
        : new Date().getFullYear();

    return (
        <div
            ref={innerRef}
            className="w-[540px] h-[960px] flex flex-col items-center relative overflow-hidden font-sans box-border bg-white"
        >
            {/* 1. BARRA DE GRADIENTE (De volta!) */}
            <div className="w-full h-5" style={{ background: BRAND.gradient }}></div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 flex flex-col items-center w-full px-10 pt-10 pb-10">
                
                {/* 2. LOGO (Com bom destaque) */}
                <div className="mb-8 w-full flex justify-center">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-20 object-contain"
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-4xl font-black tracking-tighter" style={{ color: BRAND.purple }}>
                            FACILLIT
                        </span>
                    )}
                </div>

                {/* TAG OFICIAL */}
                <div className="mb-4 px-6 py-2 rounded-full border border-gray-100 bg-gray-50/50">
                    <span className="text-xs font-extrabold tracking-[0.25em] uppercase text-gray-400">
                        Perfil Oficial
                    </span>
                </div>

                {/* 3. NOME GIGANTE */}
                <div className="text-center w-full mb-6">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h1 className="text-[3.8rem] font-[900] leading-[0.95] tracking-tight text-[#0f0f11]">
                            {profile.full_name}
                        </h1>
                        {profile.verification_badge && <VerifiedBadge />}
                    </div>
                    
                    <p className="text-3xl font-bold" style={{ color: BRAND.purple }}>
                        @{profile.nickname}
                    </p>
                </div>

                {/* 4. AVATAR & MEMBRO DESDE (Redesenhado) */}
                {showAvatar && (
                    <div className="relative mb-8">
                        {/* Anel Externo Sólido */}
                        <div className="p-2 rounded-[50px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div className="rounded-[42px] overflow-hidden w-60 h-60 relative border-4 border-white bg-gray-100">
                                {safeAvatar ? (
                                    <img
                                        src={safeAvatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        {...(!safeAvatar.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* BADGE MEMBRO DESDE (Estilo "Tag Premium") */}
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-[#0f0f11] px-5 py-2.5 rounded-full border border-gray-200 shadow-lg flex items-center gap-2 whitespace-nowrap">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                <span className="text-xs font-bold tracking-widest uppercase">
                                    Membro desde {memberSinceYear}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. BIO */}
                {profile.bio && (
                    <div className="w-full text-center mb-8 px-6 mt-4">
                        <p className="text-xl font-medium text-gray-500 leading-snug line-clamp-2">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {/* 6. MÉTRICAS (Clean) */}
                <div className="flex w-full justify-center gap-14 mb-auto border-t border-gray-100 pt-8 mt-2">
                    <div className="text-center">
                        <span className="block text-[2.8rem] font-[900] text-[#0f0f11] leading-none mb-1">
                            {stats.followers}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seguidores</span>
                    </div>
                    <div className="w-px h-16 bg-gray-100"></div>
                    <div className="text-center">
                        <span className="block text-[2.8rem] font-[900] text-[#0f0f11] leading-none mb-1">
                            {stats.following}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seguindo</span>
                    </div>
                </div>

                {/* 7. FOOTER LINK (Sólido & Moderno) */}
                <div className="w-full mt-8 bg-[#f8f9fa] rounded-3xl p-3 flex items-center justify-between border border-gray-200/60 shadow-sm">
                    <div className="flex items-center gap-5 pl-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: BRAND.gradient }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#42047e]">
                                ACESSE AGORA
                            </span>
                            <span className="text-2xl font-bold text-[#0f0f11] tracking-tight">
                                facillithub.com
                            </span>
                        </div>
                    </div>
                    
                    {/* QR Code Sólido */}
                    <div className="bg-white p-2 rounded-2xl border border-gray-100">
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
    );
};