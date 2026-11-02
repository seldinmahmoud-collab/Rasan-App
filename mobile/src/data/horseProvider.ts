import { illustrativeHorses } from './demoHorseData';
import type { CountryCode, HorseProvider } from './types';

export const demoHorseProvider: HorseProvider = {
  async list(countryCode: CountryCode) {
    return illustrativeHorses.filter((horse) => horse.countryCode === countryCode);
  },

  async getById(id: string, countryCode: CountryCode) {
    return illustrativeHorses.find((horse) => horse.id === id && horse.countryCode === countryCode);
  },
};

export const horseProvider = demoHorseProvider;
