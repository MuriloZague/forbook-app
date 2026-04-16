import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onScanned: (isbn: string) => void;
}

export default function BarcodeScannerModal({
  visible,
  onClose,
  onScanned,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) setScanned(false);
  }, [visible]);

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
    onClose();
  }

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6c63ff" />
        </View>
      </Modal>
    );
  }

  // Permissão negada
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.centered}>
          <Ionicons name="camera-outline" size={48} color="#6c63ff" />
          <Text style={styles.permissionText}>
            Precisamos de acesso à câmera para escanear o código de barras.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Permitir Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutline} onPress={onClose}>
            <Text style={styles.buttonOutlineText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8"],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />

        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <Text style={styles.hint}>
              Aponte para o código de barras do livro
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const SCAN_SIZE = 260;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
    gap: 16,
  },
  permissionText: {
    textAlign: "center",
    fontSize: 15,
    color: "#333",
    fontFamily: "lexendRegular",
  },
  button: {
    backgroundColor: "#6c63ff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontFamily: "lexendBold", fontSize: 16 },
  buttonOutline: {
    borderWidth: 2,
    borderColor: "#6c63ff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonOutlineText: {
    color: "#6c63ff",
    fontFamily: "lexendBold",
    fontSize: 16,
  },

  overlay: { flex: 1 },
  topOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  middleRow: { flexDirection: "row", height: SCAN_SIZE },
  sideOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: "relative",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 24,
  },
  hint: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "lexendRegular",
    opacity: 0.85,
  },

  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#6c63ff",
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  closeButton: {
    position: "absolute",
    top: 56,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 4,
  },
});
