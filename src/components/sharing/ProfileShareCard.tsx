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
    const color = type === 'red' ? '#ef4444' : '#3b82f6'; // Azul ou Vermelho
    const Icon = type === 'red' ? (
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
    ) : (
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
    );

    return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full shadow-sm ml-1.5" style={{ backgroundColor: color }}>
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
    // Se estiver exportando e não tiver a versão segura, usa NULL para forçar fallback e evitar trava
    const safeAvatar = avatarOverride || (isExporting ? null : profile.avatar_url);
    const safeLogo = logoOverride || (isExporting ? null : "/assets/images/accont.svg");

    return (
        <div
            ref={innerRef}
            className="w-[400px] h-[700px] flex flex-col items-center relative overflow-hidden font-sans box-border bg-white"
        >
            {/* --- FUNDO MODERNO (MESH GRADIENT) --- */}
            {/* CSS puro para garantir que sai perfeito na imagem */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    background: `
                        radial-gradient(at 0% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(34, 197, 94, 0.15) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.1) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(34, 197, 94, 0.1) 0px, transparent 50%),
                        linear-gradient(to bottom, #ffffff, #f8fafc)
                    `
                }}
            />

            {/* --- CONTEÚDO --- */}
            <div className="relative z-10 flex flex-col items-center w-full h-full px-8 pt-12 pb-10">
                
                {/* HEADER LOGO */}
                <div className="mb-10">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-8 object-contain opacity-80 grayscale hover:grayscale-0 transition-all"
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-xl font-bold text-gray-300">FACILLIT</span>
                    )}
                </div>

                {/* AVATAR PREMIUM (Com anel duplo) */}
                <div className="relative mb-6">
                    {/* Glow suave atrás */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-tr from-brand-purple/20 to-brand-green/20 rounded-full blur-xl"></div>
                    
                    <div className="relative w-32 h-32 p-1 rounded-full bg-gradient-to-tr from-brand-purple via-white to-brand-green shadow-lg">
                        <div className="w-full h-full rounded-full border-4 border-white bg-white overflow-hidden">
                             {safeAvatar ? (
                                <img
                                    src={safeAvatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    {...(!safeAvatar.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* NOME E USERNAME */}
                <div className="text-center mb-8 w-full">
                    <div className="flex items-center justify-center mb-1 gap-1">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {profile.full_name}
                        </h1>
                        {profile.verification_badge && profile.verification_badge !== 'none' && (
                            <VerifiedBadge type={profile.verification_badge as string} />
                        )}
                    </div>
                    <p className="text-base font-medium text-brand-purple/90">
                        @{profile.nickname}
                    </p>
                </div>

                {/* STATS (Minimalista) */}
                <div className="flex items-center justify-center gap-8 w-full mb-auto">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-gray-800">{stats.followers}</span>
                        <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">Seguidores</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-gray-800">{stats.following}</span>
                        <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">Seguindo</span>
                    </div>
                </div>

                {/* QR CODE CARD (Estilo Cartão de Visita) */}
                <div className="w-full bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-row items-center gap-5">
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <QRCodeSVG 
                            value={profileUrl} 
                            size={80}
                            fgColor="#1f2937" 
                            bgColor="transparent"
                            level={"M"}
                        />
                    </div>
                    
                    <div className="flex flex-col items-start gap-1">
                        <p className="text-xs font-bold text-brand-purple uppercase tracking-wider">Escaneie</p>
                        <p className="text-xs text-gray-500 leading-snug">
                            Para aceder ao perfil completo e conectar-se.
                        </p>
                        <div className="mt-1 px-2 py-1 bg-gray-100 rounded text-[10px] font-mono text-gray-600 truncate max-w-[180px]">
                            facillithub.com/u/{profile.nickname}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};