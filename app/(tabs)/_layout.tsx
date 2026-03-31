import { Tabs } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  interpolate,
  runOnJS,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useTransition } from "@/src/context/transition-context";

const { height: SH } = Dimensions.get("window");

const PURPLE = "#6c63ff";
const BAR_HEIGHT = 74;
const BTN_EXTRA_BOTTOM = 50; // 👈 adicione esta constante junto das outras
const BTN_WIDTH = 112;
const BTN_RISE = 18;
const BTN_HEIGHT = BAR_HEIGHT + BTN_RISE;
const BTN_RADIUS = 0;
const IOS_PAD = Platform.OS === "ios" ? 20 : 0;

const PANEL_H = SH + BTN_HEIGHT + 20;
const BTN_Y_COVER = -(SH - IOS_PAD);
const BTN_Y_EXIT = -(SH - IOS_PAD + PANEL_H + 20);

const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconActive: keyof typeof Ionicons.glyphMap;
  }
> = {
  home: { label: "Início", icon: "home-outline", iconActive: "home" },
  search: { label: "Buscar", icon: "search-outline", iconActive: "search" },
  chat: {
    label: "Chat",
    icon: "chatbubble-ellipses-outline",
    iconActive: "chatbubble-ellipses",
  },
  menu: {
    label: "Mais",
    icon: "ellipsis-horizontal-circle-outline",
    iconActive: "ellipsis-horizontal-circle",
  },
};

const LEFT_ROUTES = ["home", "search"];
const RIGHT_ROUTES = ["chat", "menu"];

function BookmarkShape() {
  const W = BTN_WIDTH,
    H = BTN_HEIGHT + BTN_EXTRA_BOTTOM,
    tr = 14,
    vr = 1,
    r = BTN_RADIUS;
  const mid = W / 2,
    bot = BTN_RISE;

  const d = [
    `M 0 ${tr}`,
    `Q 0 0 ${tr} 0`,
    `L ${mid - vr} ${bot - vr * 0.5}`,
    `Q ${mid} ${bot + vr * 0.4} ${mid + vr} ${bot - vr * 0.5}`,
    `L ${W - tr} 0`,
    `Q ${W} 0 ${W} ${tr}`,
    `L ${W} ${H - r}`,
    `Q ${W} ${H} ${W - r} ${H}`,
    `L ${r} ${H}`,
    `Q 0 ${H} 0 ${H - r}`,
    `Z`,
  ].join(" ");

  return (
    <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
      <Path d={d} fill={PURPLE} />
    </Svg>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { progress, overlayRef } = useTransition();
  const dragY = useSharedValue(0); // 👈 novo
  const dragProgress = useSharedValue(0);

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          interpolate(progress.value, [0, 1, 2], [0, BTN_Y_COVER, BTN_Y_EXIT]) +
          dragY.value, // 👈 soma o drag
      },
    ],
  }));

  function isActive(name: string) {
    return state.routes[state.index]?.name === name;
  }

  function handlePress(routeName: string) {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) navigation.navigate(routeName);
  }

  function handleAnnouncePress() {
    overlayRef.current?.trigger(() => {
      router.push("/announce");
    });
  }

  const SWIPE_THRESHOLD = 10;

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) {
        // Segue o dedo mas com resistência (divide por 2.5)
        dragY.value = event.translationY / 30.5;
      }
    })
    .onEnd((event) => {
      if (event.translationY < -SWIPE_THRESHOLD) {
        dragY.value = withSpring(0); // volta antes de navegar
        runOnJS(handleAnnouncePress)();
      } else {
        dragY.value = withSpring(0); // snap back se não passou do threshold
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleAnnouncePress)();
  });

  const combinedGesture = Gesture.Race(swipeGesture, tapGesture);

  function renderTab(name: string, showSeparator = false) {
    const cfg = TAB_CONFIG[name];
    const active = isActive(name);

    if (!cfg) return null;

    return (
      <View key={name} style={styles.tabItem}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handlePress(name)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={active ? cfg.iconActive : cfg.icon}
            size={26}
            color={active ? PURPLE : "#9b9b9b"}
          />
          <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
            {cfg.label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {LEFT_ROUTES.map((r, i) => renderTab(r, i > 0))}
        </View>
        <View style={{ width: BTN_WIDTH }} />
        <View style={styles.side}>
          {RIGHT_ROUTES.map((r, i) => renderTab(r, i === 0))}
        </View>
      </View>

      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.announceButton, btnAnimStyle]}>
          <BookmarkShape />
          <View style={styles.announceContent}>
            <Ionicons name="add" size={28} color="#fff" />
            <Text style={styles.announceLabel}>ANUNCIAR</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="search" />
        <Tabs.Screen name="create" />
        <Tabs.Screen name="chat" />
        <Tabs.Screen name="menu" />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingBottom: IOS_PAD, backgroundColor: "#fff" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: BAR_HEIGHT,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
  },
  side: { flex: 1, flexDirection: "row", alignItems: "center" },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center" },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "montserratBold",
    color: "#9b9b9b",
    marginTop: 2,
  },
  tabLabelActive: { color: PURPLE },
  announceButton: {
    position: "absolute",
    bottom: IOS_PAD,
    alignSelf: "center",
    width: BTN_WIDTH,
    height: BTN_HEIGHT,
  },
  announceContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: BTN_RISE,
  },
  announceLabel: {
    color: "#fff",
    fontFamily: "lexendBlack",
    fontSize: 12,
    marginTop: 2,
  },
});
