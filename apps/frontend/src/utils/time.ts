/**
 * Converts a time string to milliseconds.
 * @param timeString The time string (e.g., "5h", "10m", "30s", "100ms").
 * @returns The time in milliseconds.
 */
export function toMilliseconds(timeString: string): number {
  const match = timeString.match(/^(\d+(?:\.\d+)?)([dhms]{1,2})$/)
  if (!match || !match[1]) {
    throw new Error(`Invalid time format: ${timeString}. Expected format like "5h", "10m", "30s", or "100ms"`)
  }

  const value = parseFloat(match[1])
  const unit = match[2]

  switch (unit) {
    case 'd':
      return value * 86400000 // 24 * 60 * 60 * 1000
    case 'h':
      return value * 3600000 // 60 * 60 * 1000
    case 'm':
      return value * 60000 // 60 * 1000
    case 's':
      return value * 1000
    case 'ms':
      return value
    default:
      throw new Error(`Unsupported time unit: ${unit}`)
  }
}

/**
 * Converts a time string to seconds.
 * @param timeString The time string (e.g., "5h", "10m", "30s", "100ms").
 * @returns The time in seconds.
 */
export function toSeconds(timeString: string): number {
  const milliseconds = toMilliseconds(timeString)
  return milliseconds / 1000
}
