const US_ZIP_REGEX = /^\d{5}$/

export function isValidZip(zip: string): boolean {
  return US_ZIP_REGEX.test(zip.trim())
}

export function formatZipInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 5)
}
