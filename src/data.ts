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
}

export const COLORS = [
  ['#1a3a6b', '#60a5fa'], ['#1a4a3b', '#34d399'], ['#4a2a1a', '#fb923c'],
  ['#3a1a4a', '#c084fc'], ['#4a3a1a', '#fbbf24'], ['#1a3a4a', '#38bdf8']
]

