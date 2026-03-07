/**
 * Habitat hero slides for the homepage carousel.
 * One bird per Wingspan habitat: Forest, Grassland, Wetland.
 */

import burrowingOwl from '@/assets/images/birds/burrowing-owl.jpg?url'
import commonKingfisher from '@/assets/images/birds/common-kingfisher.png?url'
import europeanRobin from '@/assets/images/birds/european-robin.jpg?url'

export type HabitatId = 'forest' | 'grassland' | 'wetland'

export type HeroSlide = {
  imageSrc: string
  birdName: string
  habitat: HabitatId
  habitatLabel: string
  photoAuthor: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    imageSrc: europeanRobin,
    birdName: 'European Robin',
    habitat: 'forest',
    habitatLabel: 'Forest',
    photoAuthor: 'Aarn Giri',
  },
  {
    imageSrc: burrowingOwl,
    birdName: 'Burrowing Owl',
    habitat: 'grassland',
    habitatLabel: 'Grassland',
    photoAuthor: 'Alef Morais',
  },
  {
    imageSrc: commonKingfisher,
    birdName: 'Common Kingfisher',
    habitat: 'wetland',
    habitatLabel: 'Wetland',
    photoAuthor: 'Anushtup De',
  },
]
