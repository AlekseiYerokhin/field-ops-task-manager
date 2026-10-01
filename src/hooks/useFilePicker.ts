import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

export interface PickedFile {
  uri: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export function useFilePicker() {
  const pickImage = async (): Promise<PickedFile | null> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to attach images.'
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          fileName: asset.fileName || 'image.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
        };
      }

      return null;
    } catch {
      Alert.alert('Error', 'Failed to pick image');
      return null;
    }
  };

  const pickVideo = async (): Promise<PickedFile | null> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to attach videos.'
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          fileName: asset.fileName || 'video.mp4',
          mimeType: asset.mimeType || 'video/mp4',
          size: asset.fileSize || 0,
        };
      }

      return null;
    } catch {
      Alert.alert('Error', 'Failed to pick video');
      return null;
    }
  };

  const pickDocument = async (): Promise<PickedFile | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType || inferMimeType(asset.name || asset.uri);
      return {
        uri: asset.uri,
        fileName: asset.name || 'document',
        mimeType,
        size: asset.size || 0,
      };
    } catch {
      Alert.alert('Error', 'Failed to pick document');
      return null;
    }
  };

  const takePhoto = async (): Promise<PickedFile | null> => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          fileName: asset.fileName || 'photo.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
        };
      }

      return null;
    } catch {
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  };

  return { pickImage, pickVideo, pickDocument, takePhoto };
}

function inferMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'mp4':
      return 'video/mp4';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}
