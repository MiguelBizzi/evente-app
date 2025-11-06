import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, session, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && session) {
      router.replace('/(tabs)');
    }
  }, [session, authLoading]);

  // Reset inputs when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup: reset inputs when screen loses focus
        setEmail('');
        setPassword('');
        setLoading(false);
      };
    }, [])
  );

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao fazer login', error.message);
    }
  }

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-purple-50">
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center bg-purple-50 px-6">
          <View className="mb-12 items-center">
            <Text className="mb-4 text-4xl font-bold text-gray-900">
              Bem-vindo!
            </Text>
            <Text className="text-center text-base leading-6 text-gray-600">
              Entre na sua conta para explorar{'\n'}eventos locais incríveis.
            </Text>
          </View>

          <View className="mb-4">
            <View className="h-14 flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
              <Mail size={20} color="#9ca3af" style={{ marginRight: 12 }} />
              <TextInput
                className="flex-1 text-base text-gray-900"
                placeholder="Seu e-mail"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View className="mb-6">
            <View className="h-14 flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
              <Lock size={20} color="#9ca3af" style={{ marginRight: 12 }} />
              <TextInput
                className="flex-1 text-base text-gray-900"
                placeholder="Sua senha"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="mb-4 h-14 items-center justify-center rounded-xl bg-purple-600"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            disabled={loading}
            className="mb-4 h-14 items-center justify-center rounded-xl border border-purple-600 bg-white"
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-purple-600">
              Criar conta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Recuperar senha',
                'Funcionalidade em desenvolvimento'
              );
            }}
            className="mt-2 items-center"
          >
            <Text className="text-sm text-purple-600">Esqueceu sua senha?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
