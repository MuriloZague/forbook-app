import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabeçalho com botão de voltar */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Termos e Condições</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>
          Última atualização: 24 de março de 2026
        </Text>

        <Text style={styles.paragraph}>
          Bem-vindo(a) ao FORBOOK. Ao acessar e utilizar nosso aplicativo, você
          concorda com os presentes Termos e Condições de Uso. Caso não concorde
          com alguma das regras descritas abaixo, pedimos que não utilize a
          plataforma.
        </Text>

        <Text style={styles.sectionTitle}>1. Objetivo da Plataforma</Text>
        <Text style={styles.paragraph}>
          O FORBOOK é uma plataforma digital que atua exclusivamente como um
          espaço de classificados (vitrine) para facilitar a conexão entre
          estudantes universitários interessados em vender, comprar, trocar ou
          doar livros e materiais didáticos.
        </Text>

        <Text style={styles.sectionTitle}>
          2. Cadastro e Segurança da Conta
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.paragraph}>
            • Para utilizar as funcionalidades da plataforma, o usuário deve
            criar uma conta fornecendo dados precisos e atualizados (nome,
            e-mail institucional/pessoal).
          </Text>
          <Text style={styles.paragraph}>
            • O usuário é o único responsável por manter a confidencialidade de
            sua senha e por todas as atividades realizadas em sua conta.
          </Text>
          <Text style={styles.paragraph}>
            • É proibido criar perfis falsos ou se passar por outra pessoa.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>3. Responsabilidades do Usuário</Text>
        <Text style={styles.paragraph}>
          Ao utilizar o aplicativo, você se compromete a:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.paragraph}>
            • Anunciar apenas livros e materiais didáticos que você tenha o
            direito de vender ou trocar.
          </Text>
          <Text style={styles.paragraph}>
            • Descrever o estado de conservação do livro de forma honesta e
            precisa (Novo, Usado em bom estado, com marcações/grifos,
            Danificado).
          </Text>
          <Text style={styles.paragraph}>
            • Não utilizar a plataforma para vender produtos ilícitos,
            falsificados, cópias piratas (Xerox não autorizada) ou itens não
            relacionados a material acadêmico/literário.
          </Text>
          <Text style={styles.paragraph}>
            • Tratar os outros usuários com respeito no chat integrado.
            Comportamentos abusivos, assédio ou fraude resultarão no banimento
            imediato da conta.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          4. Isenção de Responsabilidade (O que NÃO fazemos)
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.paragraph}>
            <Text style={styles.boldText}>Transações Financeiras:</Text> O
            aplicativo não processa pagamentos. Toda a negociação de valores e
            formas de pagamento deve ser combinada diretamente entre os
            usuários.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.boldText}>Logística e Entrega:</Text> Não nos
            responsabilizamos pela entrega, frete ou encontros presenciais para
            a troca dos livros. Recomendamos que os encontros ocorram em locais
            públicos e seguros.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.boldText}>Qualidade dos Produtos:</Text> Não
            garantimos a veracidade das descrições feitas pelos usuários nem a
            qualidade dos livros anunciados.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>5. Sistema de Avaliação</Text>
        <Text style={styles.paragraph}>
          A plataforma possui um sistema de reputação. Ao final de uma
          negociação, os usuários podem se avaliar mutuamente. Avaliações falsas
          ou feitas com o intuito de prejudicar injustamente outro aluno podem
          ser removidas pela moderação.
        </Text>

        <Text style={styles.sectionTitle}>6. Modificações nos Termos</Text>
        <Text style={styles.paragraph}>
          A equipe desenvolvedora do FORBOOK reserva-se o direito de alterar
          estes Termos de Uso a qualquer momento. Notificaremos os usuários
          sobre mudanças significativas através de um aviso no próprio
          aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>7. Contato</Text>
        <Text style={styles.paragraph}>
          Em caso de dúvidas, denúncias ou problemas técnicos, entre em contato
          com a nossa equipe através do e-mail: forbook@gmail.com.
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: "lexendBold",
    fontSize: 20,
    color: "#000",
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
  boldText: {
    fontFamily: "lexendBold",
  },
  bulletList: {
    paddingLeft: 8,
  },
  bottomSpace: {
    height: 40,
  },
});
