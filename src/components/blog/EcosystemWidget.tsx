import Link from 'next/link'
import { ArrowRight, Sparkles, Beaker, PenTool, PlayCircle } from 'lucide-react'

// Mapeamento de configurações por tipo de módulo
const modulesConfig: any = {
    write: {
        icon: PenTool,
        color: "bg-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        text: "text-purple-900",
        label: "Facillit Write",
        url: "/login"
    },
    test: {
        icon: Sparkles,
        color: "bg-amber-500",
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-900",
        label: "Facillit Test",
        url: "/modulos/facillit-test"
    },
    play: {
        icon: PlayCircle,
        color: "bg-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-100",
        text: "text-rose-900",
        label: "Facillit Play",
        url: "/modulos/facillit-play"
    },
    lab: {
        icon: Beaker,
        color: "bg-cyan-500",
        bg: "bg-cyan-50",
        border: "border-cyan-100",
        text: "text-cyan-900",
        label: "Facillit Lab",
        url: "/modulos/facillit-lab"
    }
}

export function EcosystemWidget({ type, ctaText }: { type: string, ctaText: string }) {
    const config = modulesConfig[type] || modulesConfig.write
    const Icon = config.icon

    return (
        <div className={`my-12 p-6 rounded-2xl border ${config.border} ${config.bg} flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden group`}>
            {/* Efeito de fundo */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${config.color} blur-3xl -mr-10 -mt-10 transform transition-transform group-hover:scale-150`}></div>

            <div className={`w-14 h-14 rounded-xl ${config.color} flex items-center justify-center text-white shadow-md flex-shrink-0 relative z-10`}>
                <Icon size={28} />
            </div>

            <div className="flex-1 text-center md:text-left relative z-10">
                <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${config.text} opacity-70`}>Recomendado para você</span>
                <h4 className={`text-xl font-bold ${config.text} mb-2`}>Aprofunde seus conhecimentos no {config.label}</h4>
                <p className={`${config.text} text-sm opacity-80 max-w-lg`}>
                    Use a inteligência artificial do Facillit para colocar em prática o que você acabou de aprender.
                </p>
            </div>

            <Link href={config.url} className={`relative z-10 px-6 py-3 bg-white ${config.text} font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 group-hover:gap-3`}>
                {ctaText || "Acessar Agora"} <ArrowRight size={16} />
            </Link>
        </div>
    )
}