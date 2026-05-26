import ScreenHeader from "@/src/components/screenHeader";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PoliticsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Política de Privacidade" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>
          Última atualização: 26 de maio de 2026
        </Text>

        <Text style={styles.paragraph}>
          Sua privacidade é importante para nós. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações ao utilizar o FORBOOK.
        </Text>

        <Text style={styles.sectionTitle}>1. Coleta de Informações</Text>
        <Text style={styles.paragraph}>
          Coletamos apenas as informações necessárias para o funcionamento do aplicativo, como nome, e-mail e dados de uso. Não coletamos dados sensíveis sem seu consentimento.
        </Text>

        <Text style={styles.sectionTitle}>2. Uso das Informações</Text>
        <Text style={styles.paragraph}>
          Utilizamos suas informações para criar sua conta, melhorar a experiência do usuário e garantir a segurança da plataforma. Não vendemos ou compartilhamos seus dados com terceiros para fins comerciais.
        </Text>

        <Text style={styles.sectionTitle}>3. Segurança</Text>
        <Text style={styles.paragraph}>
          Adotamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração ou divulgação.
        </Text>

        <Text style={styles.sectionTitle}>4. Direitos do Usuário</Text>
        <Text style={styles.paragraph}>
          Você pode solicitar a exclusão ou atualização de seus dados a qualquer momento entrando em contato conosco.
        </Text>

        <Text style={styles.sectionTitle}>5. Alterações na Política</Text>
        <Text style={styles.paragraph}>
          Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças importantes pelo aplicativo.
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
