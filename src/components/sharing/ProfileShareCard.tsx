"use client";

import { UserProfile } from '@/app/dashboard/types';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { VerificationBadge } from '@/components/VerificationBadge'; // Importação do componente real

export interface ShareCardStats {
    followers: number;
    following: number;
}

interface ProfileShareCardProps {
    profile: UserProfile;
    stats: ShareCardStats;
    innerRef: RefObject<HTMLDivElement>;
}

export const ProfileShareCard = ({ profile, stats, innerRef }: ProfileShareCardProps) => {
    // URL para o QR Code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    const profileUrl = `${baseUrl}/u/${profile.nickname}`;

    return (
        // Container Portrait (Stories) - Fundo Branco com Borda Suave
        <div
            ref={innerRef}
            className="w-[400px] h-[700px] bg-white border-[16px] border-gray-50 flex flex-col items-center relative overflow-hidden font-sans box-border"
            style={{ backgroundColor: '#ffffff' }}
        >
            {/* Elementos Decorativos de Fundo */}
            <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[50px] pointer-events-none"></div>
            <div className="absolute bottom-[-40px] left-[-40px] w-[250px] h-[250px] bg-green-500/5 rounded-full blur-[50px] pointer-events-none"></div>

            {/* 1. HEADER: Logo Facillit Account */}
            <div className="w-full flex justify-center pt-8 mb-6 relative z-10">
                <img 
                    src="/assets/images/accont.svg" 
                    alt="Facillit Account" 
                    className="h-14 object-contain"
                    crossOrigin="anonymous"
                />
            </div>

            {/* 2. AVATAR COM BRAND GRADIENT RING */}
            <div className="relative mb-6 z-10">
                <div className="absolute -inset-[4px] rounded-full bg-gradient-to-tr from-brand-purple to-brand-green"></div>
                <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-sm relative z-10 bg-white">
                     {profile.avatar_url ? (
                        /* Correção do Erro de Tipo: Garantimos que src seja string */
                        <img
                            src={profile.avatar_url || ""}
                            alt={profile.nickname || "Avatar do usuário"}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <i className="fas fa-user text-4xl text-gray-300"></i>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. IDENTIDADE */}
            <div className="text-center z-10 mb-4 w-full px-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <h1 className="font-bold text-2xl text-gray-900 leading-tight">
                        {profile.full_name}
                    </h1>
                    
                    {/* CORREÇÃO: Usando o componente VerificationBadge real para mostrar a cor correta */}
                    <div className="flex items-center">
                        <VerificationBadge badge={profile.verification_badge} size="12px" />
                    </div>
                </div>
                
                <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-green">
                    @{profile.nickname}
                </p>
            </div>

            {/* 4. BIO */}
            {profile.bio && (
                <div className="z-10 mb-6 px-8 text-center w-full flex-grow-0">
                    <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-4">
                        {profile.bio}
                    </p>
                </div>
            )}

            {/* 5. SOCIAL STATS */}
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

            {/* 6. FOOTER: QR Code */}
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