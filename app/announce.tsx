import BarcodeScannerModal from "@/src/components/barcodeScannerModal";
import FloatingLabelInput from "@/src/components/floatingLabelInput";
import OptionChips from "@/src/components/optionChips";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import { useTransition } from "@/src/context/transition-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Modal() {
  const { overlayRef } = useTransition();
  const navigation = useNavigation();

  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      overlayRef.current?.playEnter(() => {
        navigation.dispatch(e.data.action);
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
    console.log({ isbn, title, author, synopsis, condition, price });
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.dismissArea}>
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
              keyboardShouldPersistTaps="handled"
            >
              {/* Capa do Livro */}
              <View style={styles.inputContainerUp}>
                <Text style={styles.title}>Capa do Livro</Text>
                <TouchableOpacity
                  style={styles.coverUploadBox}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={40} color="#6c63ff" />
                  <Text style={styles.uploadText}>
                    Adicionar capa principal
                  </Text>
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
                      <Ionicons
                        name="barcode-outline"
                        size={24}
                        color="#6c63ff"
                      />
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
                    options={[
                      "Novo",
                      "Usado (Bom)",
                      "Com Grifos",
                      "Danificado",
                    ]}
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
                  5 anexos restantes
                </Text>
                <View style={styles.attachmentContainer}>
                  <View style={styles.attachmentsRow}>
                    {/* Imagem 1 */}
                    <TouchableOpacity
                      style={styles.attachmentBox}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={24} color="#6c63ff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.attachmentBox}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={24} color="#6c63ff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.attachmentBox}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={24} color="#6c63ff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.attachmentBox}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={24} color="#6c63ff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.attachmentBox}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={24} color="#6c63ff" />
                    </TouchableOpacity>
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
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  dismissArea: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: "#a6a8aa",
    fontFamily: "montserratBold",
    marginVertical: 8,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },

  // Estilos do Formulario Sofisticado
  inputContainer: {
    position: "relative",
    marginTop: 20,
  },
  inputContainerUp: {
    alignItems: "center",
    marginVertical: 20,
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
    gap: 12,
  },
  attachmentContainer: {
    marginVertical: 12,
  },
  attachmentBox: {
    width: 68,
    height: 74,
    backgroundColor: "#f0f0ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderStyle: "dashed",
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
