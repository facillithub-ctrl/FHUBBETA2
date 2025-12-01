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
    gradient: 'linear-gradient(135deg, #42047e 0%, #07f49e 100%)'
};

const VerifiedBadge = () => (
    <div className="flex items-center justify-center w-8 h-8 ml-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" fill={BRAND.green} />
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

    // Formata a data de criação (ou usa o ano atual como fallback)
    const memberSinceYear = profile.created_at 
        ? new Date(profile.created_at).getFullYear() 
        : new Date().getFullYear();

    return (
        <div
            ref={innerRef}
            className="w-[540px] h-[960px] flex flex-col items-center relative overflow-hidden font-sans box-border bg-white"
        >
            {/* LINHA SUPERIOR (Marca da Cor) */}
            <div className="w-full h-3" style={{ background: BRAND.gradient }}></div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 flex flex-col items-center w-full px-12 pt-14 pb-12">
                
                {/* 1. LOGO EM EVIDÊNCIA */}
                <div className="mb-10 w-full flex justify-center">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-20 object-contain" // Tamanho aumentado (80px)
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-4xl font-black tracking-tighter" style={{ color: BRAND.purple }}>
                            FACILLIT
                        </span>
                    )}
                </div>

                {/* 2. TAG OFICIAL */}
                <div className="mb-6 px-5 py-1.5 rounded-full border-2 border-[#f3f4f6]">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
                        Perfil Oficial
                    </span>
                </div>

                {/* 3. NOME GIGANTE */}
                <div className="text-center w-full mb-2">
                    <h1 className="text-[4rem] font-[900] leading-[0.9] tracking-tight text-[#0f0f11] mb-1">
                        {profile.full_name}
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-3xl font-bold" style={{ color: BRAND.purple }}>
                            @{profile.nickname}
                        </p>
                        {profile.verification_badge && <VerifiedBadge />}
                    </div>
                </div>

                {/* 4. AVATAR (Limpo e Geométrico) */}
                {showAvatar && (
                    <div className="relative my-8">
                        {/* Anel de destaque com as cores da marca */}
                        <div className="p-[6px] rounded-[48px] bg-white shadow-[0_10px_40px_-10px_rgba(66,4,126,0.2)]">
                            <div className="rounded-[42px] overflow-hidden w-56 h-56 relative border-4 border-white">
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
                            
                            {/* Ano de Membro (Badge Flutuante) */}
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#0f0f11] text-white px-4 py-1.5 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
                                <span className="text-xs font-bold tracking-widest uppercase">
                                    Membro desde {memberSinceYear}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. BIO */}
                {profile.bio && (
                    <div className="w-full text-center mb-8 px-4">
                        <p className="text-xl font-medium text-gray-500 leading-snug line-clamp-3">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {/* 6. MÉTRICAS (Minimalista Vertical) */}
                <div className="flex w-full justify-center gap-12 mb-auto mt-2">
                    <div className="text-center">
                        <span className="block text-4xl font-[900] text-[#0f0f11]">{stats.followers}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seguidores</span>
                    </div>
                    <div className="w-px h-12 bg-gray-200"></div>
                    <div className="text-center">
                        <span className="block text-4xl font-[900] text-[#0f0f11]">{stats.following}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seguindo</span>
                    </div>
                </div>

                {/* 7. FOOTER LINK */}
                <div className="w-full mt-8 bg-[#f8f9fa] rounded-3xl p-2 flex items-center justify-between shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 pl-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND.green }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f0f11" strokeWidth="2.5">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Visitar Perfil</span>
                            <span className="text-lg font-bold text-[#0f0f11]">facillithub.com</span>
                        </div>
                    </div>
                    
                    {/* QR Code Limpo */}
                    <div className="bg-white p-1.5 rounded-2xl border border-gray-200">
                        <QRCodeSVG 
                            value={profileUrl} 
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