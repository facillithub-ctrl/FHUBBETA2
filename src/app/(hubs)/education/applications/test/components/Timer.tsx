"use client";

import { useState, useEffect, useRef } from 'react';

type Props = {
  isRunning: boolean;
  onTimeUp?: () => void;
  durationInSeconds: number; // Duração total em segundos
};

export default function Timer({ isRunning, onTimeUp, durationInSeconds }: Props) {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUp]);
  
  // Reseta o tempo se a duração mudar (ex: novo simulado)
  useEffect(() => {
    setTimeLeft(durationInSeconds);
  }, [durationInSeconds]);


  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="font-mono text-lg font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md">
      {formatTime(timeLeft)}
    </div>
  );
}