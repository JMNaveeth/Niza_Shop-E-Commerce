import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'

function PhotoTurntable({
  images,
  autoSpin,
}: {
  images: string[]
  autoSpin: boolean
}) {
  const group = useRef<Group>(null)
  const list = useMemo(() => images.filter(Boolean), [images])
  // Front, back, left, right — reuse photos if fewer than 4 angles uploaded
  const faceUrls = useMemo(() => {
    const pick = (i: number) => list[Math.min(i, list.length - 1)]
    return [pick(0), pick(1), pick(2), pick(3), pick(0), pick(Math.min(1, list.length - 1))]
  }, [list])

  const textures = useTexture(faceUrls)
  const maps = (Array.isArray(textures) ? textures : [textures]) as THREE.Texture[]

  maps.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.wrapS = THREE.ClampToEdgeWrapping
    t.wrapT = THREE.ClampToEdgeWrapping
  })

  useFrame((_, delta) => {
    if (group.current && autoSpin) group.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={group}>
      <mesh castShadow>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        {maps.map((map, i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            map={map}
            metalness={0.12}
            roughness={0.6}
          />
        ))}
      </mesh>
    </group>
  )
}

function ColorCube({ color, autoSpin }: { color: string; autoSpin: boolean }) {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    if (group.current && autoSpin) group.current.rotation.y += delta * 0.4
  })
  return (
    <group ref={group}>
      <mesh castShadow>
        <boxGeometry args={[1.7, 1.7, 1.7]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.35} />
      </mesh>
    </group>
  )
}

interface ProductViewer3DProps {
  color: string
  images?: string[]
  autoSpin?: boolean
}

export default function ProductViewer3D({
  color,
  images = [],
  autoSpin = true,
}: ProductViewer3DProps) {
  const hasPhotos = images.some(Boolean)
  const safeColor = color === 'transparent' ? '#e5e7eb' : color
  const [spin, setSpin] = useState(autoSpin)

  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        camera={{ position: [0, 0.4, 3.5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onPointerDown={() => setSpin(false)}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <color attach="background" args={['#14121f']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
        <pointLight position={[-2.5, 1.5, 2]} intensity={0.5} color="#e91e8c" />
        <Suspense fallback={null}>
          {hasPhotos ? (
            <PhotoTurntable images={images} autoSpin={spin} />
          ) : (
            <ColorCube color={safeColor} autoSpin={spin} />
          )}
          <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={8} blur={2.2} />
        </Suspense>
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.3}
          maxDistance={5.2}
          makeDefault
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium text-white/70 sm:text-xs">
        Drag to spin · Pinch / scroll to zoom
      </div>
    </div>
  )
}
