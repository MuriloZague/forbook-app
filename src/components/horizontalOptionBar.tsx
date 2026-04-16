import React from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type HorizontalOptionItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

interface HorizontalOptionBarProps {
  items: HorizontalOptionItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  scrollable?: boolean;
  showSeparators?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  optionStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
  separatorStyle?: StyleProp<ViewStyle>;
}

export default function HorizontalOptionBar({
  items,
  activeKey,
  onSelect,
  scrollable = true,
  showSeparators = true,
  containerStyle,
  contentContainerStyle,
  optionStyle,
  labelStyle,
  activeLabelStyle,
  separatorStyle,
}: HorizontalOptionBarProps) {
  const content = (
    <View style={[styles.row, contentContainerStyle]}>
      {items.map((item, index) => {
        const isActive = activeKey === item.key;

        return (
          <View key={item.key} style={styles.itemWrapper}>
            {showSeparators && index > 0 ? (
              <View style={[styles.separator, separatorStyle]} />
            ) : null}

            <TouchableOpacity
              onPress={() => onSelect?.(item.key)}
              style={[styles.optionButton, optionStyle]}
              activeOpacity={0.7}
            >
              {item.icon ? item.icon : null}
              <Text
                style={[
                  styles.optionText,
                  labelStyle,
                  isActive && styles.optionTextActive,
                  isActive && activeLabelStyle,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );

  if (!scrollable) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <View style={containerStyle}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: "#c4c8ce",
    alignSelf: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  optionText: {
    fontFamily: "montserratBold",
    fontSize: 14,
    color: "#a6a8aa",
    textAlign: "center",
  },
  optionTextActive: {
    color: "#6c63ff",
  },
});
