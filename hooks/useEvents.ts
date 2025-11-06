import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Event, EventCategory } from '@/types/events';
import { useAuth } from '@/contexts/AuthContext';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  favorites: Set<string>;
  getEvents: (category?: EventCategory | 'all' | null) => Promise<void>;
  toggleFavorite: (eventId: string) => Promise<void>;
  isFavorite: (eventId: string) => boolean;
  refreshEvents: () => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const { user, userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch user favorites
  const fetchFavorites = useCallback(async () => {
    if (!userProfile?.id) {
      setFavorites(new Set());
      return;
    }

    try {
      const { data, error: favError } = await supabase
        .from('favorites')
        .select('event_id')
        .eq('user_id', userProfile.id);

      if (favError) {
        console.error('Error fetching favorites:', favError);
        return;
      }

      const favoriteIds = new Set(data?.map((fav) => fav.event_id) || []);
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [userProfile?.id]);

  // Fetch events from Supabase
  const getEvents = useCallback(
    async (category?: EventCategory | 'all' | null) => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .order('event_date', { ascending: true });

        // Filter by category if provided
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        const { data, error: eventsError } = await query;

        if (eventsError) {
          throw eventsError;
        }

        // Map the data to match our Event interface
        const mappedEvents: Event[] =
          data?.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            location: event.location,
            address: event.address,
            city: event.city,
            state: event.state,
            zip_code: event.zip_code,
            category: event.category as EventCategory,
            organizer_id: event.organizer_id,
            capacity: event.capacity,
            price: parseFloat(event.price) || 0,
            image_url: event.image_url,
            is_active: event.is_active,
            created_at: event.created_at,
            updated_at: event.updated_at,
          })) || [];

        setEvents(mappedEvents);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Erro ao buscar eventos');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (eventId: string) => {
      if (!userProfile?.id) {
        console.error('User profile not found');
        return;
      }

      try {
        const isCurrentlyFavorite = favorites.has(eventId);

        if (isCurrentlyFavorite) {
          // Remove from favorites
          const { error: deleteError } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userProfile.id)
            .eq('event_id', eventId);

          if (deleteError) {
            throw deleteError;
          }

          // Update local state
          setFavorites((prev) => {
            const newSet = new Set(prev);
            newSet.delete(eventId);
            return newSet;
          });
        } else {
          // Add to favorites
          const { error: insertError } = await supabase
            .from('favorites')
            .insert({
              user_id: userProfile.id,
              event_id: eventId,
            });

          if (insertError) {
            throw insertError;
          }

          // Update local state
          setFavorites((prev) => new Set(prev).add(eventId));
        }
      } catch (err: any) {
        console.error('Error toggling favorite:', err);
        // Revert optimistic update
        await fetchFavorites();
        throw err;
      }
    },
    [userProfile?.id, favorites, fetchFavorites]
  );

  // Check if event is favorite
  const isFavorite = useCallback(
    (eventId: string) => {
      return favorites.has(eventId);
    },
    [favorites]
  );

  // Refresh events
  const refreshEvents = useCallback(async () => {
    await getEvents();
  }, [getEvents]);

  // Initial load - only once on mount
  useEffect(() => {
    getEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch favorites when user profile changes
  useEffect(() => {
    if (userProfile?.id) {
      fetchFavorites();
    }
  }, [userProfile?.id, fetchFavorites]);

  return {
    events,
    loading,
    error,
    favorites,
    getEvents,
    toggleFavorite,
    isFavorite,
    refreshEvents,
  };
}

