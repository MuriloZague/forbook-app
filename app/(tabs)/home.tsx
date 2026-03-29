import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import User from "@/assets/images/Perfil.svg";
import Notification from "@/assets/images/Notification.svg";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <View>
        <View style={styles.headerContainer}>
          <TouchableOpacity>
            <User width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.title}>Forbook</Text>
          <TouchableOpacity>
            <Notification width={28} height={28} />
          </TouchableOpacity>
        </View>

        <View>
          <View style={styles.wellcomeContent}>
            <View>
              <Text style={styles.wellcomeText}>
                Bem Vindo,{" "}
                <Text
                  style={{ fontFamily: "montserratBold", color: "#6c63ff" }}
                >
                  $usuario!
                </Text>
              </Text>
            </View>
            <View style={styles.categoryBar}>
              <TouchableOpacity>
              <Text style={styles.textCategory}>Ofertas</Text>
              </TouchableOpacity>
              <TouchableOpacity>
              <Text style={styles.textCategory}>Populares</Text>
              </TouchableOpacity>
              <TouchableOpacity>
              <Text style={styles.textCategory}>Baseado no seu interesse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.titleMain}>Melhores ofertas</Text>
          <View>
            
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
    paddingBottom: 16,
    paddingTop: 12,
  },
  title: {
    fontFamily: "lexendBlack",
    fontSize: 28,
  },
  wellcomeContent: {
    paddingVertical: 32,
    paddingHorizontal: 26,
  },
  wellcomeText: {
    fontFamily: "montserratRegular",
    fontSize: 24,
  },
  categoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#c4c8ce',
    paddingTop: 12,
  },
  textCategory: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: 'montserratBold',
    color: '#a6a8aa',
    
  },
  titleMain: {
    fontFamily: "lexendBlack",
    fontSize: 32,
  }
});
