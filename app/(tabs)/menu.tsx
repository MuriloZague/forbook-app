import { Text, TouchableOpacity, View, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Notification from "@/assets/images/Notification.svg";
import User from "@/assets/images/Perfil.svg";

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <TouchableOpacity>
            <User width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.title}>Forbook</Text>
          <TouchableOpacity>
            <Notification width={28} height={28} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerShadow} />
      </View>
      <View style={styles.subHeader}>
        <Text style={styles.Subtitle}>Meu perfil</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerWrapper: {
    backgroundColor: "#fff",
  },
  categoryWrapper: {
    height: 1,
    backgroundColor: "#c4c8ce",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 12,
  },
  headerShadow: {
    height: 2,
    backgroundColor: "#0000007a",
    opacity: 0.25,
  },
  title: {
    fontFamily: "lexendBlack",
    fontSize: 26,
    textAlign: 'center',
  },
  Subtitle: {
    fontFamily: "lexendBold",
    fontSize: 26,
    textAlign: 'center',
  },
  subHeader: {
    marginTop: 18,
  }
});
