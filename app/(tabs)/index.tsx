import CategoryChip from '@/components/CategoryChip';
import EventCard from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';
import { EventCategory } from '@/types/events';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const mainCategories: EventCategory[] = [
  'music',
  'sports',
  'food',
  'art',
  'technology',
  'wellness',
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | 'all' | null
  >('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { events, loading, error, getEvents, toggleFavorite, isFavorite } =
    useEvents();

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter((event) => isFavorite(event.id));
    }

    return filtered;
  }, [events, selectedCategory, showFavoritesOnly, isFavorite]);

  const handleCategoryPress = (category: EventCategory | 'all') => {
    if (selectedCategory === category) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(category);
    }
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleFavoritePress = async (eventId: string) => {
    try {
      await toggleFavorite(eventId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading && events.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9076f3" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="mb-4 text-center text-lg font-semibold text-[#19191f]">
          Erro ao carregar eventos
        </Text>
        <Text className="text-center text-[#565d6d]">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Welcome Section */}
            <View className="px-5 pt-5">
              <Text className="mb-1 text-3xl font-bold text-[#19191f]">
                Olá, Aventureiro!
              </Text>
              <Text className="text-lg text-[#565d6d]">
                Descubra eventos incríveis perto de você.
              </Text>
            </View>

            {/* Categories Section */}
            <View className="mt-7 px-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-xl font-semibold text-[#19191f]">
                  Categorias em Destaque
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <TouchableOpacity
                  onPress={() => handleCategoryPress('all')}
                  className={`rounded-full px-3.5 py-1.5 ${
                    selectedCategory === 'all' ? 'bg-[#9076f3]' : 'bg-[#e1dfec]'
                  }`}
                >
                  <Text
                    className={`${
                      selectedCategory === 'all'
                        ? 'text-white'
                        : 'text-[#19191f]'
                    }`}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>
                {mainCategories.map((category) => (
                  <CategoryChip
                    key={category}
                    category={category}
                    isActive={selectedCategory === category}
                    onPress={() => handleCategoryPress(category)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Events Section Header */}
            <View className="mb-4 mt-7 flex flex-row items-center justify-between px-5">
              <Text className="text-base font-bold text-[#19191f]">
                {showFavoritesOnly
                  ? 'Meus Eventos Favoritos'
                  : 'Eventos Recomendados'}
              </Text>

              <TouchableOpacity
                onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex-row items-center gap-2 rounded-full px-3.5 py-1.5 ${
                  showFavoritesOnly ? 'bg-[#9076f3]' : 'bg-[#e1dfec]'
                }`}
              >
                <Heart
                  size={16}
                  color={showFavoritesOnly ? '#fff' : '#19191f'}
                  fill={showFavoritesOnly ? '#fff' : 'none'}
                />
                <Text
                  className={`text-sm ${
                    showFavoritesOnly ? 'text-white' : 'text-[#19191f]'
                  }`}
                >
                  Favoritos
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <EventCard
              event={item}
              isFavorite={isFavorite(item.id)}
              onPress={() => handleEventPress(item.id)}
              onFavoritePress={() => handleFavoritePress(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center px-5 py-10">
            <Text className="text-center text-[#565d6d]">
              {loading
                ? 'Carregando eventos...'
                : showFavoritesOnly
                  ? 'Você ainda não favoritou nenhum evento.'
                  : 'Nenhum evento encontrado nesta categoria.'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={() => getEvents(selectedCategory)}
      />
    </View>
  );
}
