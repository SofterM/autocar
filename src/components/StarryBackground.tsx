// components/StarryBackground.tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'

interface StarProps {
  x: number
  y: number
  radius: number 
  opacity: number
  twinkleSpeed: number | null
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateStars = useCallback((width: number, height: number): StarProps[] => {
    // ลดความหนาแน่นของดาว
    const starDensity = 0.00015 // ลดลงจาก 0.0003
    const area = width * height
    const numStars = Math.floor(area * starDensity)
    
    return Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 0.6 + 0.2, // ปรับขนาดดาวให้เล็กลง
      opacity: Math.random() * 0.4 + 0.2, // ลดความสว่างลงเล็กน้อย
      twinkleSpeed: Math.random() < 0.7 ? Math.random() * 0.6 + 0.3 : null
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateStars = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width
      canvas.height = height
      
      const stars = generateStars(width, height)
      
      const render = () => {
        ctx.clearRect(0, 0, width, height)
        stars.forEach(star => {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
          if (star.twinkleSpeed) {
            star.opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 / star.twinkleSpeed) * 0.5)
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
          ctx.fill()
        })
        requestAnimationFrame(render)
      }
      render()
    }

    updateStars()
    window.addEventListener('resize', updateStars)
    
    return () => {
      window.removeEventListener('resize', updateStars)
    }
  }, [generateStars])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 bg-[#0A0B1A] -z-10"
    />
  )
}