"use client";

import { useEffect, useState } from 'react';

type ToastProps = {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
};

const icons = {
  success: <i className="fas fa-check-circle"></i>,
  error: <i className="fas fa-times-circle"></i>,
  warning: <i className="fas fa-exclamation-triangle"></i>,
  info: <i className="fas fa-info-circle"></i>,
};

const colors = {
  success: {
    bg: 'bg-green-600',
    progress: 'bg-green-400',
  },
  error: {
    bg: 'bg-red-600',
    progress: 'bg-red-400',
  },
  warning: {
    bg: 'bg-yellow-600',
    progress: 'bg-yellow-400',
  },
  info: {
    bg: 'bg-blue-600',
    progress: 'bg-blue-400',
  },
};

export default function Toast({ title, message, type, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Fecha automaticamente após 5 segundos
    const interval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 2 : 0));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onClose]);

  return (
    <div className={`relative flex items-start text-white p-4 rounded-xl shadow-2xl w-80 animate-fade-in-right overflow-hidden ${colors[type].bg} border border-white/10`}>
      <div className="text-2xl mr-4 mt-0.5 opacity-90">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-xs font-medium opacity-90 leading-snug">{message}</p>
      </div>
      <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors">
        <i className="fas fa-times text-xs"></i>
      </button>
      <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full">
        <div className={`${colors[type].progress} h-1`} style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
      </div>
    </div>
  );
}