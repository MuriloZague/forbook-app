import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import { formatDate, formatPhone } from "@/src/lib/input-masks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfile() {
  const [name, setName] = useState("Arthur Risso Pereira Rodovalho");
  const [birthDate, setBirthDate] = useState("04/01/2006");
  const [street, setStreet] = useState("Rua Idelfonso Belatti");
  const [number, setNumber] = useState("106");
  const [neighborhood, setNeighborhood] = useState("Santa Filomena");
  const [city, setCity] = useState("Fernandópolis");
  const [state, setState] = useState("SP");
  const [email, setEmail] = useState("arthur.rprodovalho@gmail.com");
  const [phone, setPhone] = useState("(17) 98842-7342");

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScreenHeader title="Editar perfil" borderBottomWidth={0} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Informações do seu perfil</Text>

          <Text style={styles.sectionTitle}>Dados pessoais</Text>

          <View style={styles.fieldBlock}>
            <FloatingLabelInput
              label="Nome completo"
              value={name}
              onChangeText={setName}
              labelBackgroundColor="#F0F2F5"
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputValue}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.birthField}>
              <FloatingLabelInput
                label="Nascimento"
                value={birthDate}
                maxLength={10}
                onChangeText={(t) => setBirthDate(formatDate(t))}
                keyboardType="numeric"
                labelBackgroundColor="#F0F2F5"
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputValue}
                inputContainerStyle={styles.inputContainer}
                rightElement={
                  <Ionicons name="calendar-outline" size={24} color="#6C63FF" />
                }
              />
            </View>
          </View>

          <View style={styles.rowFields}>
            <View style={styles.addressField}>
              <FloatingLabelInput
                label="Endereço"
                value={street}
                onChangeText={setStreet}
                labelBackgroundColor="#F0F2F5"
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputValue}
                inputContainerStyle={styles.inputContainer}
              />
            </View>

            <View style={styles.numberField}>
              <FloatingLabelInput
                label="N°"
                value={number}
                onChangeText={setNumber}
                keyboardType="number-pad"
                labelBackgroundColor="#F0F2F5"
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputValue}
                inputContainerStyle={styles.inputContainer}
              />
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <FloatingLabelInput
              label="Bairro"
              value={neighborhood}
              onChangeText={setNeighborhood}
              labelBackgroundColor="#F0F2F5"
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputValue}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.cityField}>
              <FloatingLabelInput
                label="Cidade"
                value={city}
                onChangeText={setCity}
                labelBackgroundColor="#F0F2F5"
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputValue}
                inputContainerStyle={styles.inputContainer}
              />
            </View>

            <View style={styles.stateField}>
              <FloatingLabelInput
                label="Estado"
                value={state}
                onChangeText={setState}
                editable={false}
                labelBackgroundColor="#F0F2F5"
                labelStyle={styles.inputLabel}
                inputStyle={styles.inputValue}
                inputContainerStyle={styles.inputContainer}
                rightElement={
                  <Ionicons name="chevron-down" size={20} color="#6C63FF" />
                }
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Dados da conta</Text>

          <View style={styles.fieldBlock}>
            <FloatingLabelInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              labelBackgroundColor="#F0F2F5"
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputValue}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.phoneField}>
            <FloatingLabelInput
              label="Telefone"
              value={phone}
              maxLength={15}
              onChangeText={(t) => setPhone(formatPhone(t))}
              keyboardType="numeric"
              labelBackgroundColor="#F0F2F5"
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputValue}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <PrimaryButton
            label="Confirmar"
            onPress={() => router.back()}
            style={styles.confirmButton}
            textStyle={styles.confirmText}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 28,
  },
  title: {
    fontFamily: "lexendBold",
    fontSize: 20,
    lineHeight: 20,
    color: "#1f1f1f",
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: "lexendBold",
    fontSize: 16,
    lineHeight: 20,
    color: "#242424",
    marginTop: 12,
  },
  fieldBlock: {
    marginTop: 14,
  },
  rowFields: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  birthField: {
    width: "53%",
  },
  addressField: {
    flex: 1,
  },
  numberField: {
    width: 82,
  },
  cityField: {
    flex: 1,
  },
  stateField: {
    width: 120,
  },
  phoneField: {
    marginTop: 14,
    width: "55%",
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
  },
  inputLabel: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#262626",
  },
  inputValue: {
    fontFamily: "montserratRegular",
    fontSize: 16,
    color: "#242424",
    paddingVertical: 12,
  },
  confirmButton: {
    marginTop: 28,
    alignSelf: "center",
    width: "70%",
    borderRadius: 12,
  },
  confirmText: {
    fontFamily: "montserratBold",
    fontSize: 20,
    color: "#fff",
  },
});
