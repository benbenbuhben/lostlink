import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, Platform } from 'react-native';
import { Button, Card, Text, TextInput, Portal, Snackbar, Appbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import RequireAuth from '@/components/RequireAuth';

interface ItemResponse {
  _id: string;
  title: string;
  location: string;
  description?: string;
  imageUrl?: string;
  performance?: {
    uploadTime: number;
    totalResponseTime: number;
  };
}

function ReportScreen() {
  const { postForm } = useApi();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);

  const pickImageWeb = async () => {
    try {
      console.log('🌐 Web image picker');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('🌐 Web picker result:', result);

      if (!result.canceled && result.assets?.[0]) {
        setImage(result.assets[0]);
        console.log('✅ Web image selected');
        setSnackMessage('Photo selected!');
        setShowSnack(true);
      }
    } catch (error) {
      console.error('❌ Web image picker error:', error);
      setSnackMessage('Failed to select image');
      setShowSnack(true);
    }
  };

  const showImagePicker = () => {
    if (Platform.OS === 'web') {
      // 웹에서는 바로 이미지 라이브러리 열기
      pickImageWeb();
      return;
    }

    // 모바일에서는 카메라/갤러리 선택 Alert
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo of the item',
      [
        {
          text: 'Photo Library',
          onPress: async () => {
            console.log('📸 Photo Library selected');

            try {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              console.log('📸 Permission result:', permissionResult);

              if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
              });

              console.log('📸 Image picker result:', result);

              if (!result.canceled && result.assets?.[0]) {
                setImage(result.assets[0]);
                console.log('✅ Image set successfully');
                setSnackMessage('Photo selected!');
                setShowSnack(true);
              }
            } catch (error) {
              console.error('❌ Photo library error:', error);
              Alert.alert('Error', 'Failed to open photo library');
            }
          }
        },
        {
          text: 'Camera',
          onPress: async () => {
            console.log('📷 Camera selected');

            try {
              const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
              console.log('📷 Camera permission:', permissionResult);

              if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
              });

              console.log('📷 Camera result:', result);

              if (!result.canceled && result.assets?.[0]) {
                setImage(result.assets[0]);
                console.log('✅ Photo taken successfully');
                setSnackMessage('Photo taken!');
                setShowSnack(true);
              }
            } catch (error) {
              console.error('❌ Camera error:', error);
              Alert.alert('Error', 'Failed to open camera');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  function showSuccessDialog(title: string, message: string, onView: () => void, onAnother: () => void) {
    if (Platform.OS === 'web') {
      // Web: use Snackbar
      setSnackMessage(message);
      setShowSnack(true);
    } else {
      // Native: regular Alert sheet
      Alert.alert(
        title,
        message,
        [
          { text: 'Report Another', onPress: onAnother },
          { text: 'View Item', onPress: onView },
        ],
        { cancelable: false }
      );
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setSnackMessage('Please login to report items.');
      setShowSnack(true);
      return;
    }

    // Validation
    if (!title.trim()) {
      setSnackMessage('Please enter a title for the item.');
      setShowSnack(true);
      return;
    }

    if (title.trim().length < 3) {
      setSnackMessage('Title should be at least 3 characters long.');
      setShowSnack(true);
      return;
    }

    if (!location.trim()) {
      setSnackMessage('Please enter where you found the item.');
      setShowSnack(true);
      return;
    }

    if (location.trim().length < 3) {
      setSnackMessage('Location should be at least 3 characters long.');
      setShowSnack(true);
      return;
    }

    try {
      setSubmitting(true);
      const startTime = Date.now();

      console.log('📤 Submitting item report...');

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('location', location.trim());

      if (description.trim()) {
        formData.append('description', description.trim());
      }

      if (image) {
        const imageUri = image.uri;
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        let fileForForm: any;

        if (Platform.OS === 'web') {
          // Convert the blob: URI to a real File so the browser can send it
          const fetched = await fetch(imageUri);
          const blob = await fetched.blob();
          fileForForm = new File([blob], filename, { type });
        } else {
          // Native (iOS / Android) still uses the RN-style object
          fileForForm = { uri: imageUri, name: filename, type };
        }

        formData.append('image', fileForForm);
        console.log('📷 Including image:', { filename, type });
      }

      const response = await postForm<ItemResponse>('/items', formData);

      const responseTime = Date.now() - startTime;
      console.log(`✅ Item submitted successfully in ${responseTime}ms`);

      // Success handling with performance info
      const performance = response.performance;
      const successMessage = `Item reported successfully!\n\n` +
        `📝 Title: ${response.title}\n` +
        `📍 Location: ${response.location}\n` +
        `⚡ Upload time: ${responseTime}ms\n` +
        `${performance?.uploadTime ? `🖼️ Image processing: ${performance.uploadTime}ms\n` : ''}` +
        `\nYour item is now visible to others who might be looking for it.`;

      showSuccessDialog(
        '🎉 Success!',
        successMessage,
        () => router.push(`/item/${response._id}`),
        () => {
          setTitle('');
          setLocation('');
          setDescription('');
          setImage(null);
        }
      );

    } catch (error) {
      console.error('Failed to submit item:', error);

      let errorMessage = 'Failed to report item. Please try again.';

      if (error instanceof Error) {
        if (error.message?.includes('401')) {
          errorMessage = 'Please login to report items.';
        } else if (error.message?.includes('413')) {
          errorMessage = 'Image file is too large. Please choose a smaller image.';
        } else if (error.message?.includes('400')) {
          errorMessage = 'Please check your input and try again.';
        }
      }

      setSnackMessage(errorMessage);
      setShowSnack(true);
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const isFormValid = title.trim().length >= 3 && location.trim().length >= 3;

  return (
    <RequireAuth>
      <View style={styles.outerContainer}>
        <Appbar.Header>
          <Appbar.Content title="Report Found Item" />
          <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" />
        </Appbar.Header>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.heading}>
                Report Found Item
              </Text>

              <Text variant="bodyMedium" style={styles.subtitle}>
                Help someone recover their lost belongings by reporting what you found.
              </Text>

              {/* Image Section */}
              <View style={styles.imagePicker}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Photo (Optional)
                </Text>

                {image ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.preview}
                      accessibilityLabel="Selected image preview"
                    />
                    <View style={styles.imageActions}>
                      <Button
                        mode="outlined"
                        onPress={showImagePicker}
                        style={styles.imageButton}
                        icon="camera"
                        accessibilityLabel="Change photo"
                      >
                        Change
                      </Button>
                      <Button
                        mode="text"
                        onPress={removeImage}
                        style={styles.imageButton}
                        icon="delete"
                        accessibilityLabel="Remove photo"
                      >
                        Remove
                      </Button>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.imagePlaceholder}
                    onPress={showImagePicker}
                    accessibilityLabel="Add photo of the item"
                    accessibilityRole="button"
                  >
                    <Text style={styles.placeholderIcon}>📷</Text>
                    <Text variant="bodyMedium" style={styles.placeholderText}>
                      Tap to add a photo
                    </Text>
                    <Text variant="bodySmall" style={styles.placeholderSubtext}>
                      Photos help owners identify their items
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Form Fields */}
              <TextInput
                label="Item Title*"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholder="e.g., Black iPhone 14, Blue Backpack, Car Keys"
                maxLength={100}
                accessibilityLabel="Enter item title"
                testID="title-input"
              />

              <TextInput
                label="Where did you find it?*"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                placeholder="e.g., Library 2nd floor, Cafeteria table 12, Gym locker room"
                maxLength={100}
                accessibilityLabel="Enter location where item was found"
                testID="location-input"
              />

              <TextInput
                label="Description (Optional)"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                placeholder="Add any additional details that might help the owner identify their item..."
                maxLength={500}
                accessibilityLabel="Enter item description"
                testID="description-input"
              />

              {/* Character counters */}
              <View style={styles.counters}>
                <Text variant="bodySmall" style={styles.counter}>
                  Title: {title.length}/100
                </Text>
                <Text variant="bodySmall" style={styles.counter}>
                  Location: {location.length}/100
                </Text>
                <Text variant="bodySmall" style={styles.counter}>
                  Description: {description.length}/500
                </Text>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || !isFormValid}
                style={[styles.submit, !isFormValid && styles.submitDisabled]}
                icon="upload"
                accessibilityLabel="Submit item report"
                testID="submit-button"
              >
                {submitting ? 'Submitting...' : 'Report Item'}
              </Button>

              {/* Help text */}
              <Text variant="bodySmall" style={styles.helpText}>
                * Required fields. Your report will be visible to other users immediately.
              </Text>
            </Card.Content>
          </Card>

          {/* Tips Card */}
          <Card style={styles.tipsCard} elevation={1}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.tipsTitle}>
                💡 Reporting Tips
              </Text>

              <Text variant="bodySmall" style={styles.tipItem}>
                • Be specific with the title (brand, color, type)
              </Text>
              <Text variant="bodySmall" style={styles.tipItem}>
                • Include exact location details
              </Text>
              <Text variant="bodySmall" style={styles.tipItem}>
                • Add photos for better identification
              </Text>
              <Text variant="bodySmall" style={styles.tipItem}>
                • Check if the item has any unique markings
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Snackbar for messages */}
        <Portal>
          <Snackbar
            visible={showSnack}
            onDismiss={() => setShowSnack(false)}
            duration={4000}
            action={{
              label: 'Dismiss',
              onPress: () => setShowSnack(false),
            }}
          >
            {snackMessage}
          </Snackbar>
        </Portal>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  heading: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#444',
  },
  imagePicker: {
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    minWidth: 100,
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontWeight: '500',
    marginBottom: 4,
    color: '#666',
  },
  placeholderSubtext: {
    color: '#888',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  counters: {
    marginBottom: 20,
    gap: 4,
  },
  counter: {
    color: '#888',
    textAlign: 'right',
  },
  submit: {
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 4,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  helpText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tipsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tipItem: {
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default ReportScreen; 