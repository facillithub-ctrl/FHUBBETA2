"use client";

import { useRef, useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { generateImageBlob } from "@/utils/exportAsImage"; // Correção aqui: importando a função certa
import { useToast } from "@/contexts/ToastContext";
import { WriteShareCard } from "./WriteShareCard";

interface ShareWriteButtonProps {
  data: {
    studentName: string;
    theme: string;
    totalScore: number;
    date: string;
    competencies: {
      c1: number;
      c2: number;
      c3: number;
      c4: number;
      c5: number;
    };
  };
}

export function ShareWriteButton({ data }: ShareWriteButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const handleShare = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      // Usa generateImageBlob (que já retorna um File) passando a cor de fundo do card
      const file = await generateImageBlob(
        cardRef.current, 
        `redacao-${data.studentName}-${data.totalScore}`,
        '#0A0A0B' // Cor de fundo do card para evitar bordas brancas
      );
      
      if (!file) throw new Error("Falha ao gerar arquivo.");

      // Dados para compartilhamento nativo
      const shareData = {
        title: "Minha Nota no Facillit Write",
        text: `Tirei ${data.totalScore} na redação sobre "${data.theme}"!`,
        files: [file],
      };

      // Tenta compartilhar nativamente (Celular)
      if (navigator.canShare && navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback para PC: Baixa a imagem automaticamente
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        addToast({ title: "Sucesso!", message: "Imagem salva no dispositivo.", type: "success" });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      addToast({ title: "Erro", message: "Não foi possível gerar a imagem.", type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleShare} 
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all bg-brand-purple/10 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple/20 disabled:opacity-50 hover:shadow-sm"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        Compartilhar
      </button>

      {/* Card Invisível para Renderização */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none opacity-0">
        <WriteShareCard ref={cardRef} {...data} />
      </div>
    </>
  );
}