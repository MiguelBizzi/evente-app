import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import { useCallback, useState } from 'react';
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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    const { error, session } = await signUp(email, password, name);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao criar conta', error.message);
    } else if (session) {
      // Conta criada e confirmada automaticamente - redireciona para tabs
      router.replace('/(tabs)');
    } else {
      // Caso ainda precise de confirmação (se a configuração não estiver desabilitada)
      Alert.alert('Conta criada!', 'Sua conta foi criada com sucesso.', [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]);
    }
  }

  // Reset inputs when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup: reset inputs when screen loses focus
        setName('');
        setEmail('');
        setPassword('');
        setLoading(false);
      };
    }, [])
  );

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
              Criar conta
            </Text>
            <Text className="text-center text-base leading-6 text-gray-600">
              Preencha os dados abaixo para{'\n'}criar sua conta.
            </Text>
          </View>

          <View className="mb-4">
            <View className="h-14 flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
              <User size={20} color="#9ca3af" style={{ marginRight: 12 }} />
              <TextInput
                className="flex-1 text-base text-gray-900"
                placeholder="Seu nome"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
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
            onPress={handleRegister}
            disabled={loading}
            className="mb-4 h-14 items-center justify-center rounded-xl bg-purple-600"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Criar conta
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            className="mt-2 items-center"
          >
            <Text className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Text className="font-semibold text-purple-600">Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
