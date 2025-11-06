import { useEvents, type Review } from '@/hooks/useEvents';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Helper function to get avatar URL based on user name
const getAvatarUrl = (userName: string) => {
  const userNameLower = userName.toLowerCase();
  if (userNameLower.includes('ana')) {
    return 'https://i.pravatar.cc/40?img=11';
  } else if (userNameLower.includes('carlos')) {
    return 'https://i.pravatar.cc/40?img=12';
  } else if (userNameLower.includes('beatriz')) {
    return 'https://i.pravatar.cc/40?img=14';
  }
  return 'https://i.pravatar.cc/40?img=1';
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    event,
    organizer,
    reviews,
    isRegistered,
    loading,
    error,
    fetchEvent,
    toggleRegistration,
  } = useEvents();

  // Fetch event when id changes
  React.useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id, fetchEvent]);

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegistrationPress = async () => {
    if (!event?.id) return;
    try {
      await toggleRegistration(event.id);
    } catch (error) {
      console.error('Error toggling registration:', error);
    }
  };

  const handleViewRegistrationPress = () => {
    // Placeholder: navegará para tela de detalhes da inscrição no futuro
    // router.push(`/event/${event?.id}/registration`);
    console.log('Ver inscrição para o evento:', event?.id);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9076f3" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="mb-4 text-center text-lg font-semibold text-[#19191f]">
          Erro ao carregar evento
        </Text>
        <Text className="mb-4 text-center text-[#565d6d]">
          {error || 'Evento não encontrado'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-md bg-[#9076f3] px-5 py-2.5"
        >
          <Text className="font-semibold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative h-[220px]">
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

          {/* Overlay with gradient */}
          <View style={StyleSheet.absoluteFill} className="justify-start">
            <View
              className="absolute left-0 right-0 top-0 p-4"
              style={{
                backgroundColor: 'rgba(0,0,0,0)',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
                className="h-[220px]"
              />
              <View className="relative z-10 ">
                <Text className="mb-2 text-2xl font-bold text-white">
                  {event.title}
                </Text>
                <View className="mt-2 gap-2">
                  <View className="flex-row items-center gap-2">
                    <Calendar size={18} color="white" opacity={0.9} />
                    <Text className="text-white opacity-90">
                      {formatDateFull(event.event_date)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Clock size={18} color="white" opacity={0.9} />
                    <Text className="text-white opacity-90">
                      {formatTime(event.event_date)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MapPin size={18} color="white" opacity={0.9} />
                    <Text className="text-white opacity-90">
                      {event.location}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Sobre o Evento Card */}
        <View className="bg-white px-4 pt-4">
          <Text className="mb-2.5 text-xl font-bold text-[#19191f]">
            Sobre o Evento
          </Text>
          <Text className="leading-[22px] text-[#565d6d]">
            {event.description || 'Sem descrição disponível.'}
          </Text>
        </View>

        {/* Organizador Card */}
        {organizer && (
          <View className="bg-white p-4 pt-6">
            <Text className="mb-4 text-xl font-bold text-[#19191f]">
              Organizador
            </Text>
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 rounded-full bg-gray-300" />
              <View className="flex-1">
                <Text className="mb-1 text-[15px] font-semibold text-[#19191f]">
                  {organizer.name || 'Organizador do Evento'}
                </Text>
                <Text className="text-sm text-[#565d6d]">
                  {organizer.created_at
                    ? `Promovendo experiências únicas e eventos comunitários desde ${new Date(
                        organizer.created_at
                      ).getFullYear()}.`
                    : 'Promovendo experiências únicas e eventos comunitários.'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="mx-4 mb-5 mt-5 gap-2.5">
          {isRegistered ? (
            <>
              <TouchableOpacity
                onPress={handleViewRegistrationPress}
                className="w-full items-center rounded-md bg-[#9076f3] py-3.5"
              >
                <Text className="text-base font-semibold text-white">
                  Ver Inscrição
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRegistrationPress}
                className="w-full items-center rounded-md border border-[#9076f3] bg-transparent py-3.5"
              >
                <Text className="text-base font-semibold text-[#9076f3]">
                  Cancelar Inscrição
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleRegistrationPress}
              className="w-full items-center rounded-md bg-[#9076f3] py-3.5"
            >
              <Text className="text-base font-semibold text-white">
                Inscrever-se
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reviews Section */}
        <View className="px-4 pb-8">
          <View className="mb-3 ">
            <Text className="text-xl font-bold text-[#19191f]">Avaliações</Text>
          </View>

          {reviews && reviews.length > 0 ? (
            reviews.map((review: Review) => {
              const userName = review.user_name || 'Usuário';
              const avatarUrl = getAvatarUrl(userName);
              return (
                <View
                  key={review.id}
                  className="bg-gray-[#FAFAFBFF] mb-3.5 rounded-sm p-4"
                >
                  <View className="mb-2 flex-row items-center gap-2.5">
                    <Image
                      source={{ uri: avatarUrl }}
                      className="h-9 w-9 rounded-full"
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-[#19191f]">
                        {userName}
                      </Text>
                      <Text className="mt-1 text-[13px] text-[#f5c518]">
                        {renderStars(review.rating)}
                      </Text>
                    </View>
                  </View>
                  <Text className="leading-[22px] text-[#565d6d]">
                    {review.comment || 'Sem comentário.'}
                  </Text>
                </View>
              );
            })
          ) : (
            <View className="bg-white p-4">
              <Text className="text-center text-sm text-[#565d6d]">
                Ainda não há avaliações para este evento.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
