"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const features = [
  {
    title: "Decisões mais rápidas e inteligentes.",
    description: "Eu analiso documentos, identifico oportunidades e gero petições, otimizando seu tempo e aumentando sua eficiência."
  },
  {
    title: "Análise de CNIS em segundos.",
    description: "Identifique pendências, indicadores e períodos de contribuição com precisão cirúrgica, transformando horas de trabalho em minutos."
  },
  {
    title: "Geração de Petições com IA.",
    description: "Crie peças processuais administrativas e judiciais bem fundamentadas, com base nos dados analisados e na legislação atualizada."
  },
  {
    title: "Cálculo Preciso de Tempo de Contribuição.",
    description: "Estruture todos os vínculos, incluindo períodos especiais, e obtenha os dados prontos para o cálculo de elegibilidade e RMI."
  }
];

export function AnimatedFeatureText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-28">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full"
        >
          <h2 className="text-3xl font-bold font-heading leading-tight text-shadow-md">
            {features[index].title}
          </h2>
          <p className="mt-4 text-lg text-white/90 text-shadow-sm max-w-xl">
            {features[index].description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
