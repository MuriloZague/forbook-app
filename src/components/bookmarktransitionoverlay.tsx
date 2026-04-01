// esse codigo completo pertence ao barbudo, nao mexer nunca na vida

import React, { forwardRef, useCallback, useImperativeHandle } from "react";
import { Dimensions, Platform, StyleSheet, Text } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  runOnUI,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

const PURPLE = "#6c63ff";
const BAR_HEIGHT = 74;
const BTN_WIDTH = 112;
const BTN_RISE = 18;
const BTN_HEIGHT = BAR_HEIGHT + BTN_RISE;
const IOS_PAD = Platform.OS === "ios" ? 20 : 0;

const PANEL_H = SH + BTN_HEIGHT + 20;
const Y_START = SH - IOS_PAD;
const Y_COVER = 0;
const Y_EXIT = -(PANEL_H + 20);

const T_RISE = 720;
const T_EXIT = 720;

const EASE_UP = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);

function ForBookLabel({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.4, 0.75, 1.0, 1.5, 2.0],
      [0, 1, 1, 1, 0],
      "clamp",
    );
    return { opacity };
  });
  return (
    <Animated.View style={[styles.labelWrapper, style]} pointerEvents="none">
      <Text style={styles.labelText}>FORBOOK</Text>
    </Animated.View>
  );
}

export type BookmarkTransitionHandle = {
  trigger: (onCovered: () => void) => void;
  playExit: (onDone?: () => void) => void;
  playEnter: (onCovered: () => void) => void;
};

type Props = {
  progress: SharedValue<number>;
  startAt?: number;
};

const BookmarkTransitionOverlay = forwardRef<BookmarkTransitionHandle, Props>(
  function BookmarkTransitionOverlay({ progress, startAt = 0 }, ref) {
    const isVisible = useSharedValue(startAt > 0 ? 1 : 0);

    const trigger = useCallback(
      (onCovered: () => void) => {
        const covered = () => onCovered();
        runOnUI(() => {
          "worklet";
          cancelAnimation(progress);
          isVisible.value = 1;
          progress.value = 0;
          progress.value = withTiming(
            1,
            { duration: T_RISE, easing: EASE_UP },
            (done) => {
              if (done) runOnJS(covered)();
            },
          );
        })();
      },
      [progress, isVisible],
    );

    const playExit = useCallback(
      (onDone?: () => void) => {
        const done = () => onDone?.();
        runOnUI(() => {
          "worklet";
          cancelAnimation(progress);
          isVisible.value = 1;
          progress.value = 1;
          progress.value = withTiming(
            2,
            { duration: T_EXIT, easing: EASE_OUT },
            (finished) => {
              if (finished) {
                isVisible.value = 0;
                progress.value = 0;
                runOnJS(done)();
              }
            },
          );
        })();
      },
      [progress, isVisible],
    );

    const playEnter = useCallback((onCovered: () => void) => {
      runOnUI(() => {
        "worklet";
        cancelAnimation(progress);

        isVisible.value = 1;
        progress.value = 2;

        progress.value = withTiming(
          1,
          { duration: T_EXIT, easing: EASE_UP },
          (finished) => {
            if (finished) {
              runOnJS(onCovered)();

              progress.value = withTiming(
                0,
                { duration: T_RISE, easing: EASE_OUT },
                (done) => {
                  if (done) {
                    isVisible.value = 0;
                  }
                },
              );
            }
          },
        );
      })();
    }, []);

    useImperativeHandle(ref, () => ({ trigger, playExit, playEnter }), [
      trigger,
      playExit,
      playEnter,
    ]);

    const panelStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 1, 2],
            [Y_START, Y_COVER, Y_EXIT],
          ),
        },
      ],
    }));

    const wrapperStyle = useAnimatedStyle(() => ({
      display: isVisible.value === 1 ? "flex" : "none",
    }));

    return (
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.root, wrapperStyle]}
      >
        <Animated.View style={[styles.panel, panelStyle]} />
        <ForBookLabel progress={progress} />
      </Animated.View>
    );
  },
);

export default BookmarkTransitionOverlay;

const styles = StyleSheet.create({
  root: { zIndex: 9999, elevation: 9999 },
  panel: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SW,
    height: PANEL_H,
    backgroundColor: PURPLE,
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
    color: "#fff",
    fontSize: 48,
    fontFamily: "lexendBlack",
    letterSpacing: 10,
  },
});
