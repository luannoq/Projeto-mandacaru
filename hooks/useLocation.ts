/**
 * Hook de geolocalização do Akaru (expo-location).
 *
 * Solicita a permissão, captura as coordenadas e faz reverse geocoding para
 * obter cidade/estado. Usa a última posição conhecida (instantânea) antes de
 * pedir uma nova, evitando que a tela fique presa carregando.
 *
 * IMPORTANTE: timeout/indisponibilidade do GPS NÃO é o mesmo que permissão
 * negada — `permissionDenied` só fica true quando o SO realmente nega.
 */
import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

import { nomeParaUF } from '../constants/estados';

/** Tempo máximo de espera por uma posição nova do GPS. */
const GPS_TIMEOUT_MS = 15000;

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
  /** True APENAS quando o usuário negou a permissão de localização. */
  permissionDenied: boolean;
  /** Solicita a permissão (se necessário) e captura a localização atual. */
  requestLocation: () => Promise<LocationData | null>;
};

/** Promise.race com timeout que limpa o timer ao concluir (evita timers órfãos). */
function comTimeout<T>(promessa: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const limite = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('gps-timeout')), ms);
  });
  return Promise.race([promessa, limite]).finally(() => clearTimeout(timer)) as Promise<T>;
}

export function useLocation(): UseLocation {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('Permissão de localização negada.');
        return null;
      }
      // Permissão concedida — garante que não estamos no estado "negado".
      setPermissionDenied(false);

      // Última posição conhecida é instantânea; só capturamos uma nova se faltar.
      let posicao = await Location.getLastKnownPositionAsync();
      if (!posicao) {
        posicao = await comTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          GPS_TIMEOUT_MS,
        );
      }
      if (!posicao) {
        setError('Não foi possível obter a localização.');
        return null;
      }

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
      // GPS lento/indisponível COM permissão concedida: não é "permissão negada".
      // Deixa a tela tratar a ausência de localização (sem disparar o modal de permissão).
      setError(
        e?.message === 'gps-timeout'
          ? 'Tempo esgotado ao obter a localização.'
          : (e?.message ?? 'Não foi possível obter a localização.'),
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, permissionDenied, requestLocation };
}
