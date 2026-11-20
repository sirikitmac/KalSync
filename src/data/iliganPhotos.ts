/**
 * Photos of Iligan City used on the landing page, hotlinked from Wikimedia
 * Commons (freely licensed). Each links to its Commons page for author and
 * license details.
 */
export interface CityPhoto {
  src: string
  alt: string
  caption: string
  sourceUrl: string
}

const thumb = (path: string, file: string, w: number) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/${w}px-${file}`
const commons = (name: string) => `https://commons.wikimedia.org/wiki/File:${name}`

const SKYLINE = 'Iligan_City_Proper_overlooking_Mount_Lelong_%28Iligan%2C_Lanao_Del_Norte%3B_10-15-2023%29.jpg'
const BONIFACIO = 'Iligan_Tibanga%2C_Andres_Bonfacio_Avenue_%28Iligan%2C_Lanao_Del_Norte%3B_10-15-2023%29.jpg'
const ROUTE9 = 'National_Route_9_at_Iligan_City.jpg'
const QUEZON = '2010.08.25_Fra_Quezon_Avenue_IV.JPG'

export const ILIGAN_PHOTOS = {
  skyline: {
    src: thumb('7/73', SKYLINE, 1920),
    alt: 'Iligan City proper seen from Mount Lelong',
    caption: 'Iligan City from Mount Lelong',
    sourceUrl: commons('Iligan_City_Proper_overlooking_Mount_Lelong_(Iligan,_Lanao_Del_Norte;_10-15-2023).jpg'),
  },
  bonifacio: {
    src: thumb('1/1f', BONIFACIO, 1280),
    alt: 'Traffic on Andres Bonifacio Avenue in Tibanga, Iligan City',
    caption: 'Andres Bonifacio Avenue, Tibanga',
    sourceUrl: commons('Iligan_Tibanga,_Andres_Bonfacio_Avenue_(Iligan,_Lanao_Del_Norte;_10-15-2023).jpg'),
  },
  route9: {
    src: thumb('b/b5', ROUTE9, 960),
    alt: 'National Route 9 passing through Iligan City',
    caption: 'National Route 9, Iligan City',
    sourceUrl: commons(ROUTE9),
  },
  quezon: {
    src: thumb('9/90', QUEZON, 1280),
    alt: 'Quezon Avenue in downtown Iligan',
    caption: 'Quezon Avenue, Poblacion',
    sourceUrl: commons('2010.08.25_Fra_Quezon_Avenue_IV.JPG'),
  },
} satisfies Record<string, CityPhoto>
