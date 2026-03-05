export type BirdImageResult = {
  url: string | null
  attribution: string | null
  attributionName: string | null
  licenseCode: string | null
}

const IMAGE_CACHE = new Map<string, BirdImageResult>()

/** Clear cache (for testing) */
export function clearBirdImageCache() {
  IMAGE_CACHE.clear()
}

/**
 * Formats attribution into a caption for display.
 * Follows best practices: author, license. Source (iNaturalist) is added separately as a link.
 */
export function formatImageCaption(result: BirdImageResult): string | null {
  if (!result.url) return null
  const author = result.attributionName ?? (result.attribution ? 'Unknown' : null)
  const license = result.licenseCode
    ? result.licenseCode.toUpperCase().replace(/-/g, ' ')
    : null
  const parts: string[] = []
  if (author) parts.push(`Photo by ${author}`)
  if (license) parts.push(`(${license})`)
  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Fetches a bird species image and attribution from iNaturalist via our proxy.
 * Results are cached in memory to avoid repeated requests.
 */
export async function getBirdImage(
  speciesCode: string,
  scientificName: string
): Promise<BirdImageResult> {
  const cacheKey = speciesCode
  const cached = IMAGE_CACHE.get(cacheKey)
  if (cached !== undefined) return cached

  const q = encodeURIComponent(scientificName)
  const apiUrl = `/api/birds/image?q=${q}`
  try {
    const res = await fetch(apiUrl)
    const data = (await res.json()) as {
      url?: string | null
      attribution?: string | null
      attributionName?: string | null
      licenseCode?: string | null
    }
    const url =
      typeof data?.url === 'string' && data.url.length > 0 ? data.url : null
    const result: BirdImageResult = {
      url,
      attribution:
        typeof data?.attribution === 'string' ? data.attribution : null,
      attributionName:
        typeof data?.attributionName === 'string' ? data.attributionName : null,
      licenseCode:
        typeof data?.licenseCode === 'string' ? data.licenseCode : null,
    }
    IMAGE_CACHE.set(cacheKey, result)
    return result
  } catch {
    const fallback: BirdImageResult = {
      url: null,
      attribution: null,
      attributionName: null,
      licenseCode: null,
    }
    IMAGE_CACHE.set(cacheKey, fallback)
    return fallback
  }
}

/**
 * @deprecated Use getBirdImage for attribution support. Kept for backward compatibility.
 */
export async function getBirdImageUrl(
  speciesCode: string,
  scientificName: string
): Promise<string | null> {
  const result = await getBirdImage(speciesCode, scientificName)
  return result.url
}
