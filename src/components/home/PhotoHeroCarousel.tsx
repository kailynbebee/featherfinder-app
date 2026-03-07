import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { HERO_SLIDES } from '@/components/home/homeHeroSlides'

const AUTO_SWIPE_DURATION_MS = 5500
const PROGRESS_INTERVAL_MS = 50

type PhotoHeroCarouselProps = {
  overlay?: React.ReactNode
}

export function PhotoHeroCarousel({ overlay }: PhotoHeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const goTo = useCallback(
    (i: number) => {
      emblaApi?.scrollTo(i)
      setProgress(0)
    },
    [emblaApi]
  )

  const goPrev = useCallback(() => {
    emblaApi?.scrollPrev()
    setProgress(0)
  }, [emblaApi])

  const goNext = useCallback(() => {
    emblaApi?.scrollNext()
    setProgress(0)
  }, [emblaApi])

  // Sync selectedIndex from Embla and reset progress on manual change
  useEffect(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setProgress(0)
    }
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    },
    [goPrev, goNext]
  )

  // Auto-swipe with ambient pace
  useEffect(() => {
    if (!emblaApi) return
    const increment = (PROGRESS_INTERVAL_MS / AUTO_SWIPE_DURATION_MS) * 100
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          emblaApi.scrollNext()
          return 0
        }
        return prev + increment
      })
    }, PROGRESS_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [emblaApi])

  const index = selectedIndex

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Wingspan habitat bird photos"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="embla-viewport h-full overflow-hidden"
      >
        <div
          className="embla-container flex h-full"
          style={{ touchAction: 'pan-y pinch-zoom' }}
        >
          {HERO_SLIDES.map((s, i) => (
            <div
              key={s.habitat}
              role="group"
              aria-roledescription="slide"
              aria-label={`${s.birdName}, ${s.habitatLabel} habitat`}
              className="embla-slide relative h-full min-w-0 flex-[0_0_100%]"
            >
              <div className="absolute inset-0 min-h-0 min-w-0 bg-app-background">
                <img
                  src={typeof s.imageSrc === 'string' ? s.imageSrc : (s.imageSrc as { default?: string })?.default ?? ''}
                  alt={s.birdName}
                  className="block size-full object-cover object-center"
                  loading={i === index ? 'eager' : 'lazy'}
                  fetchPriority={i === index ? 'high' : undefined}
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 px-4 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:gap-4 sm:px-5 sm:pt-8 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-linear-to-t from-black/50 via-black/30 to-transparent"
        aria-label="Search and discover"
      >
        <div className="w-full max-w-200 text-left">
          <p className="font-kodchasan text-lg font-bold text-white drop-shadow-md">
            {HERO_SLIDES[index].birdName}
          </p>
          <p className="text-xs text-white/90">
            Photo: {HERO_SLIDES[index].photoAuthor}
          </p>
        </div>
        <div
          className="flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Carousel navigation"
        >
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.habitat}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to ${s.habitatLabel} habitat slide`}
              onClick={() => goTo(i)}
              className="cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
            >
              {i === index ? (
                <div className="flex h-1.75 w-10.5 shrink-0 overflow-hidden rounded-lg bg-[rgba(200,178,146,0.8)]">
                  <div
                    className="h-full rounded-bl-lg rounded-tl-lg bg-[#c8b292]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : (
                <div className="h-1.75 w-2.5 shrink-0 rounded-lg bg-[rgba(200,178,146,0.5)] hover:bg-[rgba(200,178,146,0.65)]" />
              )}
              <span className="sr-only">
                {s.habitatLabel} habitat, {s.birdName}
              </span>
            </button>
          ))}
        </div>
        {overlay}
      </div>
    </div>
  )
}
