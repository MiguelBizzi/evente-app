import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  avatarUrl?: string;
}

export default function Header({ title = 'Home', avatarUrl }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAvatarPress = () => {
    // Placeholder: navegará para tela de perfil no futuro
    // router.push('/profile');
  };

  return (
    <View
      className="flex-row items-center px-5 bg-white border-b border-[#e0e0e0]"
      style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
    >
      <View className="flex-1" />
      <View className="flex-1 items-center">
        <Text className="text-lg font-medium text-[#19191f]">{title}</Text>
      </View>
      <View className="flex-1 flex-row justify-end">
        <TouchableOpacity
          onPress={handleAvatarPress}
          className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <User size={20} color="#565d6d" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

