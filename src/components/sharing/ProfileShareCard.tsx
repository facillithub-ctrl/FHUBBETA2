/* eslint-disable @next/next/no-img-element */
"use client";

import { UserProfile } from '@/app/dashboard/types';
import { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface ShareCardStats {
    followers: number;
    following: number;
}

export type CardTheme = 'light' | 'dark' | 'gradient';

interface ProfileShareCardProps {
    profile: UserProfile;
    stats: ShareCardStats;
    innerRef: RefObject<HTMLDivElement>;
    avatarOverride?: string | null;
    logoOverride?: string | null;
    isExporting?: boolean;
    theme?: CardTheme; // NOVO
    showAvatar?: boolean; // NOVO
}

const VerifiedBadge = ({ type }: { type: string | boolean }) => {
    const color = type === 'red' ? '#ef4444' : '#2563EB'; 
    const Icon = type === 'red' ? (
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
    ) : (
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
    );

    // Tamanho reduzido para 18px (mais discreto)
    return (
        <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full shadow-sm ml-1.5 ring-2 ring-white/50" style={{ backgroundColor: color }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {Icon}
            </svg>
        </div>
    );
};

export const ProfileShareCard = ({ 
    profile, 
    stats, 
    innerRef, 
    avatarOverride, 
    logoOverride, 
    isExporting = false,
    theme = 'gradient',
    showAvatar = true
}: ProfileShareCardProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facillithub.com';
    const profileUrl = `${baseUrl}/u/${profile.nickname}`;

    const safeAvatar = avatarOverride || (isExporting ? null : profile.avatar_url);
    const safeLogo = logoOverride || (isExporting ? null : "/assets/images/accont.svg");

    // Configurações de Cores baseadas no Tema
    const getThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return {
                    bg: 'bg-[#0f1115]',
                    textPrimary: 'text-white',
                    textSecondary: 'text-gray-400',
                    cardBg: 'bg-white/5 border-white/10',
                    qrBg: 'bg-white',
                    qrFg: '#000000'
                };
            case 'light':
                return {
                    bg: 'bg-white',
                    textPrimary: 'text-gray-900',
                    textSecondary: 'text-gray-500',
                    cardBg: 'bg-gray-50 border-gray-100',
                    qrBg: 'transparent',
                    qrFg: '#1f2937'
                };
            case 'gradient':
            default:
                return {
                    bg: 'bg-white', // Base branca, o gradiente vai por cima
                    textPrimary: 'text-[#0E0E0F]',
                    textSecondary: 'text-gray-500',
                    cardBg: 'bg-white/40 border-white/60 backdrop-blur-md',
                    qrBg: 'transparent',
                    qrFg: '#1f2937'
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div
            ref={innerRef}
            className={`w-[400px] h-[711px] flex flex-col items-center relative overflow-hidden font-sans box-border ${styles.bg}`}
        >
            {/* --- FUNDOS --- */}
            
            {/* 1. Dark Mode Texture */}
            {theme === 'dark' && (
                <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-[#0f1115] to-black opacity-80"></div>
            )}

            {/* 2. Premium Gradient (Mesh) */}
            {theme === 'gradient' && (
                <div 
                    className="absolute inset-0 z-0"
                    style={{
                        background: `
                            radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
                            radial-gradient(circle at 100% 0%, rgba(34, 197, 94, 0.15) 0px, transparent 50%),
                            radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.1) 0px, transparent 50%),
                            radial-gradient(circle at 0% 100%, rgba(34, 197, 94, 0.1) 0px, transparent 50%),
                            linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)
                        `
                    }}
                />
            )}

            {/* --- CONTEÚDO --- */}
            <div className="relative z-10 flex flex-col items-center w-full h-full px-8 pt-14 pb-10">
                
                {/* HEADER: LOGO MAIOR */}
                <div className="flex flex-col items-center gap-3 mb-10 w-full">
                    {safeLogo ? (
                        <img 
                            src={safeLogo} 
                            alt="Facillit" 
                            // Aumentado para h-10 (40px) ou h-12 (48px) conforme pedido
                            className={`h-11 object-contain transition-all ${theme === 'dark' ? 'brightness-0 invert opacity-90' : 'opacity-90'}`}
                            {...(!safeLogo.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                        />
                    ) : (
                        <span className={`text-xl font-bold tracking-widest ${styles.textSecondary}`}>FACILLIT</span>
                    )}
                </div>

                {/* AVATAR (Condicional) */}
                {showAvatar && (
                    <div className="relative mb-8 group">
                        {theme === 'gradient' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-brand-purple/20 to-brand-green/20 rounded-full blur-2xl opacity-60"></div>
                        )}
                        
                        <div className={`relative p-1 rounded-full ${theme === 'dark' ? 'bg-gradient-to-tr from-gray-700 to-gray-600' : 'bg-gradient-to-tr from-[#8B5CF6] via-[#EC4899] to-[#10B981]'} shadow-2xl`}>
                            <div className={`p-[3px] rounded-full ${theme === 'dark' ? 'bg-[#0f1115]' : 'bg-white'}`}>
                                <div className={`w-36 h-36 rounded-full overflow-hidden relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                    {safeAvatar ? (
                                        <img
                                            src={safeAvatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            {...(!safeAvatar.startsWith('data:') ? { crossOrigin: "anonymous" } : {})}
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${styles.textSecondary}`}>
                                            <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* NOME E USERNAME */}
                <div className={`text-center ${showAvatar ? 'mb-8' : 'mb-16 mt-8'} w-full`}>
                    <div className="flex items-center justify-center gap-1 mb-2">
                        <h1 className={`text-[2.2rem] font-[800] tracking-tight leading-none ${styles.textPrimary}`}>
                            {profile.full_name}
                        </h1>
                        {profile.verification_badge && profile.verification_badge !== 'none' && (
                            <VerifiedBadge type={profile.verification_badge as string} />
                        )}
                    </div>
                    <div className={`inline-block px-4 py-1.5 rounded-full border ${styles.cardBg} shadow-sm`}>
                        <p className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-green">
                            @{profile.nickname}
                        </p>
                    </div>
                </div>

                {/* MÉTRICAS */}
                <div className="flex items-center justify-center gap-4 w-full px-4 mb-auto">
                    <div className={`flex-1 ${styles.cardBg} border rounded-2xl p-5 flex flex-col items-center shadow-sm`}>
                        <span className={`text-2xl font-[800] leading-none mb-1 ${styles.textPrimary}`}>
                            {stats.followers}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary}`}>
                            Seguidores
                        </span>
                    </div>
                    
                    <div className={`flex-1 ${styles.cardBg} border rounded-2xl p-5 flex flex-col items-center shadow-sm`}>
                        <span className={`text-2xl font-[800] leading-none mb-1 ${styles.textPrimary}`}>
                            {stats.following}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary}`}>
                            Seguindo
                        </span>
                    </div>
                </div>

                {/* QR CODE CARD */}
                <div className="w-full mt-8 relative">
                    <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border rounded-t-[32px] pt-1 px-1 shadow-2xl`}>
                        {/* Faixa de Gradiente */}
                        <div className="h-1.5 w-[60px] bg-gradient-to-r from-brand-purple via-pink-400 to-brand-green rounded-full opacity-90 mb-6 mx-auto mt-3"></div>
                        
                        <div className="px-8 pb-10 flex flex-row items-center justify-between">
                            <div className="flex flex-col items-start gap-1">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary}`}>
                                    Conectar
                                </p>
                                <p className={`text-sm font-semibold ${styles.textPrimary}`}>
                                    Escaneie para visitar
                                </p>
                                <p className={`text-xs mt-1 font-mono opacity-60 ${styles.textSecondary}`}>
                                    facillithub.com
                                </p>
                            </div>

                            <div className={`p-2 rounded-xl border ${theme === 'dark' ? 'bg-white' : 'bg-white border-gray-100'} shadow-inner`}>
                                <QRCodeSVG 
                                    value={profileUrl} 
                                    size={80}
                                    fgColor={styles.qrFg}
                                    bgColor={styles.qrBg}
                                    level={"M"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};