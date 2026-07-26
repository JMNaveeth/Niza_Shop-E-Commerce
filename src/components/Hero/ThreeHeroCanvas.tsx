import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Mesh } from 'three'

function FloatingBag({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number]
  color: string
  scale?: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4
      ref.current.rotation.x += delta * 0.15
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} position={position} scale={scale}>
        <boxGeometry args={[0.9, 0.7, 0.35]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.35} />
      </mesh>
    </Float>
  )
}

function FloatingStar({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.8
  })

  return (
    <Float speed={2} floatIntensity={1.8}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </Float>
  )
}

function Scene({ mobile }: { mobile: boolean }) {
  const bags = useMemo(() => {
    if (mobile) {
      return [
        { position: [-1.6, 0.5, -1] as [number, number, number], color: '#e91e8c', scale: 0.85 },
        { position: [1.7, -0.3, -1.2] as [number, number, number], color: '#7c3aed', scale: 0.7 },
      ]
    }
    return [
      { position: [-2.2, 0.8, -1] as [number, number, number], color: '#e91e8c', scale: 1 },
      { position: [2.4, -0.4, -1.5] as [number, number, number], color: '#7c3aed', scale: 0.85 },
      { position: [0.2, 1.4, -2] as [number, number, number], color: '#f59e0b', scale: 0.7 },
      { position: [-1.5, -1.1, -1.2] as [number, number, number], color: '#ec4899', scale: 0.75 },
    ]
  }, [mobile])

  const stars = useMemo(() => {
    if (mobile) {
      return [{ position: [0.2, 1.1, 0] as [number, number, number], color: '#fbbf24' }]
    }
    return [
      { position: [1.6, 1.2, 0] as [number, number, number], color: '#fbbf24' },
      { position: [-2.8, 0.2, 0.2] as [number, number, number], color: '#f472b6' },
      { position: [0.8, -1.3, -0.5] as [number, number, number], color: '#a78bfa' },
    ]
  }, [mobile])

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#e91e8c" />
      <Sparkles
        count={mobile ? 24 : 60}
        scale={mobile ? [5, 4, 3] : [8, 5, 4]}
        size={mobile ? 2.5 : 3}
        speed={0.4}
        color="#ffffff"
        opacity={0.55}
      />
      {bags.map((b, i) => (
        <FloatingBag key={`bag-${i}`} {...b} />
      ))}
      {stars.map((s, i) => (
        <FloatingStar key={`star-${i}`} {...s} />
      ))}
    </>
  )
}

export default function ThreeHeroCanvas() {
  const [mobile, setMobile] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 opacity-90">
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.5]}
        camera={{ position: [0, 0, 5], fov: mobile ? 55 : 50 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'low-power' }}
      >
        <Scene mobile={mobile} />
      </Canvas>
    </div>
  )
}
