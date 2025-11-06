import RegisteredEventCard from '@/components/RegisteredEventCard';
import { useEvents } from '@/hooks/useEvents';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function MeusEventosScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { registeredEvents, loading, error, getRegisteredEvents } = useEvents();

  useFocusEffect(
    React.useCallback(() => {
      if (!loading && !isRefreshing) {
        getRegisteredEvents();
        console.log('Screen focused - fetching registered events');
      }

      return () => {};
    }, [loading, isRefreshing, getRegisteredEvents])
  );

  const handleViewDetailsPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleViewRegistrationPress = (eventId: string) => {
    // Placeholder: navegará para tela de detalhes da inscrição no futuro
    // router.push(`/event/${eventId}/registration`);
    console.log('Ver inscrição para o evento:', eventId);
  };

  if (loading && registeredEvents.length === 0) {
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
        data={registeredEvents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="mb-6 px-5 pt-5">
            <Text className="mb-1 text-3xl font-bold text-[#19191f]">
              Meus Eventos
            </Text>
            <Text className="text-lg text-[#565d6d]">
              Eventos que você está inscrito
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <RegisteredEventCard
              event={item}
              onViewDetailsPress={() => handleViewDetailsPress(item.id)}
              onViewRegistrationPress={() =>
                handleViewRegistrationPress(item.id)
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center px-5 py-10">
            <Text className="text-center text-[#565d6d]">
              {loading
                ? 'Carregando eventos...'
                : 'Você ainda não está inscrito em nenhum evento futuro.'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={isRefreshing}
        onRefresh={async () => {
          setIsRefreshing(true);
          await getRegisteredEvents();
          setIsRefreshing(false);
        }}
      />
    </View>
  );
}
