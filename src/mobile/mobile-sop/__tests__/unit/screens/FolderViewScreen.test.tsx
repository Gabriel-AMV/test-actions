import React from 'react';
import { render, screen, cleanup } from '@testing-library/react-native';
import { FolderViewScreen } from '@screens/FolderViewScreen';
import { useFolderContents } from '@hooks/useFolders';
import { RootStackScreenProps } from '@app-types/navigation';

// Mock the hook
jest.mock('@hooks/useFolders');
jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('FolderViewScreen', () => {
  const mockPush = jest.fn();
  const mockGoBack = jest.fn();
  const mockCanGoBack = jest.fn();

  const mockNavigation = {
    push: mockPush,
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  } as unknown as RootStackScreenProps<'FolderView'>['navigation'];

  const mockRoute: RootStackScreenProps<'FolderView'>['route'] = {
    params: { folderId: 1, folderName: 'Test Folder' },
  } as RootStackScreenProps<'FolderView'>['route'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render loading state', () => {
    (useFolderContents as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<FolderViewScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Test Folder')).toBeTruthy();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should render error state', () => {
    (useFolderContents as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    render(<FolderViewScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Test Folder')).toBeTruthy();
    expect(screen.getByText('Error loading folder contents')).toBeTruthy();
    expect(screen.getByText(/Network error/)).toBeTruthy();
  });

  it('should render empty folder', () => {
    (useFolderContents as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<FolderViewScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Test Folder')).toBeTruthy();
    expect(screen.getByText('This folder is empty')).toBeTruthy();
  });

  it('should render folders and files', () => {
    const mockData = [
      { id: 1, name: 'Subfolder', type: 'folder' as const },
      { id: 2, name: 'Document.pdf', type: 'file' as const, size: 1024000 },
      { id: 3, name: 'Image.jpg', type: 'file' as const, size: 512000 },
    ];

    (useFolderContents as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<FolderViewScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Test Folder')).toBeTruthy();
    expect(screen.getByText('Subfolder')).toBeTruthy();
    expect(screen.getByText('Document.pdf')).toBeTruthy();
    expect(screen.getByText('Image.jpg')).toBeTruthy();

    // Check file sizes are formatted
    expect(screen.getByText('1000 KB')).toBeTruthy();
    expect(screen.getByText('500 KB')).toBeTruthy();
  });

  it('should show back button when navigation can go back', () => {
    mockCanGoBack.mockReturnValue(true);

    (useFolderContents as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<FolderViewScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('← Back')).toBeTruthy();
  });

  it('should not show back button when navigation cannot go back', () => {
    mockCanGoBack.mockReturnValue(false);

    (useFolderContents as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<FolderViewScreen navigation={mockNavigation} route={mockRoute} />);

    expect(screen.queryByText('← Back')).toBeNull();
  });

  it('should use "Root" as default folder name when not provided', () => {
    const routeWithoutParams = { params: {} } as RootStackScreenProps<'FolderView'>['route'];

    (useFolderContents as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<FolderViewScreen navigation={mockNavigation} route={routeWithoutParams} />);

    expect(screen.getByText('Root')).toBeTruthy();
  });
});
