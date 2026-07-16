import { useEffect, useMemo } from 'react'
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber'
import { Card } from '../game/cards'
import { Engine, GameState, Hint, MoveRef, isCardSlot } from '../game/engine'
import { backTexture, emblemTexture, faceTexture } from '../three/cardTextures'
import { BoardTheme } from '../three/boardThemes'

interface Props {
  engine: Engine
  state: GameState
  selection: MoveRef | null
  hint: Hint | null
  theme: BoardTheme
  onCardClick: (ref: MoveRef, kind: string) => void
  onCardDouble: (ref: MoveRef) => void
  onPileClick: (pileId: string, kind: string) => void
}

// World-space card dimensions.
const CARD_W = 1
const CARD_H = 1.4
const THICK = 0.06
const SPACING_X = CARD_W + 0.16
const TOP_Z = -2.35
const ROW_STEP = 1.35
const FAN_UP_Z = 0.34
const FAN_DOWN_Z = 0.14
const FAN_RIGHT_X = 0.34
const FELT_TOP = 0.12
const BASE_Y = FELT_TOP + THICK / 2 + 0.006
const SLOT_Y = FELT_TOP + 0.006
const TABLE_Z = -0.35

interface Placement {
  pileId: string
  kind: string
  fan: string
  col: number
  row: number
}

function placements(engine: Engine, state: GameState): { list: Placement[]; cols: number } {
  const rows = engine.layout(state)
  const tableauRow = rows.find((r) => r.slots.some((s) => isCardSlot(s) && s.kind === 'tableau'))
  const cols = tableauRow
    ? tableauRow.slots.filter((s) => isCardSlot(s) && s.kind === 'tableau').length
    : 7
  const list: Placement[] = []
  rows.forEach((row, r) => {
    const spacerIdx = row.slots.findIndex((s) => !isCardSlot(s))
    const push = (id: string, kind: string, fan: string, col: number) =>
      list.push({ pileId: id, kind, fan, col, row: r })
    if (spacerIdx === -1) {
      row.slots.filter(isCardSlot).forEach((s, i) => push(s.pileId, s.kind, s.fan, i))
    } else {
      const left = row.slots.slice(0, spacerIdx).filter(isCardSlot)
      const right = row.slots.slice(spacerIdx + 1).filter(isCardSlot)
      left.forEach((s, i) => push(s.pileId, s.kind, s.fan, i))
      right.forEach((s, i) => push(s.pileId, s.kind, s.fan, cols - right.length + i))
    }
  })
  return { list, cols }
}

function CardMesh({
  card,
  x,
  y,
  z,
  faceUp,
  selected,
  hinted,
  onClick,
  onDouble,
}: {
  card: Card
  x: number
  y: number
  z: number
  faceUp: boolean
  selected: boolean
  hinted: boolean
  onClick: () => void
  onDouble: () => void
}) {
  const tex = faceUp ? faceTexture(card) : backTexture()
  const lift = selected ? 0.5 : 0
  const emissive = hinted ? '#f4cf6b' : selected ? '#6a5012' : '#000000'
  const emissiveIntensity = hinted ? 0.7 : selected ? 0.4 : 0
  return (
    <group position={[x, y + lift, z]}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onClick()
        }}
        onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onDouble()
        }}
      >
        <boxGeometry args={[CARD_W, THICK, CARD_H]} />
        <meshStandardMaterial
          color={selected || hinted ? '#fff6d8' : '#efe7d2'}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.62}
          metalness={0.02}
        />
      </mesh>
      <mesh position={[0, THICK / 2 + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CARD_W * 0.985, CARD_H * 0.985]} />
        <meshStandardMaterial map={tex} roughness={0.55} metalness={0.02} />
      </mesh>
    </group>
  )
}

function PileSlot({
  x,
  z,
  theme,
  hintTarget,
  onClick,
}: {
  x: number
  z: number
  theme: BoardTheme
  hintTarget: boolean
  onClick: () => void
}) {
  const tex = emblemTexture(theme.emblem, theme.emblemColor)
  return (
    <mesh
      position={[x, SLOT_Y, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <planeGeometry args={[CARD_W * 0.96, CARD_H * 0.96]} />
      <meshStandardMaterial
        map={tex}
        transparent
        opacity={0.92}
        emissive={hintTarget ? '#f4cf6b' : '#000000'}
        emissiveIntensity={hintTarget ? 0.85 : 0}
        roughness={0.9}
      />
    </mesh>
  )
}

function Table({ cols, theme }: { cols: number; theme: BoardTheme }) {
  const feltW = cols * SPACING_X + 0.5
  const feltD = 6.9
  return (
    <group position={[0, 0, TABLE_Z]}>
      {/* contact shadow catcher to ground the table in the world */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]} receiveShadow>
        <planeGeometry args={[feltW + 8, feltD + 8]} />
        {/* shadow-only material */}
        <shadowMaterial transparent opacity={0.34} />
      </mesh>

      {/* stacked, shrinking slabs create a beveled, thick oak table */}
      <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[feltW + 1.5, 0.8, feltD + 1.5]} />
        <meshStandardMaterial color={theme.woodBase} roughness={0.82} metalness={0.06} />
      </mesh>
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[feltW + 0.9, 0.52, feltD + 0.9]} />
        <meshStandardMaterial color={theme.woodRail} roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[feltW + 0.3, 0.16, feltD + 0.3]} />
        <meshStandardMaterial
          color={theme.trim}
          emissive={theme.trimEmissive}
          emissiveIntensity={0.3}
          roughness={0.42}
          metalness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.085, 0]} receiveShadow>
        <boxGeometry args={[feltW, 0.07, feltD]} />
        <meshStandardMaterial color={theme.felt} roughness={0.96} metalness={0} />
      </mesh>

      {/* brass corner inlays */}
      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (feltW / 2 + 0.28), 0.12, sz * (feltD / 2 + 0.28)]}>
          <boxGeometry args={[0.5, 0.14, 0.5]} />
          <meshStandardMaterial
            color={theme.trim}
            emissive={theme.trimEmissive}
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.65}
          />
        </mesh>
      ))}
    </group>
  )
}

function Scene({
  engine,
  state,
  selection,
  hint,
  theme,
  onCardClick,
  onCardDouble,
  onPileClick,
}: Props) {
  const { list, cols } = useMemo(() => placements(engine, state), [engine, state])
  const centerX = (cols - 1) / 2
  const scale = Math.min(0.78, 6.2 / (cols * SPACING_X))
  const colX = (col: number) => (col - centerX) * SPACING_X
  const rowZ = (row: number) => TOP_Z + row * ROW_STEP

  const isSelected = (pileId: string, index: number) =>
    !!selection && selection.pileId === pileId && index >= selection.cardIndex

  return (
    <group scale={[scale, scale, scale]}>
      <Table cols={cols} theme={theme} />

      {list.map((p) => {
        const cards = state.piles[p.pileId] ?? []
        const baseX = colX(p.col)
        const baseZ = rowZ(p.row)
        let fanZ = 0
        const nodes = cards.map((card, index) => {
          let x = baseX
          let y = BASE_Y
          let z = baseZ
          if (p.fan === 'down') {
            z = baseZ + fanZ
            y = BASE_Y + index * 0.006
            fanZ += card.faceUp ? FAN_UP_Z : FAN_DOWN_Z
          } else if (p.fan === 'right') {
            const visible = Math.min(cards.length, 3)
            const vi = index - (cards.length - visible)
            if (vi < 0) return null
            x = baseX + vi * FAN_RIGHT_X
          } else {
            y = BASE_Y + index * (THICK * 0.9)
          }
          return (
            <CardMesh
              key={card.id}
              card={card}
              x={x}
              y={y}
              z={z}
              faceUp={card.faceUp}
              selected={isSelected(p.pileId, index)}
              hinted={hint?.from.pileId === p.pileId && hint.from.cardIndex === index}
              onClick={() => onCardClick({ pileId: p.pileId, cardIndex: index }, p.kind)}
              onDouble={() => onCardDouble({ pileId: p.pileId, cardIndex: index })}
            />
          )
        })

        return (
          <group key={p.pileId}>
            <PileSlot
              x={baseX}
              z={baseZ}
              theme={theme}
              hintTarget={hint?.toPileId === p.pileId}
              onClick={() => onPileClick(p.pileId, p.kind)}
            />
            {nodes}
          </group>
        )
      })}
    </group>
  )
}

function CameraRig() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, 9.8, 7.2)
    camera.lookAt(0, 0, -0.3)
  }, [camera])
  return null
}

export function Board3D(props: Props) {
  return (
    <div className="board3d">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 38, near: 0.1, far: 100, position: [0, 9.8, 7.2] }}
      >
        <CameraRig />
        <ambientLight intensity={0.6} />
        <hemisphereLight args={['#cfe3ff', '#3a2a16', 0.4]} />
        <directionalLight
          position={[4.5, 10, 5.5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-camera-near={0.5}
          shadow-camera-far={40}
          shadow-bias={-0.0004}
        />
        <pointLight position={[-5, 5, 3]} intensity={props.theme.glowIntensity} color={props.theme.glow} />
        <Scene {...props} />
      </Canvas>
    </div>
  )
}
