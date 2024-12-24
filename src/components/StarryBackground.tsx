'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface StarProps {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number | null
}

interface ShootingStarProps {
  x: number
  y: number
  speed: number
  length: number
  angle: number
  opacity: number
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stars, setStars] = useState<StarProps[]>([])

  const generateStars = useCallback((width: number, height: number): StarProps[] => {
    const starDensity = 0.00015
    const area = width * height
    const numStars = Math.floor(area * starDensity)
    
    return Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 0.6 + 0.2,
      opacity: Math.random() * 0.4 + 0.2,
      twinkleSpeed: Math.random() < 0.7 ? Math.random() * 0.6 + 0.3 : null
    }))
  }, [])

  const generateShootingStar = useCallback((width: number): ShootingStarProps => {
    return {
      x: Math.random() * width,
      y: 0,
      speed: Math.random() * 3 + 2,
      length: Math.random() * 50 + 30,
      angle: Math.PI / 4,
      opacity: Math.random() * 0.3 + 0.2
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width
      canvas.height = height
      
      if (stars.length === 0) {
        const newStars = generateStars(width, height)
        setStars(newStars)
      }
    }

    let shootingStars: ShootingStarProps[] = []
    
    const render = () => {
      const width = canvas.width
      const height = canvas.height
      
      ctx.clearRect(0, 0, width, height)
      
      // Draw regular stars
      stars.forEach(star => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        if (star.twinkleSpeed) {
          star.opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 / star.twinkleSpeed) * 0.5)
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
      })

      // Draw and update shooting stars
      shootingStars = shootingStars.filter(star => star.y < height && star.x < width)
      
      shootingStars.forEach(star => {
        ctx.beginPath()
        ctx.moveTo(star.x, star.y)
        const tailX = star.x - Math.cos(star.angle) * star.length
        const tailY = star.y - Math.sin(star.angle) * star.length
        
        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY)
        gradient.addColorStop(0, `rgba(100, 149, 237, ${star.opacity})`)
        gradient.addColorStop(1, 'rgba(100, 149, 237, 0)')
        
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.stroke()
        
        star.x += star.speed
        star.y += star.speed
      })

      if (Math.random() < 0.008) {
        shootingStars.push(generateShootingStar(width))
      }

      requestAnimationFrame(render)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    render()
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [generateStars, generateShootingStar, stars])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 bg-[#0A0B1A] -z-10"
    />
  )
}
