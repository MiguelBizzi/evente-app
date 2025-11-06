import { categoryLabels } from '@/lib/mockData';
import { Event } from '@/types/events';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RegisteredEventCardProps {
  event: Event;
  onViewDetailsPress?: () => void;
  onViewRegistrationPress?: () => void;
}

export default function RegisteredEventCard({
  event,
  onViewDetailsPress,
  onViewRegistrationPress,
}: RegisteredEventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}, ${time}`;
  };

  return (
    <View className="mb-5 overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Image with overlay */}
      <View className="relative h-40">
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-200">
            <Text className="text-sm text-gray-500">Sem imagem</Text>
          </View>
        )}
        {/* Bottom overlay */}
        <View style={StyleSheet.absoluteFill} className="justify-end">
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              backgroundColor: 'transparent',
            }}
          />
          <View className="absolute bottom-0 left-0 right-0 z-10 p-3">
            <Text className="mb-1 text-xl font-bold text-white">
              {event.title}
            </Text>
            <Text className="text-white opacity-90">
              {formatDate(event.event_date)}
            </Text>
          </View>
        </View>
      </View>

      {/* Event info */}
      <View className="p-4">
        <Text className="mb-2 text-[#565d6d]">
          {categoryLabels[event.category]} • {event.location}
        </Text>
        <Text className="mb-4 text-[#19191f]" numberOfLines={2}>
          {event.description || 'Sem descrição disponível.'}
        </Text>

        {/* Actions */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onViewDetailsPress}
            className="flex-1 items-center rounded-md bg-[#9076f3] px-5 py-2.5"
          >
            <Text className="text-[15px] font-semibold text-white">
              Ver Detalhes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onViewRegistrationPress}
            className="flex-1 items-center rounded-md border border-[#9076f3] bg-transparent px-5 py-2.5"
          >
            <Text className="text-[15px] font-semibold text-[#9076f3]">
              Ver Inscrição
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

