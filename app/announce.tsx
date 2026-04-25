import BarcodeScannerModal from "@/src/components/barcodeScannerModal";
import FloatingLabelInput from "@/src/components/floatingLabelInput";
import OptionChips from "@/src/components/optionChips";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import { useTransition } from "@/src/context/transition-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Modal() {
  const { overlayRef } = useTransition();
  const navigation = useNavigation();
  const MAX_ATTACHMENTS = 5;
  const isLeavingRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);

  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<string | null>>(
    Array.from({ length: MAX_ATTACHMENTS }, () => null),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isLeavingRef.current) {
        return;
      }

      e.preventDefault();

      if (!overlayRef.current) {
        navigation.dispatch(e.data.action);
        return;
      }

      isLeavingRef.current = true;
      overlayRef.current?.playEnter(() => {
        setIsExiting(true);
        requestAnimationFrame(() => {
          navigation.dispatch(e.data.action);
        });
      });
    });
    return unsubscribe;
  }, [navigation, overlayRef]);

  useEffect(() => {
    const timer = setTimeout(() => {
      overlayRef.current?.playExit();
    }, 50);
    return () => clearTimeout(timer);
  }, [overlayRef]);

  function handleClose() {
    router.back();
  }

  function handleAnnounce() {
    const imageAttachments = attachments.filter(Boolean);
    console.log({
      isbn,
      title,
      author,
      synopsis,
      condition,
      price,
      coverImage,
      imageAttachments,
    });
  }

  async function captureImageFromCamera() {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (!cameraPermission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos da câmera para adicionar a foto do livro.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ["images"],
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0].uri;
  }

  async function handlePickCover() {
    const selectedImageUri = await captureImageFromCamera();

    if (!selectedImageUri) {
      return;
    }

    setCoverImage(selectedImageUri);
  }

  function handleRemoveCover() {
    setCoverImage(null);
  }

  async function handlePickAttachment(index: number) {
    const selectedImageUri = await captureImageFromCamera();

    if (!selectedImageUri) {
      return;
    }

    setAttachments((prev) => {
      const next = [...prev];
      next[index] = selectedImageUri;
      return next;
    });
  }

  function handleRemoveAttachment(index: number) {
    setAttachments((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  return (
    <SafeAreaView
      style={[styles.container, isExiting && styles.containerHidden]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScreenHeader
          title="Criar Anúncio"
          onBackPress={handleClose}
          iconName="close"
          iconSize={32}
          iconColor="#6C63FF"
          titleFontFamily="lexendBlack"
          borderBottomColor="#f0f0f0"
          rightPlaceholderWidth={32}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
        >
          {/* Capa do Livro */}
          <View style={styles.inputContainerUp}>
            <Text style={styles.title}>Capa do Livro</Text>
            <TouchableOpacity
              style={styles.coverUploadBox}
              activeOpacity={0.8}
              delayPressIn={130}
              onPress={handlePickCover}
            >
              {coverImage ? (
                <>
                  <Image
                    source={{ uri: coverImage }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeCoverButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      handleRemoveCover();
                    }}
                    hitSlop={8}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={40} color="#6c63ff" />
                  <Text style={styles.uploadText}>
                    Adicionar capa principal
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="ISBN"
              value={isbn}
              onChangeText={setIsbn}
              placeholder="Ex: 978-85-359..."
              placeholderTextColor="#a6a8aa"
              keyboardType="numeric"
              labelStyle={styles.floatingLabel}
              inputStyle={styles.input}
              rightElement={
                <TouchableOpacity
                  style={styles.iconScan}
                  onPress={() => setScannerVisible(true)}
                >
                  <Ionicons name="barcode-outline" size={24} color="#6c63ff" />
                </TouchableOpacity>
              }
            />
            <BarcodeScannerModal
              visible={scannerVisible}
              onClose={() => setScannerVisible(false)}
              onScanned={(code) => setIsbn(code)}
            />
          </View>

          {/* Título */}
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Título do Livro"
              placeholder="Ex: O Senhor dos Anéis"
              placeholderTextColor="#a6a8aa"
              value={title}
              onChangeText={setTitle}
              labelStyle={styles.floatingLabel}
              inputStyle={styles.input}
            />
          </View>

          {/* Autor */}
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Autor(a)"
              placeholder="Ex: J.R.R. Tolkien"
              placeholderTextColor="#a6a8aa"
              value={author}
              onChangeText={setAuthor}
              labelStyle={styles.floatingLabel}
              inputStyle={styles.input}
            />
          </View>

          {/* Sinopse */}
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Descrição / Observações"
              inputStyle={[styles.input, styles.textArea]}
              placeholder="Descreva sobre o livro..."
              placeholderTextColor="#a6a8aa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={synopsis}
              onChangeText={setSynopsis}
              labelStyle={styles.floatingLabel}
            />
          </View>

          {/* Estado do Livro */}
          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>Estado do Livro</Text>
            <View style={styles.boxContainer}>
              <OptionChips
                options={["Novo", "Usado (Bom)", "Com Grifos", "Danificado"]}
                selectedValue={condition}
                onSelect={setCondition}
                containerStyle={styles.chipsContainer}
                chipStyle={styles.chip}
                selectedChipStyle={styles.chipSelected}
                textStyle={styles.chipText}
                selectedTextStyle={styles.chipTextSelected}
              />
            </View>
          </View>

          {/* Valor */}
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Valor (R$)"
              inputStyle={styles.input}
              placeholder="0,00"
              placeholderTextColor="#a6a8aa"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              labelStyle={styles.floatingLabel}
            />
          </View>

          {/* Imagens Adicionais */}
          <View style={styles.inputContainer}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "lexendBold",
                color: "#a6a8aa",
              }}
            >
              {attachments.filter((item) => !item).length} anexos restantes
            </Text>
            <View style={styles.attachmentContainer}>
              <View style={styles.attachmentsRow}>
                {attachments.map((attachmentUri, index) => (
                  <View
                    key={`attachment-${index}`}
                    style={styles.attachmentBox}
                  >
                    {attachmentUri ? (
                      <>
                        <Image
                          source={{ uri: attachmentUri }}
                          style={styles.attachmentImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeAttachmentButton}
                          onPress={() => handleRemoveAttachment(index)}
                          hitSlop={8}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.addAttachmentButton}
                        activeOpacity={0.7}
                        delayPressIn={130}
                        onPress={() => handlePickAttachment(index)}
                      >
                        <Ionicons name="add" size={22} color="#6c63ff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={{ height: 24 }} />

          <PrimaryButton
            style={styles.submitButton}
            onPress={handleAnnounce}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Publicar Anúncio</Text>
          </PrimaryButton>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  containerHidden: {
    opacity: 0,
  },
  title: {
    fontSize: 16,
    color: "#a6a8aa",
    fontFamily: "montserratBold",
    marginVertical: 8,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 2,
  },

  // Estilos do Formulario Sofisticado
  inputContainer: {
    position: "relative",
    marginTop: 20,
  },
  inputContainerUp: {
    alignItems: "center",
    marginVertical: 16,
  },
  floatingLabel: {
    fontSize: 13,
    color: "#6c63ff",
    fontFamily: "lexendBold",
  },
  input: {
    fontFamily: "lexendRegular",
    fontSize: 15,
    color: "#333",
  },

  iconScan: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Outros estilos
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  boxContainer: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    padding: 16,
  },
  coverUploadBox: {
    width: "80%",
    height: 240,
    backgroundColor: "#f0f0ff",
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  removeCoverButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontFamily: "lexendBold",
    color: "#6c63ff",
    marginTop: 8,
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chipSelected: {
    backgroundColor: "#6c63ff",
    borderColor: "#6c63ff",
  },
  chipText: {
    fontFamily: "lexendBold",
    fontSize: 13,
    color: "#777",
  },
  chipTextSelected: {
    color: "#fff",
  },
  attachmentsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attachmentContainer: {
    marginVertical: 12,
    width: "100%",
  },
  attachmentBox: {
    width: "18%",
    aspectRatio: 0.78,
    backgroundColor: "#f0f0ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderStyle: "dashed",
    overflow: "hidden",
    position: "relative",
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  addAttachmentButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  removeAttachmentButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    paddingVertical: 18,
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "lexendBold",
    fontSize: 18,
  },
});
