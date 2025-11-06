import { useRouter } from 'expo-router';
import { ArrowLeft, User } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
  avatarUrl?: string;
  showBackButton?: boolean;
}

export default function Header({
  title = 'Home',
  avatarUrl,
  showBackButton = false,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAvatarPress = () => {
    // Placeholder: navegará para tela de perfil no futuro
    // router.push('/profile');
  };

  return (
    <View
      className="flex-row items-center border-b border-[#e0e0e0] bg-white px-5"
      style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
    >
      <View>
        {showBackButton ? (
          <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2">
            <ArrowLeft size={20} color="#19191f" />
          </TouchableOpacity>
        ) : null}
      </View>
      <View className="flex-1 items-center">
        <Text className="text-lg font-medium text-[#19191f]">{title}</Text>
      </View>
      <View className="flex-row justify-end">
        <TouchableOpacity
          onPress={handleAvatarPress}
          className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-200"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-full w-full"
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
