import { renderHook, act } from '@testing-library/react-native';
import { useImagePicker } from './useImagePicker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Mock expo-image-picker
jest.mock('expo-image-picker');

const mockedImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('useImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pickImage', () => {
    it('returns null when permission is denied', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
        status: 'denied' as any,
        expires: 'never',
      });

      const { result } = await renderHook(() => useImagePicker());
      const image = await act(() => result.current.pickImage());

      expect(image).toBeNull();
      expect(mockedImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Permission Required', expect.any(String));
    });

    it('returns null when user cancels', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: null,
      } as any);

      const { result } = await renderHook(() => useImagePicker());
      const image = await act(() => result.current.pickImage());

      expect(image).toBeNull();
    });

    it('returns picked image data when successful', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///test/image.jpg',
            fileName: 'image.jpg',
            mimeType: 'image/jpeg',
            fileSize: 12345,
          },
        ],
      } as any);

      const { result } = await renderHook(() => useImagePicker());
      const image = await act(() => result.current.pickImage());

      expect(image).toEqual({
        uri: 'file:///test/image.jpg',
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 12345,
      });
    });

    it('uses default values when asset metadata is missing', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///test/photo' }],
      } as any);

      const { result } = await renderHook(() => useImagePicker());
      const image = await act(() => result.current.pickImage());

      expect(image).toEqual({
        uri: 'file:///test/photo',
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 0,
      });
    });

    it('shows error alert when picking fails', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchImageLibraryAsync.mockRejectedValue(new Error('Pick failed'));

      const { result } = await renderHook(() => useImagePicker());
      const image = await act(() => result.current.pickImage());

      expect(image).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to pick image');
    });
  });

  describe('takePhoto', () => {
    it('returns null when camera permission is denied', async () => {
      mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
        status: 'denied' as any,
        expires: 'never',
      });

      const { result } = await renderHook(() => useImagePicker());
      const photo = await act(() => result.current.takePhoto());

      expect(photo).toBeNull();
      expect(mockedImagePicker.launchCameraAsync).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Permission Required', expect.any(String));
    });

    it('returns null when user cancels camera', async () => {
      mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: true,
        assets: null,
      } as any);

      const { result } = await renderHook(() => useImagePicker());
      const photo = await act(() => result.current.takePhoto());

      expect(photo).toBeNull();
    });

    it('returns photo data when successful', async () => {
      mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///test/photo.jpg',
            fileName: 'photo.jpg',
            mimeType: 'image/jpeg',
            fileSize: 67890,
          },
        ],
      } as any);

      const { result } = await renderHook(() => useImagePicker());
      const photo = await act(() => result.current.takePhoto());

      expect(photo).toEqual({
        uri: 'file:///test/photo.jpg',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 67890,
      });
    });

    it('uses default values when photo metadata is missing', async () => {
      mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///test/camera' }],
      } as any);

      const { result } = await renderHook(() => useImagePicker());
      const photo = await act(() => result.current.takePhoto());

      expect(photo).toEqual({
        uri: 'file:///test/camera',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 0,
      });
    });

    it('shows error alert when camera fails', async () => {
      mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted' as any,
        expires: 'never',
      });
      mockedImagePicker.launchCameraAsync.mockRejectedValue(new Error('Camera failed'));

      const { result } = await renderHook(() => useImagePicker());
      const photo = await act(() => result.current.takePhoto());

      expect(photo).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to take photo');
    });
  });
});
