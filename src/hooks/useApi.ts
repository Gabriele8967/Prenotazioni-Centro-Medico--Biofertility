import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types/booking';

const API_BASE_URL = 'http://localhost:3000/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const result: ApiResponse<T> = await response.json();

      if (result.success) {
        setData(result.data || null);
        options.onSuccess?.(result.data);
        return result;
      } else {
        const errorMessage = result.message || 'Si è verificato un errore';
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore di rete';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

// Hook specifici per ogni endpoint
export function useCategoriesApi() {
  return useApi<any[]>();
}

export function useServicesApi() {
  return useApi<any[]>();
}

export function useProvidersApi() {
  return useApi<any[]>();
}

export function useLocationsApi() {
  return useApi<any[]>();
}

export function useSlotsApi() {
  return useApi<any[]>();
}

export function useBookingApi() {
  return useApi<any>();
}

// Funzioni helper per le chiamate API più comuni
export const api = {
  getCategories: () => 
    fetch(`${API_BASE_URL}/categories/with-counts`).then(res => res.json()),
    
  getCategoryServices: (categoryId: number) =>
    fetch(`${API_BASE_URL}/categories/${categoryId}/services`).then(res => res.json()),
    
  getService: (serviceId: number) =>
    fetch(`${API_BASE_URL}/services/${serviceId}`).then(res => res.json()),
    
  getProviders: (serviceId?: number) =>
    fetch(`${API_BASE_URL}/users/providers${serviceId ? `?service_id=${serviceId}` : ''}`).then(res => res.json()),
    
  getLocations: () =>
    fetch(`${API_BASE_URL}/locations`).then(res => res.json()),
    
  getAvailableSlots: (params: {
    provider_id: number;
    service_id: number;
    date: string;
    location_id: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${API_BASE_URL}/bookings/available-slots?${query}`).then(res => res.json());
  },
    
  createBooking: (bookingData: any) =>
    fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    }).then(res => res.json()),
};