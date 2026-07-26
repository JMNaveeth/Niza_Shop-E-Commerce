import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

function RotatingBox({ color }: { color: string }) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.35
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
    </mesh>
  )
}

interface ProductViewer3DProps {
  color: string
}

export default function ProductViewer3D({ color }: ProductViewer3DProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <pointLight position={[-2, 1, 2]} intensity={0.5} color="#e91e8c" />
      <RotatingBox color={color} />
      <OrbitControls enableZoom={false} autoRotate={false} />
    </Canvas>
  )
}
