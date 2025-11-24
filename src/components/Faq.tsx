"use client";

import { useState } from 'react';

const faqData = [
    { question: 'O Facillit Hub é gratuito?', answer: 'Sim! Temos um plano gratuito completo para estudantes. Planos institucionais têm custos personalizados.' },
    { question: 'Como funciona a integração?', answer: 'Todos os módulos são nativos. O que você faz no Edu reflete no Day, que conecta com o Write, e assim por diante.' },
    { question: 'Meus dados estão seguros?', answer: 'Absolutamente. Seguimos rigorosamente a LGPD e usamos criptografia de ponta em todas as transações.' },
    { question: 'Posso cancelar a qualquer momento?', answer: 'Sim, sem contratos de fidelidade para contas pessoais. Você tem total liberdade.' },
];

const FaqItem = ({ item, isOpen, onClick }: any) => (
    <div className="border-b border-gray-200">
        <button className="flex justify-between items-center w-full py-6 text-left focus:outline-none group" onClick={onClick}>
            <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-brand-purple' : 'text-dark-text group-hover:text-brand-purple'}`}>{item.question}</span>
            <i className={`fas fa-chevron-down transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-purple' : 'text-gray-400'}`}></i>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden text-gray-600 leading-relaxed">
                {item.answer}
            </div>
        </div>
    </div>
);

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-black text-dark-text text-center mb-12">Perguntas Frequentes</h2>
                <div className="space-y-2">
                    {faqData.map((item, i) => (
                        <FaqItem key={i} item={item} isOpen={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? null : i)} />
                    ))}
                </div>
            </div>
        </section>
    );
}