import { useEffect, useState } from 'react'
import { formatImageCaption, getBirdImage } from '@/services/birdImages'

export function useBirdImage(speciesCode: string, scientificName: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setImageUrl(null)
    setCaption(null)

    getBirdImage(speciesCode, scientificName).then((result) => {
      if (!cancelled) {
        setImageUrl(result.url)
        setCaption(formatImageCaption(result))
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [speciesCode, scientificName])

  return { imageUrl, caption, isLoading }
}
