import ScreenHeader from "@/src/components/screenHeader";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Ajuda e Suporte" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>
          Última atualização: 26 de maio de 2026
        </Text>

        <Text style={styles.paragraph}>
          Precisa de ajuda? Veja abaixo algumas dúvidas frequentes e como obter suporte no FORBOOK.
        </Text>

        <Text style={styles.sectionTitle}>1. Como anunciar um livro?</Text>
        <Text style={styles.paragraph}>
          Acesse a área de anúncios, clique em "Novo anúncio" e preencha as informações do livro. Após a publicação, seu anúncio ficará visível para outros usuários.
        </Text>

        <Text style={styles.sectionTitle}>2. Esqueci minha senha, e agora?</Text>
        <Text style={styles.paragraph}>
          Utilize a opção "Esqueci minha senha" na tela de login para redefinir sua senha por e-mail.
        </Text>

        <Text style={styles.sectionTitle}>3. Como entrar em contato com o suporte?</Text>
        <Text style={styles.paragraph}>
          Envie um e-mail para forbook@gmail.com relatando seu problema ou dúvida. Nossa equipe responderá o mais breve possível.
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lastUpdated: {
    fontFamily: "lexendRegular",
    fontSize: 14,
    color: "#a6a8aa",
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "lexendBold",
    fontSize: 18,
    color: "#1a1a1a",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontFamily: "lexendRegular",
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    marginBottom: 12,
  },
  bottomSpace: {
    height: 40,
  },
});
