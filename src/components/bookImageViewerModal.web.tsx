import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BookImageViewerModalProps {
  visible: boolean;
  imageUris: string[];
  imageIndex: number;
  onRequestClose: () => void;
  onImageIndexChange?: (index: number) => void;
}

export default function BookImageViewerModal({
  visible,
  imageUris,
  imageIndex,
  onRequestClose,
  onImageIndexChange,
}: BookImageViewerModalProps) {
  const insets = useSafeAreaInsets();

  const images = useMemo(() => imageUris, [imageUris]);
  const [currentIndex, setCurrentIndex] = useState(imageIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!visible) return;

    setCurrentIndex(imageIndex);
    setZoom(1);
  }, [visible, imageIndex]);

  function updateIndex(index: number) {
    const clampedIndex = Math.max(0, Math.min(index, images.length - 1));

    setCurrentIndex(clampedIndex);
    setZoom(1);
    onImageIndexChange?.(clampedIndex);
  }

  function handleGoToPrev() {
    updateIndex(currentIndex - 1);
  }

  function handleGoToNext() {
    updateIndex(currentIndex + 1);
  }

  function handleZoomIn() {
    setZoom((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))));
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))));
  }

  if (!visible || images.length === 0) {
    return null;
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onRequestClose}
      hardwareAccelerated
    >
      <View style={styles.viewerContainer}>
        <View style={[styles.topRow, { paddingTop: insets.top + 8 }]}>
          <View style={styles.indexBadge}>
            <Text
              style={styles.indexText}
            >{`${currentIndex + 1}/${images.length}`}</Text>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRequestClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageArea}>
          <TouchableOpacity
            style={[styles.sideButton, !hasPrev && styles.sideButtonDisabled]}
            onPress={handleGoToPrev}
            disabled={!hasPrev}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: images[currentIndex] }}
              style={[styles.image, { transform: [{ scale: zoom }] }]}
              contentFit="contain"
            />
          </View>

          <TouchableOpacity
            style={[styles.sideButton, !hasNext && styles.sideButtonDisabled]}
            onPress={handleGoToNext}
            disabled={!hasNext}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.bottomControls,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
            disabled={zoom <= 1}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.zoomText}>{`${Math.round(zoom * 100)}%`}</Text>

          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            disabled={zoom >= 3}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  topRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  indexBadge: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  indexText: {
    color: "#fff",
    fontFamily: "montserratBold",
    fontSize: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  imageWrapper: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  sideButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  sideButtonDisabled: {
    opacity: 0.35,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingTop: 8,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomText: {
    color: "#fff",
    fontFamily: "montserratBold",
    fontSize: 14,
    minWidth: 52,
    textAlign: "center",
  },
});
