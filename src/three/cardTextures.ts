import * as THREE from 'three'
import { Card, SUIT_SYMBOL, color, rankLabel } from '../game/cards'

const W = 256
const H = 358
const faceCache = new Map<string, THREE.CanvasTexture>()
let backTex: THREE.CanvasTexture | null = null
let edgeTex: THREE.CanvasTexture | null = null

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function finalize(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

export function faceTexture(card: Card): THREE.CanvasTexture {
  const key = `${card.suit}-${card.rank}`
  const cached = faceCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#fffef9')
  grad.addColorStop(1, '#e9dcbd')
  ctx.fillStyle = grad
  roundRect(ctx, 4, 4, W - 8, H - 8, 26)
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#d3c095'
  ctx.stroke()

  const isRed = color(card.suit) === 'red'
  ctx.fillStyle = isRed ? '#cc2a35' : '#1b1e24'
  const label = rankLabel(card.rank)
  const symbol = SUIT_SYMBOL[card.suit]

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Corner index (rank over suit), top-left and (rotated) bottom-right.
  ctx.font = 'bold 52px Georgia, serif'
  ctx.fillText(label, 40, 48)
  ctx.font = 'bold 40px Georgia, serif'
  ctx.fillText(symbol, 40, 92)

  ctx.save()
  ctx.translate(W - 40, H - 48)
  ctx.rotate(Math.PI)
  ctx.font = 'bold 52px Georgia, serif'
  ctx.fillText(label, 0, 0)
  ctx.font = 'bold 40px Georgia, serif'
  ctx.fillText(symbol, 0, 44)
  ctx.restore()

  // Center pip.
  ctx.font = 'bold 168px Georgia, serif'
  ctx.globalAlpha = 0.92
  ctx.fillText(symbol, W / 2, H / 2 + 6)
  ctx.globalAlpha = 1

  const tex = finalize(canvas)
  faceCache.set(key, tex)
  return tex
}

export function backTexture(): THREE.CanvasTexture {
  if (backTex) return backTex
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createRadialGradient(W / 2, H * 0.42, 20, W / 2, H / 2, H * 0.7)
  grad.addColorStop(0, '#3a63b0')
  grad.addColorStop(0.5, '#26489a')
  grad.addColorStop(1, '#16306a')
  ctx.fillStyle = grad
  roundRect(ctx, 4, 4, W - 8, H - 8, 26)
  ctx.fill()

  // Diagonal weave.
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 6
  for (let i = -H; i < W; i += 22) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + H, H)
    ctx.stroke()
  }

  // Gold inner border + emblem.
  ctx.strokeStyle = 'rgba(244,207,107,0.85)'
  ctx.lineWidth = 5
  roundRect(ctx, 20, 20, W - 40, H - 40, 18)
  ctx.stroke()

  ctx.fillStyle = '#f4cf6b'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 150px Georgia, serif'
  ctx.fillText('\u269C', W / 2, H / 2 + 6)

  backTex = finalize(canvas)
  return backTex
}

const emblemCache = new Map<string, THREE.CanvasTexture>()

// A themed placeholder drawn on empty piles (crest / anchor / gem / ankh ...).
export function emblemTexture(glyph: string, colorHex: string): THREE.CanvasTexture {
  const key = `${glyph}-${colorHex}`
  const cached = emblemCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(0,0,0,0.30)'
  roundRect(ctx, 8, 8, W - 16, H - 16, 22)
  ctx.fill()

  ctx.lineWidth = 4
  ctx.strokeStyle = colorHex
  ctx.globalAlpha = 0.5
  roundRect(ctx, 16, 16, W - 32, H - 32, 18)
  ctx.stroke()

  ctx.globalAlpha = 0.55
  ctx.fillStyle = colorHex
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 150px Georgia, serif'
  ctx.fillText(glyph, W / 2, H / 2 + 8)
  ctx.globalAlpha = 1

  const tex = finalize(canvas)
  emblemCache.set(key, tex)
  return tex
}

export function edgeTexture(): THREE.CanvasTexture {
  if (edgeTex) return edgeTex
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#efe7d2'
  ctx.fillRect(0, 0, 8, 8)
  edgeTex = finalize(canvas)
  return edgeTex
}
