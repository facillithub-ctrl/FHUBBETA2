'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Timer } from 'lucide-react'

export function CampaignBanner() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-brand-green/30 bg-gradient-to-r from-brand-purple/90 to-brand-dark p-1 shadow-2xl shadow-brand-green/10"
      >
        {/* Background Effects */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-brand-green/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-brand-purple/40 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-dark/40 backdrop-blur-md rounded-xl p-6 md:p-8">
          
          {/* Texto e Gatilhos */}
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              Bolsa Emergencial Liberada
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Curso de Redação Premium <span className="text-brand-green font-multiara text-3xl md:text-4xl">12 Meses</span>
            </h2>
            
            <p className="text-gray-300 max-w-xl">
              Domine a redação com metodologia validada e professores reais. 
              <span className="text-white font-medium"> De: R$ 997,00 por: </span>
              <span className="text-brand-green font-bold text-lg">R$ 0,00</span>.
            </p>
          </div>

          {/* Botão de Ação (CTA) */}
          <div className="flex-shrink-0">
            <Link href="/campanha/redacao-12-meses">
              <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-brand-dark transition-all duration-200 bg-brand-green font-lg rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(7,244,158,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green focus:ring-offset-gray-900">
                <Sparkles size={20} className="animate-pulse" />
                <span>Garantir Minha Vaga Grátis</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-[10px] text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
              <Timer size={12} />
              Oferta por tempo limitado
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}