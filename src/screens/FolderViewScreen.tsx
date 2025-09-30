import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '@app-types/navigation';
import { logger } from '@utils/logger';
import { useFolderContents } from '@hooks/useFolders';
import * as Sentry from '@sentry/react-native';

type Props = RootStackScreenProps<'FolderView'>;

export const FolderViewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { folderId, folderName = 'Root' } = route.params || {};

  // Fetch folder contents from API and save to SQLite
  const { data: items, isLoading, error } = useFolderContents(folderId);

  const handleItemPress = (item: { id: number; name: string; type: 'folder' | 'file' }) => {
    if (item.type === 'folder') {
      logger.info('Navigating to folder', { folderId: item.id, folderName: item.name });
      navigation.push('FolderView', { folderId: item.id, folderName: item.name });
    } else {
      logger.info('Opening file', { fileId: item.id, fileName: item.name });
      // TODO: Implement file opening logic
    }
  };

  const renderItem = ({
    item,
  }: {
    item: { id: number; name: string; type: 'folder' | 'file'; size?: number; mime_type?: string };
  }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item)}>
      <Text style={styles.icon}>{item.type === 'folder' ? '📁' : '📄'}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.type === 'file' && item.size && (
          <Text style={styles.itemSize}>{formatFileSize(item.size)}</Text>
        )}
      </View>
      {item.type === 'folder' && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{folderName}</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{folderName}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error loading folder contents</Text>
          <Text style={styles.errorDetail}>{String(error)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{folderName}</Text>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>

      <View>
        <Button
          title="Try!"
          onPress={() => {
            console.log('presed');
            Sentry.captureException(new Error('Second error and another'));
          }}
        />
      </View>
      <FlatList
        data={items || []}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>This folder is empty</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 10) / 10} ${sizes[i]}`;
}

const styles = StyleSheet.create({
  arrow: {
    color: '#999',
    fontSize: 24,
  },
  backButton: {
    marginTop: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  errorDetail: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  header: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    padding: 20,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 2,
  },
  itemSize: {
    color: '#666',
    fontSize: 12,
  },
  list: {
    padding: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
