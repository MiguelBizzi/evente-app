import CategoryChip from '@/components/CategoryChip';
import EventCard from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';
import { EventCategory } from '@/types/events';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | 'all' | null
  >('all');

  const {
    events,
    loading,
    error,
    getEvents,
    toggleFavorite,
    isFavorite,
  } = useEvents();

  // Filter events by category
  const filteredEvents = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      return events;
    }
    return events.filter((event) => event.category === selectedCategory);
  }, [events, selectedCategory]);

  // Fetch events when category changes
  useEffect(() => {
    getEvents(selectedCategory);
  }, [selectedCategory, getEvents]);

  const handleCategoryPress = (category: EventCategory | 'all') => {
    if (selectedCategory === category) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(category);
    }
  };

  const handleEventPress = (eventId: string) => {
    // Placeholder: navegará para tela de detalhes no futuro
    console.log('Event pressed:', eventId);
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
              <Text className="mb-3 text-xl font-semibold text-[#19191f]">
                Categorias em Destaque
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <TouchableOpacity
                  onPress={() => handleCategoryPress('all')}
                  className={`rounded-full px-3.5 py-1.5 ${
                    selectedCategory === 'all'
                      ? 'bg-[#9076f3]'
                      : 'bg-[#e1dfec]'
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
            <View className="mb-4 mt-7 px-5">
              <Text className="text-base font-bold text-[#19191f]">
                Eventos Recomendados
              </Text>
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
