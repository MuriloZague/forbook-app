import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  VirtualizedList,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ImageItem =
  Platform.OS === "ios"
    ? require("react-native-image-viewing/dist/components/ImageItem/ImageItem.ios").default
    : require("react-native-image-viewing/dist/components/ImageItem/ImageItem.android").default;
const StatusBarManager = require("react-native-image-viewing/dist/components/StatusBarManager").default;

const SCREEN_WIDTH = Dimensions.get("window").width;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ViewerImage = { uri: string };

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

  const images = useMemo(
    () => imageUris.map((uri) => ({ uri })),
    [imageUris],
  );

  const listRef = useRef<VirtualizedList<ViewerImage>>(null);
  const [currentIndex, setCurrentIndex] = useState(imageIndex);
  const [isListScrollEnabled, setIsListScrollEnabled] = useState(true);

  useEffect(() => {
    if (!visible) return;

    setCurrentIndex(imageIndex);
    setIsListScrollEnabled(true);

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: imageIndex,
        animated: false,
      });
    });
  }, [visible, imageIndex]);

  function updateCurrentIndex(index: number) {
    setCurrentIndex(index);
    onImageIndexChange?.(index);
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / SCREEN_WIDTH);
    const clampedIndex = Math.max(0, Math.min(nextIndex, images.length - 1));

    updateCurrentIndex(clampedIndex);
  }

  function goToIndex(index: number) {
    const clampedIndex = Math.max(0, Math.min(index, images.length - 1));

    if (clampedIndex === currentIndex) return;

    setIsListScrollEnabled(true);
    listRef.current?.scrollToIndex({ index: clampedIndex, animated: true });
    updateCurrentIndex(clampedIndex);
  }

  function handleGoToPrev() {
    goToIndex(currentIndex - 1);
  }

  function handleGoToNext() {
    goToIndex(currentIndex + 1);
  }

  if (!visible) {
    return null;
  }

  function OverlayControls() {
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < images.length - 1;

    return (
      <View pointerEvents="box-none" style={styles.overlayRoot}>
        <View pointerEvents="box-none" style={[styles.topRow, { paddingTop: insets.top + 8 }]}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{`${currentIndex + 1}/${images.length}`}</Text>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRequestClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View pointerEvents="box-none" style={styles.sideButtonsRow}>
          <TouchableOpacity
            style={[styles.sideButton, !hasPrev && styles.sideButtonDisabled]}
            onPress={handleGoToPrev}
            disabled={!hasPrev}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideButton, !hasNext && styles.sideButtonDisabled]}
            onPress={handleGoToNext}
            disabled={!hasNext}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onRequestClose}
      hardwareAccelerated
    >
      <StatusBarManager presentationStyle="fullScreen" />

      <View style={styles.viewerContainer}>
        <VirtualizedList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={imageIndex}
          windowSize={2}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isListScrollEnabled}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItem={(data, index) => data[index]}
          getItemCount={(data) => data.length}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          keyExtractor={(_imageSrc, index) => `book-viewer-${index}`}
          onScrollToIndexFailed={({ index: failedIndex }) => {
            requestAnimationFrame(() => {
              listRef.current?.scrollToIndex({
                index: failedIndex,
                animated: true,
              });
            });
          }}
          renderItem={({ item }) => (
            <ImageItem
              imageSrc={item}
              onZoom={(isZoomed: boolean) => setIsListScrollEnabled(!isZoomed)}
              onRequestClose={onRequestClose}
              onLongPress={() => {}}
              delayLongPress={800}
              swipeToCloseEnabled
              doubleTapToZoomEnabled
            />
          )}
        />

        <OverlayControls />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000000d7",
  },
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
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
  sideButtonsRow: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.5 - 21,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sideButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  sideButtonDisabled: {
    opacity: 0.35,
  },
});
