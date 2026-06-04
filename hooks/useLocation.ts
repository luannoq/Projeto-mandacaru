/**
 * Hook de geolocalização do Akaru (expo-location).
 *
 * Solicita a permissão de localização, captura as coordenadas do dispositivo e
 * faz reverse geocoding para obter cidade/estado. A localização fica apenas
 * armazenada por enquanto — quando a API Java estiver pronta, lat/lon serão
 * enviados no payload da recomendação.
 */
import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

import { nomeParaUF } from '../constants/estados';

export type LocationData = {
  latitude: number;
  longitude: number;
  cidade?: string;
  estado?: string;
};

type UseLocation = {
  /** Última localização capturada, ou null se ainda não houver. */
  location: LocationData | null;
  /** True enquanto a permissão/captura está em andamento. */
  loading: boolean;
  /** Mensagem de erro amigável, ou null. */
  error: string | null;
  /** True quando o usuário negou a permissão de localização. */
  permissionDenied: boolean;
  /** Solicita a permissão (se necessário) e captura a localização atual. */
  requestLocation: () => Promise<LocationData | null>;
};

export function useLocation(): UseLocation {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('Permissão de localização negada.');
        return null;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const dados: LocationData = {
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      };

      // Reverse geocoding: cidade e estado a partir das coordenadas.
      try {
        const enderecos = await Location.reverseGeocodeAsync({
          latitude: dados.latitude,
          longitude: dados.longitude,
        });
        const primeiro = enderecos[0];
        if (primeiro) {
          dados.cidade = primeiro.city ?? primeiro.subregion ?? undefined;
          // Converte o nome do estado para a sigla UF (ex.: "São Paulo" -> "SP").
          dados.estado = nomeParaUF(primeiro.region) ?? undefined;
        }
      } catch {
        // Reverse geocoding falhou — mantemos só as coordenadas.
      }

      setLocation(dados);
      return dados;
    } catch (e: any) {
      setError(e?.message ?? 'Não foi possível obter a localização.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, permissionDenied, requestLocation };
}
