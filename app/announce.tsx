import BarcodeScannerModal from "@/src/components/barcodeScannerModal";
import FloatingLabelInput from "@/src/components/floatingLabelInput";
import OptionChips from "@/src/components/optionChips";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import { useTransition } from "@/src/context/transition-context";
import { useAuth } from "@/src/hooks/useAuth";
import { ApiError } from "@/src/services/api";
import { imageService } from "../src/services/image.service";
import {
  userBookService,
  type UserBookCondition,
} from "../src/services/userBook.service";
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

const CONDITION_MAP: Record<string, UserBookCondition> = {
  "Novo": "NEW",
  "Usado (Bom)": "GOOD",
  "Com Grifos": "ACCEPTABLE",
  "Danificado": "POOR",
};

function parsePriceValue(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const hasComma = trimmed.includes(",");
  const hasDot = trimmed.includes(".");
  let normalized = trimmed;

  if (hasComma) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasDot) {
    normalized = normalized.replace(/[^0-9.]/g, "");
  } else {
    normalized = normalized.replace(/[^0-9]/g, "");
  }

  const sanitized = normalized.replace(/[^0-9.]/g, "");

  if (!sanitized) {
    return null;
  }

  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function Modal() {
  const { overlayRef } = useTransition();
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const MAX_ATTACHMENTS = 5;
  const isLeavingRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
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

  async function handleAnnounce() {
    if (isSubmitting) {
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        "Sessao expirada",
        "Faca login para publicar um anuncio.",
      );
      return;
    }

    const normalizedIsbn = isbn.replace(/[^0-9]/g, "").trim();
    const normalizedTitle = title.trim();
    const normalizedAuthor = author.trim();
    const normalizedPublisher = publisher.trim();
    const normalizedSynopsis = synopsis.trim();
    const parsedYear = Number.parseInt(year.trim(), 10);
    const parsedPrice = parsePriceValue(price);
    const mappedCondition = CONDITION_MAP[condition];
    const catalogDescription = normalizedSynopsis.slice(0, 255);

    if (!coverImage) {
      Alert.alert("Capa obrigatoria", "Adicione uma capa principal.");
      return;
    }

    if (
      !normalizedIsbn ||
      !normalizedTitle ||
      !normalizedAuthor ||
      !normalizedPublisher ||
      !normalizedSynopsis
    ) {
      Alert.alert("Campos obrigatorios", "Preencha todos os campos.");
      return;
    }

    if (normalizedIsbn.length !== 13) {
      Alert.alert("ISBN invalido", "Informe um ISBN com 13 digitos.");
      return;
    }

    if (!mappedCondition) {
      Alert.alert("Estado do livro", "Selecione o estado do livro.");
      return;
    }

    const currentYear = new Date().getFullYear();
    if (
      !Number.isFinite(parsedYear) ||
      parsedYear < 1900 ||
      parsedYear > currentYear
    ) {
      Alert.alert("Ano invalido", "Informe um ano valido.");
      return;
    }

    if (parsedPrice === null || parsedPrice < 0) {
      Alert.alert("Valor invalido", "Informe um valor valido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const mainImage = await imageService.uploadImage(coverImage);
      const imageAttachments = attachments.filter(Boolean) as string[];
      const galleryImages = (await Promise.all(
        imageAttachments.map((uri) => imageService.uploadImage(uri)),
      )) as Array<{ id: string }>;

      await userBookService.createUserBook({
        condition: mappedCondition,
        price: parsedPrice,
          description: normalizedSynopsis,
        status: "ACTIVE",
        catalogBook: {
          isbn: normalizedIsbn,
          title: normalizedTitle,
          author: normalizedAuthor,
            description: catalogDescription,
          publisher: normalizedPublisher,
          year: parsedYear,
        },
        mainImageId: mainImage.id,
        ...(galleryImages.length > 0 && {
          galleryImages: galleryImages.map((image) => image.id),
        }),
      });

      Alert.alert("Sucesso", "Anuncio publicado com sucesso.");
      setIsbn("");
      setTitle("");
      setAuthor("");
      setPublisher("");
      setYear("");
      setSynopsis("");
      setPrice("");
      setCondition("");
      setCoverImage(null);
      setAttachments(Array.from({ length: MAX_ATTACHMENTS }, () => null));
      router.back();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Nao foi possivel publicar o anuncio.";
      Alert.alert("Erro", message);
    } finally {
      setIsSubmitting(false);
    }
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

          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Editora"
              placeholder="Ex: HarperCollins"
              placeholderTextColor="#a6a8aa"
              value={publisher}
              onChangeText={setPublisher}
              labelStyle={styles.floatingLabel}
              inputStyle={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Ano"
              placeholder="Ex: 2019"
              placeholderTextColor="#a6a8aa"
              value={year}
              onChangeText={setYear}
              labelStyle={styles.floatingLabel}
              inputStyle={styles.input}
              keyboardType="numeric"
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
            loading={isSubmitting}
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
