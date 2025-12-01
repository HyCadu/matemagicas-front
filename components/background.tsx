"use client"

import { motion } from "framer-motion"

export function Background() {
  return (
    <>
      {/* Fundo gradiente de alta qualidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-700" />

      {/* Estrelas animadas */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </>
  )
} 