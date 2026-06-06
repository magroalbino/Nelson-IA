"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const features = [
  {
    title: "Decisões mais rápidas e inteligentes.",
    description: "Analise documentos, identifique oportunidades e gere petições, otimizando seu tempo e aumentando sua eficiência."
  },
  {
    title: "Análise de CNIS em segundos.",
    description: "Identifique pendências e indicadores com precisão cirúrgica, transformando horas de trabalho em minutos."
  },
  {
    title: "Geração de Petições com IA.",
    description: "Crie peças processuais administrativas e judiciais bem fundamentadas com base na legislação atualizada."
  }
];

export function AnimatedFeatureText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[160px] flex items-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full"
        >
          <h2 className="text-2xl md:text-3xl font-black leading-tight text-white drop-shadow-lg mb-4">
            {features[index].title}
          </h2>
          <p className="text-base md:text-lg text-white/95 font-medium leading-relaxed drop-shadow-md max-w-lg">
            {features[index].description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
