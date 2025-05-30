import * as React from 'react';
import { View, StyleSheet, Image, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import RequireAuth from '@/components/RequireAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

function getApiUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5001';
  if (Platform.OS === 'web') return envUrl;

  const debuggerHost = Constants.manifest?.debuggerHost?.split(':').shift();
  if (debuggerHost && envUrl.includes('localhost')) {
    return `http://${debuggerHost}:5001`;
  }
  return envUrl;
}

function ReportScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [snackVisible, setSnackVisible] = React.useState(false);

  async function pickImage() {
    if (submitting) return;
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Camera roll permission is needed to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function handleSubmit() {
    if (!title || !location) {
      Alert.alert('Validation', 'Title and location are required.');
      return;
    }
    if (!image) {
      Alert.alert('Validation', 'Please select an image.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('location', location);
      formData.append('description', description);
      if (Platform.OS === 'web') {
        // Expo web: use the actual File object
        // @ts-ignore
        formData.append('image', (image as any).file);
      } else {
        formData.append('image', {
          uri: image.uri,
          name: image.fileName ?? `photo.${image.uri.split('.').pop()}`,
          type: image.mimeType ?? 'image/jpeg',
        } as any);
      }

      const res = await fetch(`${getApiUrl()}/items`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to submit item');
      }
      setTitle('');
      setLocation('');
      setDescription('');
      setImage(null);

      queryClient.invalidateQueries({ queryKey: ['items'] });

      setSnackVisible(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'There was an error submitting the item.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireAuth>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.heading}>
          Report Found Item
        </Text>
        <Button mode="outlined" onPress={pickImage} style={styles.imagePicker}>
          {image ? 'Change Photo' : 'Choose Photo'}
        </Button>
        {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
        <TextInput
          label="Title*"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          label="Location*"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
        <TextInput
          label="Description"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.submit}
        >
          Submit
        </Button>
        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={4000}
          action={{ label: 'Feed', onPress: () => router.push('/') }}
        >
          Item posted!
        </Snackbar>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  heading: {
    marginBottom: 16,
  },
  imagePicker: {
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  submit: {
    marginTop: 8,
  },
});

export default ReportScreen; 