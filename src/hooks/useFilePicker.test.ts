import { renderHook, act } from '@testing-library/react-native';
import { useFilePicker } from './useFilePicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

jest.mock('expo-image-picker');
jest.mock('expo-document-picker');

const mockedImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockedDocumentPicker = DocumentPicker as jest.Mocked<typeof DocumentPicker>;

describe('useFilePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pickImage', () => {
    it('returns null when permission is denied', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
        status: 'denied',
        expires: 'never',
      } as any);

      const { result } = await renderHook(() => useFilePicker());
      const file = await act(() => result.current.pickImage());

      expect(file).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Permission Required', expect.any(String));
    });

    it('returns image data when successful', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted',
        expires: 'never',
      } as any);
      mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///image.jpg',
            fileName: 'image.jpg',
            mimeType: 'image/jpeg',
            fileSize: 123,
          },
        ],
      } as any);

      const { result } = await renderHook(() => useFilePicker());
      const file = await act(() => result.current.pickImage());

      expect(file).toEqual({
        uri: 'file:///image.jpg',
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 123,
      });
    });
  });

  describe('pickVideo', () => {
    it('returns video data when successful', async () => {
      mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted',
        expires: 'never',
      } as any);
      mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///video.mp4',
            fileName: 'video.mp4',
            mimeType: 'video/mp4',
            fileSize: 456,
          },
        ],
      } as any);

      const { result } = await renderHook(() => useFilePicker());
      const file = await act(() => result.current.pickVideo());

      expect(file).toEqual({
        uri: 'file:///video.mp4',
        fileName: 'video.mp4',
        mimeType: 'video/mp4',
        size: 456,
      });
    });
  });

  describe('pickDocument', () => {
    it('returns null when user cancels', async () => {
      mockedDocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: true,
        assets: null,
      } as any);

      const { result } = await renderHook(() => useFilePicker());
      const file = await act(() => result.current.pickDocument());

      expect(file).toBeNull();
    });

    it('returns PDF document data when successful', async () => {
      mockedDocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///doc.pdf',
            name: 'doc.pdf',
            mimeType: 'application/pdf',
            size: 789,
          },
        ],
      } as any);

      const { result } = await renderHook(() => useFilePicker());
      const file = await act(() => result.current.pickDocument());

      expect(file).toEqual({
        uri: 'file:///doc.pdf',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        size: 789,
      });
    });

    it('infers mime type when not provided', async () => {
      mockedDocumentPicker.getDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///doc.pdf',
            name: 'doc.pdf',
            size: 789,
          },
        ],
      } as any);

      const { result } = await renderHook(() => useFilePicker());
      const file = await act(() => result.current.pickDocument());

      expect(file?.mimeType).toBe('application/pdf');
    });
  });

  describe('takePhoto', () => {
    it('returns photo data when successful', async () => {
      mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted',
        expires: 'never',
      } as any);
      mockedImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///photo.jpg',
            fileName: 'photo.jpg',
            mimeType: 'image/jpeg',
            fileSize: 111,
          },
        ],
      } as any);

      const { result } = await renderHook(() => useFilePicker());
      const file = await act(() => result.current.takePhoto());

      expect(file).toEqual({
        uri: 'file:///photo.jpg',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 111,
      });
    });
  });
});
