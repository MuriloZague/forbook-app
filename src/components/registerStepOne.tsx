import FloatingLabelInput from "@/src/components/floatingLabelInput";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RegisterStepOneProps {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  nascimento: string;
  senha: string;
  confirmarSenha: string;
  errorNome?: string;
  errorEmail?: string;
  errorCpf?: string;
  errorTelefone?: string;
  errorNascimento?: string;
  errorSenha?: string;
  errorConfirmPassword?: string;
  temMinimo8Caracteres: boolean;
  temLetraMaiuscula: boolean;
  temLetraMinuscula: boolean;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onTelefoneChange: (value: string) => void;
  onNascimentoChange: (value: string) => void;
  onSenhaChange: (value: string) => void;
  onConfirmarSenhaChange: (value: string) => void;
  onPasswordFocus: () => void;
}

function RegisterStepOne({
  nome,
  email,
  cpf,
  telefone,
  nascimento,
  senha,
  confirmarSenha,
  errorNome,
  errorEmail,
  errorCpf,
  errorTelefone,
  errorNascimento,
  errorSenha,
  errorConfirmPassword,
  temMinimo8Caracteres,
  temLetraMaiuscula,
  temLetraMinuscula,
  onNomeChange,
  onEmailChange,
  onCpfChange,
  onTelefoneChange,
  onNascimentoChange,
  onSenhaChange,
  onConfirmarSenhaChange,
  onPasswordFocus,
}: RegisterStepOneProps) {
  return (
    <View style={styles.formPage}>
      <FloatingLabelInput
        label="Nome Completo"
        value={nome}
        maxLength={100}
        onChangeText={onNomeChange}
        placeholderTextColor="#6C63FF"
        placeholder="Preencha com seu Nome"
        labelStyle={styles.label}
        inputStyle={styles.inputText}
        error={errorNome}
        errorStyle={styles.errorText}
      />

      <FloatingLabelInput
        label="Email"
        value={email}
        onChangeText={onEmailChange}
        placeholderTextColor="#6C63FF"
        placeholder="Preencha com seu Email"
        keyboardType="email-address"
        autoCapitalize="none"
        labelStyle={styles.label}
        inputStyle={styles.inputText}
        error={errorEmail}
        errorStyle={styles.errorText}
      />

      <FloatingLabelInput
        label="CPF"
        value={cpf}
        onChangeText={onCpfChange}
        keyboardType="numeric"
        maxLength={14}
        placeholderTextColor="#6C63FF"
        placeholder="000.000.000-00"
        labelStyle={styles.label}
        inputStyle={styles.inputText}
        error={errorCpf}
        errorStyle={styles.errorText}
      />

      <View style={styles.row}>
        <View style={styles.inputTelefone}>
          <FloatingLabelInput
            label="Telefone"
            value={telefone}
            maxLength={15}
            onChangeText={onTelefoneChange}
            keyboardType="numeric"
            placeholderTextColor="#6C63FF"
            placeholder="(00) 00000-0000"
            labelStyle={styles.label}
            inputStyle={styles.inputText}
            error={errorTelefone}
            errorStyle={styles.errorText}
          />
        </View>

        <View style={styles.inputNascimento}>
          <FloatingLabelInput
            label="Nascimento"
            value={nascimento}
            maxLength={10}
            onChangeText={onNascimentoChange}
            keyboardType="numeric"
            placeholderTextColor="#6C63FF"
            placeholder="dd/mm/aaaa"
            labelStyle={styles.label}
            inputStyle={styles.inputText}
            error={errorNascimento}
            errorStyle={styles.errorText}
          />
        </View>
      </View>

      <View style={styles.passwordContainer}>
        <FloatingLabelInput
          label="Senha"
          maxLength={100}
          secureTextEntry
          value={senha}
          onChangeText={onSenhaChange}
          placeholderTextColor="#6C63FF"
          placeholder="Preencha com sua Senha"
          onFocus={onPasswordFocus}
          labelStyle={styles.label}
          inputStyle={styles.inputText}
          error={errorSenha}
          errorStyle={styles.errorText}
        />

        <FloatingLabelInput
          secureTextEntry
          value={confirmarSenha}
          maxLength={100}
          onChangeText={onConfirmarSenhaChange}
          placeholderTextColor="#6C63FF"
          onFocus={onPasswordFocus}
          placeholder="Confirme sua Senha"
          inputStyle={styles.inputText}
          error={errorConfirmPassword}
          errorStyle={styles.errorText}
        />

        <View>
          <View style={styles.requisiteRow}>
            <Ionicons
              name={temMinimo8Caracteres ? "checkmark-circle" : "close-circle"}
              size={16}
              color={temMinimo8Caracteres ? "#4CAF50" : "#ff6584"}
            />
            <Text style={styles.requisitesText}>8 ou mais caracteres</Text>
          </View>

          <View style={styles.requisiteRow}>
            <Ionicons
              name={temLetraMaiuscula ? "checkmark-circle" : "close-circle"}
              size={16}
              color={temLetraMaiuscula ? "#4CAF50" : "#ff6584"}
            />
            <Text style={styles.requisitesText}>Uma letra maiúscula</Text>
          </View>

          <View style={styles.requisiteRow}>
            <Ionicons
              name={temLetraMinuscula ? "checkmark-circle" : "close-circle"}
              size={16}
              color={temLetraMinuscula ? "#4CAF50" : "#ff6584"}
            />
            <Text style={styles.requisitesText}>Uma letra minúscula</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(RegisterStepOne);

const styles = StyleSheet.create({
  formPage: {
    width: "100%",
    gap: 16,
  },
  inputText: {
    fontSize: 14,
    fontFamily: "montserratRegular",
    color: "black",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 4,
    fontSize: 14,
    zIndex: 1,
    fontFamily: "montserratBold",
  },
  errorText: {
    color: "#ff6584",
    fontSize: 10,
    fontFamily: "montserratBold",
    marginTop: 1,
    marginLeft: 2,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  inputTelefone: {
    flex: 2,
  },
  inputNascimento: {
    flex: 1,
  },
  passwordContainer: {
    gap: 6,
  },
  requisitesText: {
    fontFamily: "montserratRegular",
    marginLeft: 8,
    color: "black",
  },
  requisiteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
});
