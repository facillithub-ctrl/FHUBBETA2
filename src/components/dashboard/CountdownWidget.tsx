"use client";

import { useState, useEffect } from 'react';

type Props = {
  targetExam: string | null | undefined;
  examDate: string | null | undefined;
};

export default function CountdownWidget({ targetExam, examDate }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!targetExam || !examDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(examDate);
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const interval = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(interval);
  }, [targetExam, examDate]);

  if (!isClient) return null; // Evita hidratação incorreta

  if (!targetExam || !examDate || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0)) {
     return (
        <div className="h-full flex flex-col items-center justify-center text-center py-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <i className="fas fa-calendar-times"></i>
            </div>
            <p className="text-sm font-medium text-text-muted dark:text-gray-400">Nenhum exame alvo definido.</p>
        </div>
    );
  }

  const TimeBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
        <div className="w-full aspect-square max-w-[60px] bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-1">
            <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-purple to-brand-green">
                {value}
            </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
         <span className="inline-block px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold border border-brand-purple/20">
            {targetExam}
         </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 w-full">
        <TimeBlock value={timeLeft.days} label="Dias" />
        <TimeBlock value={timeLeft.hours} label="Hrs" />
        <TimeBlock value={timeLeft.minutes} label="Min" />
        <TimeBlock value={timeLeft.seconds} label="Seg" />
      </div>
    </div>
  );
}