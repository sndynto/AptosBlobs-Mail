export type Mail = {
  id: number
  unread: boolean
  from: string
  addr: string
  subject: string
  preview: string
  time: string
  tags: string[]
  body: string
  blobs: any[]
  color: number
  pending?: boolean   // true = blob belum dikonfirmasi on-chain
  timestamp?: number  // Untuk sorting berdasarkan waktu terbaru
}

// [background, text] — vivid solid for circle avatars on white bg
export const COLORS = [
  ['#F040B0', '#ffffff'], // Shelby pink
  ['#0073e6', '#ffffff'], // Blue
  ['#00875a', '#ffffff'], // Green
  ['#d97706', '#ffffff'], // Amber
  ['#8B0050', '#ffffff'], // Deep pink
  ['#0891b2', '#ffffff'], // Cyan
  ['#7c3aed', '#ffffff'], // Violet
  ['#be185d', '#ffffff'], // Rose
]

