import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { RootStackScreenProps } from '@app-types/navigation';
import { logger } from '@utils/logger';

type Props = RootStackScreenProps<'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    logger.info('Login attempt', { username });

    // Set user context in Sentry
    Sentry.setUser({
      username: username,
      // In real app, add: id, email after authentication
    });

    // Add authentication breadcrumb
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'User logged in',
      level: 'info',
      data: {
        username,
      },
    });

    // TODO: Implement actual authentication logic
    navigation.replace('FolderView', { folderId: undefined, folderName: 'Root' });
  };

  const handleTestDeepLink = async () => {
    const deepLinkUrl = 'com.eprod.mobile-sop://oauth/callback';

    try {
      logger.info('Attempting to open deep link', { url: deepLinkUrl });

      // Try to open the URL directly without canOpenURL check
      // canOpenURL may return false in dev mode even if the app is installed
      await Linking.openURL(deepLinkUrl);
      logger.info('Deep link opened successfully', { url: deepLinkUrl });
      Alert.alert('Success', 'Deep link triggered! Check if the other app opened.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Error',
        `Failed to open deep link.\n\nError: ${errorMessage}\n\nNote: In Expo dev mode, you may need to build a standalone app for deep links to work properly.`
      );
      logger.error('Deep link error', { url: deepLinkUrl, error: errorMessage });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={handleTestDeepLink}>
        <Text style={styles.buttonText}>Test Deep Link</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  testButton: {
    backgroundColor: '#34C759',
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
});
