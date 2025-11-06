import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Event, EventCategory } from '@/types/events';
import { useCallback, useEffect, useState } from 'react';

export interface OrganizerInfo {
  id: string;
  user_id: string;
  type: string;
  email?: string;
  name?: string;
  created_at?: string;
}

export interface Review {
  id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comment: string | null;
  review_date: string;
  user_name?: string;
  user_email?: string;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  favorites: Set<string>;
  getEvents: (category?: EventCategory | 'all' | null) => Promise<void>;
  toggleFavorite: (eventId: string) => Promise<void>;
  isFavorite: (eventId: string) => boolean;
  refreshEvents: () => Promise<void>;
  // Event detail methods
  event: Event | null;
  organizer: OrganizerInfo | null;
  reviews: Review[];
  isRegistered: boolean;
  fetchEvent: (eventId: string) => Promise<void>;
  toggleRegistration: (eventId: string) => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const { user, userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // Event detail state
  const [event, setEvent] = useState<Event | null>(null);
  const [organizer, setOrganizer] = useState<OrganizerInfo | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

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

  // Fetch event by ID
  const fetchEvent = useCallback(
    async (eventId: string) => {
      setLoading(true);
      setError(null);

      try {
        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) {
          throw eventError;
        }

        if (!eventData) {
          throw new Error('Evento não encontrado');
        }

        // Map event data
        const mappedEvent: Event = {
          id: eventData.id,
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          location: eventData.location,
          address: eventData.address,
          city: eventData.city,
          state: eventData.state,
          zip_code: eventData.zip_code,
          category: eventData.category as EventCategory,
          organizer_id: eventData.organizer_id,
          capacity: eventData.capacity,
          price: parseFloat(eventData.price) || 0,
          image_url: eventData.image_url,
          is_active: eventData.is_active,
          created_at: eventData.created_at,
          updated_at: eventData.updated_at,
        };

        setEvent(mappedEvent);

        // Fetch organizer information
        const { data: organizerData, error: organizerError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', eventData.organizer_id)
          .single();

        if (organizerError) {
          console.error('Error fetching organizer:', organizerError);
          setOrganizer(null);
        } else if (organizerData) {
          // Map user_id to display name
          const organizerName = (() => {
            const userId = organizerData.user_id;
            if (userId === '89399734-8615-4506-a734-e6488738b165') {
              return 'Allan Bronzatto';
            }
            return 'Organizador do Evento';
          })();

          setOrganizer({
            id: organizerData.id,
            user_id: organizerData.user_id,
            type: organizerData.type,
            created_at: organizerData.created_at,
            name: organizerName,
          });
        }

        // Check if user is registered
        if (userProfile?.id) {
          const { data: registrationData, error: registrationError } =
            await supabase
              .from('registrations')
              .select('id')
              .eq('user_id', userProfile.id)
              .eq('event_id', eventId)
              .eq('status', 'confirmed')
              .maybeSingle();

          if (registrationError) {
            console.error('Error checking registration:', registrationError);
          } else {
            setIsRegistered(!!registrationData);
          }
        } else {
          setIsRegistered(false);
        }

        // Fetch reviews for this event with user information
        // Try to use the view first, fallback to direct query
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews_with_users')
          .select('*')
          .eq('event_id', eventId)
          .order('review_date', { ascending: false });

        if (reviewsError) {
          // Fallback to direct reviews query if view doesn't exist
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('reviews')
            .select('*')
            .eq('event_id', eventId)
            .order('review_date', { ascending: false });

          if (fallbackError) {
            console.error('Error fetching reviews:', fallbackError);
            setReviews([]);
          } else if (fallbackData) {
            const mappedReviews: Review[] = fallbackData.map((review: any) => ({
              id: review.id,
              user_id: review.user_id,
              event_id: review.event_id,
              rating: review.rating,
              comment: review.comment,
              review_date: review.review_date,
            }));
            setReviews(mappedReviews);
          }
        } else if (reviewsData) {
          // Map reviews from view
          const mappedReviews: Review[] = reviewsData.map((review: any) => ({
            id: review.id,
            user_id: review.user_id,
            event_id: review.event_id,
            rating: review.rating,
            comment: review.comment,
            review_date: review.review_date,
            user_name: review.user_display_name,
          }));

          setReviews(mappedReviews);
        }
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Erro ao buscar evento');
        setEvent(null);
        setOrganizer(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    },
    [userProfile?.id]
  );

  // Toggle registration
  const toggleRegistration = useCallback(
    async (eventId: string) => {
      if (!userProfile?.id) {
        console.error('User profile not found');
        return;
      }

      try {
        // Check current registration status
        const { data: registrationData, error: checkError } = await supabase
          .from('registrations')
          .select('id')
          .eq('user_id', userProfile.id)
          .eq('event_id', eventId)
          .eq('status', 'confirmed')
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        const currentlyRegistered = !!registrationData;

        if (currentlyRegistered) {
          // Cancel registration
          const { error: deleteError } = await supabase
            .from('registrations')
            .delete()
            .eq('user_id', userProfile.id)
            .eq('event_id', eventId);

          if (deleteError) {
            throw deleteError;
          }

          setIsRegistered(false);
        } else {
          // Create registration
          const { error: insertError } = await supabase
            .from('registrations')
            .insert({
              user_id: userProfile.id,
              event_id: eventId,
              status: 'confirmed',
            });

          if (insertError) {
            throw insertError;
          }

          setIsRegistered(true);
        }
      } catch (err: any) {
        console.error('Error toggling registration:', err);
        // Revert by refetching
        if (eventId) {
          await fetchEvent(eventId);
        }
        throw err;
      }
    },
    [userProfile?.id, fetchEvent]
  );

  return {
    events,
    loading,
    error,
    favorites,
    getEvents,
    toggleFavorite,
    isFavorite,
    refreshEvents,
    // Event detail returns
    event,
    organizer,
    reviews,
    isRegistered,
    fetchEvent,
    toggleRegistration,
  };
}
