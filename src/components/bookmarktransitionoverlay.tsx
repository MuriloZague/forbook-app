// components/BookmarkTransitionOverlay.tsx
import React, { forwardRef, useImperativeHandle, useCallback } from "react";
import { StyleSheet, Dimensions, View, Text, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Easing,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const { width: SW, height: SH } = Dimensions.get("window");

const PURPLE     = "#6c63ff";
const BAR_HEIGHT = 74;
const BTN_WIDTH  = 112;
const BTN_RISE   = 18;
const BTN_HEIGHT = BAR_HEIGHT + BTN_RISE; // 92
const IOS_PAD    = Platform.OS === "ios" ? 20 : 0;
const PANEL_H    = SH + BTN_HEIGHT;

// ── Posições do painel ─────────────────────────────────────────────────────────
//
//  Y_START : topo do painel alinhado ao topo do botão na navbar
//  Y_COVER : -BTN_RISE → os cantos laterais do V ficam rente ao topo da tela,
//             cobrindo 100% (o vértice do V ultrapassa pra cima, invisível)
//  Y_EXIT  : -PANEL_H  → o painel inteiro sai acima da tela
//             (antes era -SH, deixando BTN_HEIGHT px visíveis embaixo)
//
const Y_START = SH - BTN_HEIGHT - IOS_PAD;
const Y_COVER = -BTN_RISE;
const Y_EXIT  = -PANEL_H;

// ── Timings ────────────────────────────────────────────────────────────────────
const T_RISE = 750;
const T_HOLD = 600;
const T_EXIT = 560;

// ─── Forma do painel ───────────────────────────────────────────────────────────
function PanelShape() {
  const W   = SW;
  const H   = PANEL_H;
  const mid = W / 2;

  const notchDepth = BTN_RISE;
  const notchSpan  = BTN_WIDTH * 0.55;

  const d = [
    `M 0 ${notchDepth}`,
    `L ${mid - notchSpan} ${notchDepth}`,
    `C ${mid - notchSpan * 0.4} ${notchDepth} ${mid - 10} 2 ${mid} 0`,
    `C ${mid + 10} 2 ${mid + notchSpan * 0.4} ${notchDepth} ${mid + notchSpan} ${notchDepth}`,
    `L ${W} ${notchDepth}`,
    `L ${W} ${H}`,
    `L 0 ${H}`,
    `Z`,
  ].join(" ");

  return (
    <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
      <Path d={d} fill={PURPLE} />
    </Svg>
  );
}

// ─── Label do botão (some no começo da subida) ─────────────────────────────────
function ButtonLabel({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.22], [1, 0], "clamp");
    return { opacity };
  });

  return (
    <Animated.View style={[styles.btnLabel, style]}>
      <Text style={styles.btnIcon}>＋</Text>
      <Text style={styles.btnText}>ANUNCIAR</Text>
    </Animated.View>
  );
}

// ─── Texto FORBOOK fixo no centro ─────────────────────────────────────────────
function ForBookLabel({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.45, 0.78, 1.50, 1.80],
      [0,    1,    1,    0],
      "clamp"
    );
    const scale = interpolate(
      progress.value,
      [1, 1],
      [1, 1],
      "clamp"
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.labelWrapper, style]} pointerEvents="none">
      <Text style={styles.labelText}>FORBOOK</Text>
    </Animated.View>
  );
}

// ─── API pública ───────────────────────────────────────────────────────────────
export type BookmarkTransitionHandle = {
  trigger: (onNavigate: () => void) => void;
  dismiss: () => void;
};

const BookmarkTransitionOverlay = forwardRef<BookmarkTransitionHandle>(
  function BookmarkTransitionOverlay(_props, ref) {
    const progress  = useSharedValue(0);
    const isVisible = useSharedValue(0);
    const onNavigateRef = React.useRef<(() => void) | null>(null);

    const EASE_UP  = Easing.bezier(0.25, 0.46, 0.45, 0.94);
    const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);

    const navigate = useCallback(() => {
      onNavigateRef.current?.();
    }, []);

    const trigger = useCallback((onNavigate: () => void) => {
      onNavigateRef.current = onNavigate;
      isVisible.value = 1;
      progress.value  = 0;

      progress.value = withSequence(
        withTiming(1, { duration: T_RISE, easing: EASE_UP }, (done) => {
          if (done) runOnJS(navigate)();
        }),
        withDelay(
          T_HOLD,
          withTiming(2, { duration: T_EXIT, easing: EASE_OUT }, (done) => {
            if (done) {
              isVisible.value = 0;
              progress.value  = 0;
            }
          })
        )
      );
    }, [navigate]);

    const dismiss = useCallback(() => {
      progress.value = withTiming(
        2, { duration: 400, easing: EASE_OUT },
        (done) => {
          if (done) {
            isVisible.value = 0;
            progress.value  = 0;
          }
        }
      );
    }, []);

    useImperativeHandle(ref, () => ({ trigger, dismiss }), [trigger, dismiss]);

    const panelStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        progress.value,
        [0,       1,       2],
        [Y_START, Y_COVER, Y_EXIT]
      );
      return { transform: [{ translateY }] };
    });

    const wrapperStyle = useAnimatedStyle(() => ({
      display: isVisible.value === 1 ? "flex" : "none",
    }));

    return (
      <Animated.View style={[StyleSheet.absoluteFill, styles.root, wrapperStyle]}>

        <Animated.View style={[styles.panel, panelStyle]}>
          <PanelShape />
          <ButtonLabel progress={progress} />
        </Animated.View>

        <ForBookLabel progress={progress} />

      </Animated.View>
    );
  }
);

export default BookmarkTransitionOverlay;

// ─── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    elevation: 9999,
  },
  panel: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SW,
    height: PANEL_H,
  },
  btnLabel: {
    position: "absolute",
    top: BTN_RISE + 8,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  btnIcon: {
    color: "#fff",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
  },
  btnText: {
    color: "#fff",
    fontFamily: "lexendBlack",
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  labelWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    color: "rgb(255, 255, 255)",
    fontSize: 48,
    fontFamily: "lexendBlack",
    letterSpacing: 10,
  },
});