import type { Horse } from './types';
import { illustrativeHorsePhotos } from './illustrativeImages';

export const illustrativeHorses: Horse[] = [
  {
    id: 'sahil',
    name: 'Sahil Al Rasan',
    breed: 'Arabian · Bay',
    age: '6 years',
    sex: 'Stallion',
    location: 'Dubai, UAE',
    countryCode: 'AE',
    price: 'AED 185,000',
    photos: [
      { url: illustrativeHorsePhotos.desert, altText: 'Illustrative horse photo' },
      { url: illustrativeHorsePhotos.arabian, altText: 'Illustrative horse photo' },
      { url: illustrativeHorsePhotos.mare, altText: 'Illustrative horse photo' },
    ],
    category: 'Arabian',
    recordStatus: 'illustrative',
    passport: { recordId: 'DEMO-SAMPLE-0024', status: 'illustrative' },
  },
  {
    id: 'noor',
    name: 'Noor of the Dunes',
    breed: 'Arabian · Grey',
    age: '4 years',
    sex: 'Mare',
    location: 'Abu Dhabi, UAE',
    countryCode: 'AE',
    price: 'AED 142,000',
    photos: [
      { url: illustrativeHorsePhotos.arabian, altText: 'Illustrative horse photo' },
      { url: illustrativeHorsePhotos.desert, altText: 'Illustrative horse photo' },
    ],
    category: 'Arabian',
    recordStatus: 'illustrative',
    passport: { recordId: 'DEMO-SAMPLE-0018', status: 'illustrative' },
  },
  {
    id: 'layali',
    name: 'Layali Al Sahra',
    breed: 'Arabian · Chestnut',
    age: '7 years',
    sex: 'Mare',
    location: 'Sharjah, UAE',
    countryCode: 'AE',
    price: 'AED 210,000',
    photos: [
      { url: illustrativeHorsePhotos.mare, altText: 'Illustrative horse photo' },
      { url: illustrativeHorsePhotos.arabian, altText: 'Illustrative horse photo' },
    ],
    category: 'Endurance',
    recordStatus: 'illustrative',
    passport: { recordId: 'DEMO-SAMPLE-0031', status: 'illustrative' },
  },
];
