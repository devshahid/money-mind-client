export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function getTextColor(backgroundColor: string): string {
  const color = backgroundColor.substring(1)
  const rgb = parseInt(color, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 128 ? 'black' : 'white'
}

export function stringToColor(string: string): string {
  let hash = 0
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#'
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

export function stringAvatar(name: string): { sx: { bgcolor: string }; children: string } {
  const parts = name.split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[1]?.[0] ?? '') : ''

  return {
    sx: { bgcolor: stringToColor(name) },
    children: `${first.toUpperCase()}${last.toUpperCase()}`,
  }
}
