import { useMemo } from 'react';
import { EventFilterParams, EventItem, PaginatedResponse } from '../types/models';
import { eventService } from '../services/eventService';
import { useFetch } from './useFetch';

export function useEvents(filters: EventFilterParams = {}) {
  const serializedKey = useMemo(() => JSON.stringify(filters), [filters]);

  const { data, loading, error, refetch, setData } = useFetch<PaginatedResponse<EventItem>>(
    () => eventService.getEvents(filters),
    [serializedKey]
  );

  return {
    events: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    loading,
    error,
    refetch,
    setData,
  };
}
