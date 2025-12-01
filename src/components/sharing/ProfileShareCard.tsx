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
    const color = type === 'red' ? '#ef4444' : '#3b82f6'; // Azul padrão ou Vermelho
    const Icon = type === 'red' ? (
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
    ) : (
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
    );

    return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full shadow-sm ml-2" style={{ backgroundColor: color }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            className="w-[400px] h-[700px] flex flex-col items-center relative overflow-hidden font-sans box-border bg-white"
        >
            {/* --- FUNDO MODERNO (MESH GRADIENT) --- */}
            {/* Usamos CSS puro para garantir qualidade máxima na exportação */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    background: `
                        radial-gradient(at 0% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(34, 197, 94, 0.15) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.1) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(34, 197, 94, 0.1) 0px, transparent 50%),
                        linear-gradient(to bottom, #ffffff, #f9fafb)
                    `
                }}
            />

            {/* --- CONTEÚDO DO CARD --- */}
            <div className="relative z-10 flex flex-col items-center w-full h-full px-8 pt-12 pb-8">
                
                {/* HEADER LOGO */}
                <div className="mb-8 opacity-80">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            className="h-10 object-contain"
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className="text-xl font-bold tracking-tight text-gray-400">FACILLIT</span>
                    )}
                </div>

                {/* AVATAR PREMIUM */}
                <div className="relative mb-6 group">
                    {/* Anel de gradiente */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-brand-purple to-brand-green rounded-full opacity-80 blur-[2px]"></div>
                    
                    <div className="relative w-36 h-36 rounded-full border-[6px] border-white bg-white overflow-hidden shadow-lg">
                         {safeAvatar ? (
                            <img
                                src={safeAvatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                {...(!safeAvatar.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* NOME E USERNAME */}
                <div className="text-center mb-6 w-full">
                    <div className="flex items-center justify-center mb-1">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                            {profile.full_name}
                        </h1>
                        {profile.verification_badge && profile.verification_badge !== 'none' && (
                            <VerifiedBadge type={profile.verification_badge as string} />
                        )}
                    </div>
                    <p className="text-lg font-medium text-brand-purple bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-green">
                        @{profile.nickname}
                    </p>
                </div>

                {/* ESTATÍSTICAS (Pills Design) */}
                <div className="flex items-center justify-center gap-4 w-full mb-8">
                    <div className="flex-1 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
                        <span className="block text-2xl font-bold text-gray-800">{stats.followers}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Seguidores</span>
                    </div>
                    <div className="flex-1 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
                        <span className="block text-2xl font-bold text-gray-800">{stats.following}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Seguindo</span>
                    </div>
                </div>

                {/* ESPAÇADOR FLEXÍVEL */}
                <div className="flex-grow"></div>

                {/* QR CODE CARD */}
                <div className="w-full bg-white rounded-3xl p-5 shadow-xl shadow-purple-900/5 border border-gray-100 flex flex-col items-center gap-4 relative overflow-hidden">
                    {/* Detalhe decorativo no fundo do card QR */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-brand-green"></div>
                    
                    <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <QRCodeSVG 
                            value={profileUrl} 
                            size={120}
                            fgColor="#111827" 
                            bgColor="#ffffff"
                            level={"M"}
                            imageSettings={safeLogo ? {
                                src: safeLogo,
                                x: undefined,
                                y: undefined,
                                height: 24,
                                width: 24,
                                excavate: true,
                            } : undefined}
                        />
                    </div>
                    
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-medium mb-1">Escaneie para conectar</p>
                        <p className="text-sm font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            facillithub.com/u/{profile.nickname}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};