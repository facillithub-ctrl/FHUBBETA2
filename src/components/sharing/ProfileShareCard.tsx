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
    isExporting?: boolean; 
}

const CheckBadgeSVG = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill={color}/>
    </svg>
);

const StarBadgeSVG = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={color}/>
    </svg>
);

export const ProfileShareCard = ({ profile, stats, innerRef, avatarOverride, isExporting = false }: ProfileShareCardProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    const profileUrl = `${baseUrl}/u/${profile.nickname}`;

    const renderBadge = () => {
        const badge = profile.verification_badge;
        if (badge === 'green') return <CheckBadgeSVG color="#22c55e" />;
        if (badge === 'blue') return <CheckBadgeSVG color="#3b82f6" />;
        if (badge === 'red') return <StarBadgeSVG color="#ef4444" />;
        if (badge === 'true') return <CheckBadgeSVG color="#3b82f6" />;
        return null;
    };

    // Lógica Segura:
    // 1. Prioriza Base64 (avatarOverride)
    // 2. Se falhar e estiver exportando, usa NULL (Placeholder)
    // 3. Só usa URL externa se estiver na tela (visualização normal)
    const safeAvatarSource = avatarOverride 
        ? avatarOverride 
        : (isExporting ? null : profile.avatar_url);

    // Detecta se é Base64 para remover crossOrigin (Evita bug no Safari)
    const isBase64 = safeAvatarSource?.startsWith('data:');

    return (
        <div
            ref={innerRef}
            className="w-[400px] h-[700px] bg-white border-[16px] border-gray-50 flex flex-col items-center relative overflow-hidden font-sans box-border"
            style={{ backgroundColor: '#ffffff' }}
        >
            {/* Fundo leve para exportação (CSS puro, sem blur pesado) */}
            {isExporting ? (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-white to-green-50/30 z-0 pointer-events-none"></div>
            ) : (
                <>
                    <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[50px] pointer-events-none"></div>
                    <div className="absolute bottom-[-40px] left-[-40px] w-[250px] h-[250px] bg-green-500/5 rounded-full blur-[50px] pointer-events-none"></div>
                </>
            )}

            {/* Logo Local */}
            <div className="w-full flex justify-center pt-8 mb-6 relative z-10">
                <img 
                    src="/assets/images/accont.svg" 
                    alt="Facillit Account" 
                    className="h-14 object-contain"
                    // Remova crossOrigin de assets locais se der erro, mas geralmente ok
                />
            </div>

            {/* AVATAR */}
            <div className="relative mb-6 z-10">
                <div className="absolute -inset-[4px] rounded-full bg-gradient-to-tr from-brand-purple to-brand-green"></div>
                <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-sm relative z-10 bg-white">
                     {safeAvatarSource ? (
                        <img
                            src={safeAvatarSource}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            // TRUQUE DE MESTRE: Se for Base64, NÃO use crossOrigin. Se for URL, use.
                            {...(!isBase64 ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        // Placeholder
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* IDENTIDADE */}
            <div className="text-center z-10 mb-4 w-full px-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <h1 className="font-bold text-2xl text-gray-900 leading-tight">
                        {profile.full_name}
                    </h1>
                    <div className="flex items-center">
                        {renderBadge()}
                    </div>
                </div>
                
                <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-green">
                    @{profile.nickname}
                </p>
            </div>

            {/* BIO */}
            {profile.bio && (
                <div className="z-10 mb-6 px-8 text-center w-full flex-grow-0">
                    <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-4">
                        {profile.bio}
                    </p>
                </div>
            )}

            {/* STATS */}
            <div className="flex items-center justify-center gap-10 mt-2 mb-auto z-10 w-full px-8">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-gray-800">{stats.followers}</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Seguidores</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-gray-800">{stats.following}</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Seguindo</span>
                </div>
            </div>

            {/* QR CODE */}
            <div className="z-10 mb-8 flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <QRCodeSVG 
                        value={profileUrl} 
                        size={80}
                        fgColor="#1f2937" 
                        bgColor="#ffffff"
                        level={"M"}
                        imageSettings={{
                            src: "/assets/images/accont.svg",
                            x: undefined,
                            y: undefined,
                            height: 18,
                            width: 18,
                            excavate: true,
                        }}
                    />
                </div>
                <p className="text-gray-400 text-[10px] font-medium tracking-wide">
                    facillithub.com/u/{profile.nickname}
                </p>
            </div>
        </div>
    );
};