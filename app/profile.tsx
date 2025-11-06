import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, Mail, User } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, userProfile, signOut, loading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9076f3" />
      </View>
    );
  }

  const userName =
    user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <View className="flex-1 bg-white">
      <Header title="Perfil" showBackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Profile Section */}
        <View className="items-center px-5 pb-6 pt-8">
          <View className="mb-4 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <User size={48} color="#565d6d" />
            )}
          </View>
          <Text className="mb-1 text-2xl font-bold text-[#19191f]">
            {userName}
          </Text>
        </View>

        {/* Info Cards */}
        <View className="px-5">
          {/* Email Card */}
          <View className="mb-4 bg-white p-4">
            <View className="mb-2 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#ece8ff]">
                <Mail size={20} color="#9076f3" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs text-[#565d6d]">Email</Text>
                <Text className="text-base font-medium text-[#19191f]">
                  {userEmail}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Type Card */}
          {userProfile && (
            <View className="mb-4 bg-white p-4">
              <View className="mb-2 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#ece8ff]">
                  <User size={20} color="#9076f3" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-[#565d6d]">
                    Tipo de Perfil
                  </Text>
                  <Text className="text-base font-medium text-[#19191f]">
                    {userProfile.type === 'organizer'
                      ? 'Organizador'
                      : 'Participante'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View className="mt-auto px-5 pt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 py-4"
          >
            <LogOut size={20} color="#dc2626" />
            <Text className="text-base font-semibold text-red-600">Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
