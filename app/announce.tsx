import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BarcodeScannerModal from "@/src/components/barcodeScannerModal";
import { useTransition } from "@/src/context/transition-context";
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      overlayRef.current?.playExit();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    router.back();
  }

  function handleAnnounce() {
    console.log({ isbn, title, author, synopsis, condition, price });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
            <Ionicons name="close" size={32} color="#6C63FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Anúncio</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Capa do Livro */}
          <View style={styles.inputContainerUp}>
            <Text style={styles.title}>Capa do Livro</Text>
            <TouchableOpacity style={styles.coverUploadBox} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={40} color="#6c63ff" />
              <Text style={styles.uploadText}>Adicionar capa principal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>ISBN</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.flexInput}
                placeholder="Ex: 978-85-359..."
                placeholderTextColor="#a6a8aa"
                keyboardType="numeric"
                value={isbn}
                onChangeText={setIsbn}
              />
              <TouchableOpacity
                style={styles.iconScan}
                onPress={() => setScannerVisible(true)}
              >
                <Ionicons name="barcode-outline" size={24} color="#6c63ff" />
              </TouchableOpacity>
              <BarcodeScannerModal
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScanned={(code) => setIsbn(code)}
              />
            </View>
          </View>

          {/* Título */}
          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>Título do Livro</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: O Senhor dos Anéis"
              placeholderTextColor="#a6a8aa"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Autor */}
          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>Autor(a)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: J.R.R. Tolkien"
              placeholderTextColor="#a6a8aa"
              value={author}
              onChangeText={setAuthor}
            />
          </View>

          {/* Sinopse */}
          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>Descrição / Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva sobre o livro..."
              placeholderTextColor="#a6a8aa"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              value={synopsis}
              onChangeText={setSynopsis}
            />
          </View>

          {/* Estado do Livro */}
          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>Estado do Livro</Text>
            <View style={styles.boxContainer}>
              <View style={styles.chipsContainer}>
                {["Novo", "Usado (Bom)", "Com Grifos", "Danificado"].map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        condition === item && styles.chipSelected,
                      ]}
                      onPress={() => setCondition(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          condition === item && styles.chipTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>
          </View>

          {/* Valor */}
          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor="#a6a8aa"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* Imagens Adicionais */}
          <View style={styles.inputContainer}>
            <Text style={styles.floatingLabel}>Imagens Adicionais</Text>
            <View style={styles.boxContainer}>
              <View style={styles.attachmentsRow}>
                {/* Imagem 1 */}
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

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAnnounce}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Publicar Anúncio</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 16,
    color: "#a6a8aa",
    fontFamily: "montserratBold",
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "lexendBlack",
    color: "#000",
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
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#ffffff", // Tem que ser igual ao fundo da tela
    paddingHorizontal: 4,
    fontSize: 13,
    color: "#6c63ff",
    fontFamily: "lexendBold",
    zIndex: 2,
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: "lexendRegular",
    fontSize: 15,
    color: "#333",
  },

  // Estilo específico do ISBN com ícone
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  flexInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: "lexendRegular",
    fontSize: 15,
    color: "#333",
  },
  iconScan: {
    paddingHorizontal: 16,
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
    backgroundColor: "#f8f8f8",
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
  attachmentBox: {
    width: 78,
    height: 78,
    backgroundColor: "#f0f0ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6c63ff",
    borderStyle: "dashed",
  },
  submitButton: {
    backgroundColor: "#6c63ff",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "lexendBold",
    fontSize: 18,
  },
});
