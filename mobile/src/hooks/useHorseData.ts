import { useEffect, useState } from 'react';
import { horseProvider } from '../data/horseProvider';
import type { CountryCode, Horse } from '../data/types';

type HorseDataState<T> = {
  key: string;
  loading: boolean;
  error?: Error;
  data: T;
};

export function useHorseListings(countryCode: CountryCode) {
  const [result, setResult] = useState<HorseDataState<Horse[]>>(() => ({
    key: countryCode,
    loading: true,
    data: [],
  }));

  useEffect(() => {
    let active = true;
    horseProvider.list(countryCode).then((listings) => {
      if (!active) return;
      setResult({ key: countryCode, loading: false, data: listings });
    }).catch((error: unknown) => {
      if (!active) return;
      setResult({
        key: countryCode,
        loading: false,
        data: [],
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });
    return () => { active = false; };
  }, [countryCode]);

  const state = result.key === countryCode ? result : { key: countryCode, loading: true, data: [] };
  return { horses: state.data, loading: state.loading, error: state.error };
}

export function useHorseDetails(id: string, countryCode: CountryCode) {
  const key = `${countryCode}:${id}`;
  const [result, setResult] = useState<HorseDataState<Horse | undefined>>(() => ({
    key,
    loading: true,
    data: undefined,
  }));

  useEffect(() => {
    let active = true;
    horseProvider.getById(id, countryCode).then((listing) => {
      if (!active) return;
      setResult({ key, loading: false, data: listing });
    }).catch((error: unknown) => {
      if (!active) return;
      setResult({
        key,
        loading: false,
        data: undefined,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });
    return () => { active = false; };
  }, [countryCode, id, key]);

  const state = result.key === key ? result : { key, loading: true, data: undefined };
  return { horse: state.data, loading: state.loading, error: state.error };
}
