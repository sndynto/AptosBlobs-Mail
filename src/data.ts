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
  pending?: boolean   // true = blob not yet confirmed on-chain
  timestamp?: number  // For sorting by most recent time
  private?: boolean    // true = encrypted message/allowlist
}

// [background, text]    vivid solid for circle avatars on white bg
export const COLORS = [
  ['#F040B0', '#ffffff'], // Shelby pink
  ['#6001D2', '#ffffff'], // Shelby purple
  ['#8B0050', '#ffffff'], // Deep pink
  ['#be185d', '#ffffff'], // Rose
  ['#7c3aed', '#ffffff'], // Violet
  ['#d946ef', '#ffffff'], // Fuchsia
  ['#4c1d95', '#ffffff'], // Deep violet
  ['#9d174d', '#ffffff'], // Deep rose
]

