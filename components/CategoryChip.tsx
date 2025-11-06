import { categoryLabels } from '@/lib/mockData';
import { EventCategory } from '@/types/events';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface CategoryChipProps {
  category: EventCategory;
  isActive: boolean;
  onPress: () => void;
}

export default function CategoryChip({
  category,
  isActive,
  onPress,
}: CategoryChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full px-3.5 py-1.5 ${
        isActive ? 'bg-[#9076f3]' : 'bg-[#e1dfec]'
      }`}
    >
      <Text className={`${isActive ? 'text-white' : 'text-[#19191f]'}`}>
        {categoryLabels[category]}
      </Text>
    </TouchableOpacity>
  );
}
