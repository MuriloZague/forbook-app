import { Tabs } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const PURPLE     = "#6c63ff";
const BAR_HEIGHT = 74;
const BTN_WIDTH  = 112;
const BTN_RISE   = 18;
const BTN_HEIGHT = BAR_HEIGHT + BTN_RISE;
const BTN_RADIUS = 0;

const TAB_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }
> = {
  home:   { label: "Início",  icon: "home-outline",                       iconActive: "home" },
  search: { label: "Buscar",  icon: "search-outline",                     iconActive: "search" },
  chat:   { label: "Chat",    icon: "chatbubble-ellipses-outline",         iconActive: "chatbubble-ellipses" },
  menu:   { label: "Mais",    icon: "ellipsis-horizontal-circle-outline",  iconActive: "ellipsis-horizontal-circle" },
};

const LEFT_ROUTES  = ["home", "search"];
const RIGHT_ROUTES = ["chat", "menu"];

function BookmarkShape() {
  const W   = BTN_WIDTH;
  const H   = BTN_HEIGHT;
  const tr  = 14;
  const vr  = 1;
  const r   = BTN_RADIUS;
  const mid = W / 2;
  const bot = BTN_RISE;

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
  function isActive(name: string) {
    return state.routes[state.index]?.name === name;
  }

  function handlePress(routeName: string) {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(routeName);
  }

  function renderTab(name: string, showSeparator = false) {
    const cfg    = TAB_CONFIG[name];
    const active = isActive(name);
    if (!cfg) return null;

    return (
      <View key={name} style={styles.tabItem}>
        {showSeparator && <View style={styles.separator} />}
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

      <TouchableOpacity
        style={styles.announceButton}
        onPress={() => handlePress("create")}
        activeOpacity={0.85}
      >
        <BookmarkShape />
        <View style={styles.announceContent}>
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.announceLabel}>ANUNCIAR</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home"     options={{ title: "Início" }} />
      <Tabs.Screen name="search"   options={{ title: "Buscar" }} />
      <Tabs.Screen name="create" options={{ title: "Anunciar" }} />
      <Tabs.Screen name="chat"     options={{ title: "Chat" }} />
      <Tabs.Screen name="menu"     options={{ title: "Mais" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    backgroundColor: "#fff",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: BAR_HEIGHT,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 10,
  },
  side: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
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
  tabLabelActive: {
    color: PURPLE,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: "#e8e8e8",
  },
  announceButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 0,
    alignSelf: "center",
    width: BTN_WIDTH,
    height: BTN_HEIGHT,
    elevation: 14,
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
    letterSpacing: 0.5,
  },
});