// Função para formatar valor monetário (R$ 1.234,56)
function formatPriceInput(value: string): string {
  // Remove tudo que não for dígito
  const onlyDigits = value.replace(/\D/g, "");
  if (!onlyDigits) return "";
  // Converte para centavos
  const intValue = parseInt(onlyDigits, 10);
  const cents = intValue / 100;
  // Formata para pt-BR
  return cents.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/^R\$\s?/, "");
}
import BarcodeScannerModal from "@/src/components/barcodeScannerModal";
import FloatingLabelInput from "@/src/components/floatingLabelInput";
import OptionChips from "@/src/components/optionChips";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import { useTransition } from "@/src/context/transition-context";
import { useAuth } from "@/src/hooks/useAuth";
import { ApiError } from "@/src/services/api";
import {
  openLibraryService,
  type OpenLibraryBook,
} from "@/src/services/openLibrary.service";
import {
  fetchBookByIsbnFromBrasilApi,
  isBrazilianIsbn,
  type BrasilApiBook,
} from "@/src/services/brasilApi.service";
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
  ActivityIndicator,
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

const DEFAULT_CATALOG_SYNOPSIS = "Livro sem sinopse";
const DEFAULT_PRODUCT_DESCRIPTION = "Descrição não informada pelo anunciante";

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

export default function AnnounceScreen() {
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
  const [catalogSynopsis, setCatalogSynopsis] = useState(
    DEFAULT_CATALOG_SYNOPSIS,
  );
  const [productDescription, setProductDescription] = useState("");
  const [price, setPrice] = useState("");

  // Handler para aplicar máscara
  function handlePriceChange(text: string) {
    setPrice(formatPriceInput(text));
  }
  const [condition, setCondition] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<string | null>>(
    Array.from({ length: MAX_ATTACHMENTS }, () => null),
  );
  const [suggestedCoverUrl, setSuggestedCoverUrl] = useState<string | null>(
    null,
  );
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [isTitleSearchLoading, setIsTitleSearchLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<OpenLibraryBook[]>(
    [],
  );
  const [titleNoResults, setTitleNoResults] = useState(false);
  const lastIsbnLookupRef = useRef<string | null>(null);
  const titleSearchTokenRef = useRef(0);
  const skipTitleSearchRef = useRef(false);

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

  // Preenche campos a partir de OpenLibrary ou BrasilAPI
  function applyBookSuggestion(book: OpenLibraryBook | BrasilApiBook) {
    // Detecta origem e normaliza campos
    const isBrasilApi = (book as BrasilApiBook).authors !== undefined;
    const normalizedIsbn = isBrasilApi
      ? String((book as BrasilApiBook).isbn || "").replace(/[^0-9Xx]/g, "")
      : openLibraryService.normalizeIsbn((book as OpenLibraryBook).isbn);

    skipTitleSearchRef.current = true;
    setTitleSuggestions([]);
    setTitleNoResults(false);

    if (normalizedIsbn) {
      setIsbn(normalizedIsbn);
      setLookupError(null);
    } else {
      setLookupError("ISBN não encontrado. Preencha novamente ou informe o nome do livro.");
    }

    // Limpa erro visual se campos obrigatórios foram preenchidos
    if (
      (book.title || (isBrasilApi && Array.isArray((book as BrasilApiBook).authors) && (book as BrasilApiBook).authors.length > 0))
    ) {
      setLookupError(null);
    }

    // Título
    setTitle(book.title ? String(book.title) : "");

    // Autor
    if (isBrasilApi) {
      const authors = Array.isArray((book as BrasilApiBook).authors)
        ? (book as BrasilApiBook).authors.filter(Boolean).join(", ")
        : "";
      setAuthor(authors || "Autor desconhecido");
    } else {
      setAuthor((book as OpenLibraryBook).author || "Autor desconhecido");
    }

    // Editora
    let publisher = isBrasilApi ? (book as BrasilApiBook).publisher : (book as OpenLibraryBook).publisher;
    if (publisher === null || publisher === undefined) publisher = "";
    setPublisher(String(publisher) || "Editora desconhecida");

    // Ano
    let year = isBrasilApi ? (book as BrasilApiBook).year : (book as OpenLibraryBook).year;
    if (year === null || year === undefined) year = "";
    setYear(String(year) || String(new Date().getFullYear()));

    // Sinopse
    let synopsis = isBrasilApi
      ? (book as BrasilApiBook).synopsis
      : (book as OpenLibraryBook).description;
    if (synopsis === null || synopsis === undefined) synopsis = "";
    setCatalogSynopsis(String(synopsis).trim() || DEFAULT_CATALOG_SYNOPSIS);

    // Capa sugerida
    if (isBrasilApi && (book as BrasilApiBook).cover_url) {
      setSuggestedCoverUrl((book as BrasilApiBook).cover_url!);
    } else if (!isBrasilApi && (book as OpenLibraryBook).coverUrl) {
      setSuggestedCoverUrl((book as OpenLibraryBook).coverUrl!);
    }
  }

  async function handleIsbnLookup(value: string) {
    const normalized = openLibraryService.normalizeIsbn(value);
    if (!normalized || (normalized.length !== 10 && normalized.length !== 13)) {
      return;
    }

    if (lastIsbnLookupRef.current === normalized) {
      return;
    }

    setIsLookupLoading(true);
    setLookupError(null);

    try {
      if (isBrazilianIsbn(normalized)) {
        // Busca na BrasilAPI
        const book = await fetchBookByIsbnFromBrasilApi(normalized);
        if (!book) {
          setLookupError("ISBN brasileiro não encontrado. Preencha novamente ou informe o nome do livro.");
          return;
        }
        applyBookSuggestion(book);
        lastIsbnLookupRef.current = normalized;
        return;
      }
      // Busca padrão OpenLibrary
      const book = await openLibraryService.lookupByIsbn(normalized);
      if (!book) {
        setLookupError(
          "ISBN não encontrado. Preencha novamente ou informe o nome do livro.",
        );
        return;
      }
      applyBookSuggestion(book);
      lastIsbnLookupRef.current = normalized;
    } catch {
      setLookupError("Não foi possível buscar o livro pelo ISBN.");
    } finally {
      setIsLookupLoading(false);
    }
  }

  async function handleTitleLookup(value?: string) {
    const trimmed = (value ?? title).trim();
    if (trimmed.length < 3) {
      setTitleSuggestions([]);
      setTitleNoResults(false);
      setIsTitleSearchLoading(false);
      return;
    }

    const token = titleSearchTokenRef.current + 1;
    titleSearchTokenRef.current = token;

    setIsTitleSearchLoading(true);
    setLookupError(null);
    setTitleNoResults(false);

    try {
      const results = await openLibraryService.searchBooksByQuery(trimmed, 6);
      if (titleSearchTokenRef.current !== token) {
        return;
      }

      if (results.length === 0) {
        setTitleSuggestions([]);
        setTitleNoResults(true);
        return;
      }

      setTitleSuggestions(results);
      setTitleNoResults(false);
    } catch {
      if (titleSearchTokenRef.current !== token) {
        return;
      }

      setTitleSuggestions([]);
      setTitleNoResults(false);
      setLookupError("Não foi possível buscar o livro pelo título.");
    } finally {
      if (titleSearchTokenRef.current === token) {
        setIsTitleSearchLoading(false);
      }
    }
  }

  async function handleSelectSearchResult(book: OpenLibraryBook) {
    setIsLookupLoading(true);
    setLookupError(null);
    setTitleSuggestions([]);
    setTitleNoResults(false);

    try {
      const enriched = await openLibraryService.enrichBookWithDescription(book);
      applyBookSuggestion(enriched);
    } catch {
      setLookupError("Não foi possível carregar os detalhes do livro.");
    } finally {
      setIsLookupLoading(false);
    }
  }

  useEffect(() => {
    if (skipTitleSearchRef.current) {
      skipTitleSearchRef.current = false;
      return;
    }

    const trimmed = title.trim();
    if (trimmed.length < 3) {
      setTitleSuggestions([]);
      setTitleNoResults(false);
      return;
    }

    const timeout = setTimeout(() => {
      void handleTitleLookup(trimmed);
    }, 350);

    return () => clearTimeout(timeout);
  }, [title]);

  async function handleAnnounce() {
    if (isSubmitting) {
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        "Sessão expirada",
        "Faca login para publicar um anúncio.",
      );
      return;
    }

    const normalizedIsbn = isbn.replace(/[^0-9]/g, "").trim();
    const normalizedTitle = title.trim();
    const normalizedAuthor = author.trim();
    const normalizedPublisher = publisher.trim();
    const normalizedCatalogSynopsis = catalogSynopsis.trim();
    const normalizedProductDescription = productDescription.trim();
    const parsedYear = Number.parseInt(year.trim(), 10);
    const parsedPrice = parsePriceValue(price);
    const mappedCondition = CONDITION_MAP[condition];
    const resolvedCatalogSynopsis =
      normalizedCatalogSynopsis || DEFAULT_CATALOG_SYNOPSIS;
    const resolvedProductDescription =
      normalizedProductDescription || DEFAULT_PRODUCT_DESCRIPTION;
    const catalogDescription = resolvedCatalogSynopsis;

    if (!coverImage) {
      Alert.alert("Capa obrigatória", "Adicione uma capa principal.");
      return;
    }

    if (!normalizedTitle || !normalizedAuthor || !normalizedPublisher) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
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
        description: resolvedProductDescription,
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
      setCatalogSynopsis(DEFAULT_CATALOG_SYNOPSIS);
      setProductDescription("");
      setPrice("");
      setCondition("");
      setCoverImage(null);
      setAttachments(Array.from({ length: MAX_ATTACHMENTS }, () => null));
      router.back();
    } catch (error) {
      //tirar daqui
      if (error instanceof ApiError) {
        console.error("announce submit error", {
          status: error.status,
          message: error.message,
          errors: error.errors,
        });
      } else {
        console.error("announce submit error", error);
      }
      //ate aqui remover
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
            {suggestedCoverUrl ? (
              <View style={styles.suggestedCoverRow}>
                <Image
                  source={{ uri: suggestedCoverUrl }}
                  style={styles.suggestedCoverImage}
                  resizeMode="cover"
                />
                <View style={styles.suggestedCoverInfo}>
                  <Text style={styles.suggestedCoverTitle}>
                    Capa sugerida pela busca
                  </Text>
                  <Text style={styles.suggestedCoverSubtitle}>
                    Foto do usuario continua obrigatoria
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="ISBN"
              value={isbn}
              onChangeText={setIsbn}
              onEndEditing={() => handleIsbnLookup(isbn)}
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
            {isLookupLoading ? (
              <View style={styles.lookupRow}>
                <ActivityIndicator size="small" color="#6c63ff" />
                <Text style={styles.lookupText}>Buscando livro...</Text>
              </View>
            ) : null}
            {!isLookupLoading && lookupError ? (
              <Text style={styles.lookupErrorText}>{lookupError}</Text>
            ) : null}
            <BarcodeScannerModal
              visible={scannerVisible}
              onClose={() => setScannerVisible(false)}
              onScanned={(code) => {
                setIsbn(code);
                handleIsbnLookup(code);
              }}
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
              rightElement={
                <TouchableOpacity
                  style={styles.iconScan}
                  onPress={() => handleTitleLookup(title)}
                  disabled={isTitleSearchLoading}
                >
                  {isTitleSearchLoading ? (
                    <ActivityIndicator size="small" color="#6c63ff" />
                  ) : (
                    <Ionicons name="search-outline" size={24} color="#6c63ff" />
                  )}
                </TouchableOpacity>
              }
            />
            {isTitleSearchLoading ? (
              <View style={styles.lookupRow}>
                <ActivityIndicator size="small" color="#6c63ff" />
                <Text style={styles.lookupText}>Buscando sugestões...</Text>
              </View>
            ) : null}
            {titleNoResults ? (
              <Text style={styles.lookupErrorText}>
                Nenhum livro encontrado com esse titulo.
              </Text>
            ) : null}
            {titleSuggestions.length > 0 ? (
              <View style={styles.titleSuggestions}>
                {titleSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={item.isbn ? `${item.isbn}-${index}` : `${item.title}-${index}`}
                    style={styles.titleSuggestionItem}
                    activeOpacity={0.8}
                    onPress={() => handleSelectSearchResult(item)}
                  >
                    {item.coverUrl ? (
                      <Image
                        source={{ uri: item.coverUrl }}
                        style={styles.titleSuggestionImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.titleSuggestionPlaceholder}>
                        <Text style={styles.titleSuggestionPlaceholderText}>
                          Sem capa
                        </Text>
                      </View>
                    )}
                    <View style={styles.titleSuggestionInfo}>
                      <Text
                        style={styles.titleSuggestionTitle}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      {item.author ? (
                        <Text
                          style={styles.titleSuggestionMeta}
                          numberOfLines={1}
                        >
                          {item.author}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          {/* Autor */}
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Autor(a)"
              placeholder="Ex: J.R.R. Tolkien"
              placeholderTextColor="#a6a8aa"
              value={author}
              onChangeText={setAuthor}
              editable={false}
              labelStyle={[styles.floatingLabel, styles.disabledLabel]}
              inputStyle={[styles.input, styles.disabledInput]}
              inputContainerStyle={styles.disabledInputContainer}
            />
          </View>

          {/* Sinopse */}
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Sinopse"
              inputStyle={[styles.input, styles.textArea, styles.disabledInput]}
              placeholder={DEFAULT_CATALOG_SYNOPSIS}
              placeholderTextColor="#a6a8aa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={catalogSynopsis}
              editable={false}
              labelStyle={[styles.floatingLabel, styles.disabledLabel]}
              inputContainerStyle={styles.disabledInputContainer}
            />
          </View>

          {/* Descrição do produto */}
          <View style={styles.inputContainer}>
            <FloatingLabelInput
              label="Descrição do produto / Observações"
              inputStyle={[styles.input, styles.textArea]}
              placeholder="Descreva sobre o livro..."
              placeholderTextColor="#a6a8aa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={productDescription}
              onChangeText={setProductDescription}
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
              onChangeText={handlePriceChange}
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
  disabledLabel: {
    color: "#a6a8aa",
  },
  input: {
    fontFamily: "lexendRegular",
    fontSize: 15,
    color: "#333",
  },
  disabledInput: {
    color: "#a6a8aa",
  },
  disabledInputContainer: {
    borderColor: "#d6d9df",
    backgroundColor: "#f5f6f7",
  },

  iconScan: {
    alignItems: "center",
    justifyContent: "center",
  },
  lookupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  lookupText: {
    fontFamily: "lexendRegular",
    fontSize: 12,
    color: "#6c63ff",
  },
  lookupErrorText: {
    fontFamily: "lexendRegular",
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 8,
  },
  titleSuggestions: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  titleSuggestionItem: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f3",
  },
  titleSuggestionImage: {
    width: 48,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0ff",
  },
  titleSuggestionPlaceholder: {
    width: 48,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0ff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  titleSuggestionPlaceholderText: {
    fontFamily: "lexendRegular",
    fontSize: 10,
    color: "#a6a8aa",
    textAlign: "center",
  },
  titleSuggestionInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  titleSuggestionTitle: {
    fontFamily: "lexendBold",
    fontSize: 14,
    color: "#333",
  },
  titleSuggestionMeta: {
    fontFamily: "lexendRegular",
    fontSize: 12,
    color: "#7a7d80",
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
  suggestedCoverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 6,
  },
  suggestedCoverImage: {
    width: 60,
    height: 86,
    borderRadius: 8,
    backgroundColor: "#f0f0ff",
  },
  suggestedCoverInfo: {
    flex: 1,
  },
  suggestedCoverTitle: {
    fontFamily: "lexendBold",
    fontSize: 13,
    color: "#333",
  },
  suggestedCoverSubtitle: {
    fontFamily: "lexendRegular",
    fontSize: 12,
    color: "#a6a8aa",
    marginTop: 2,
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
