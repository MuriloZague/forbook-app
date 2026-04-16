import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const ESTADOS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

interface RegisterStepTwoProps {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cepLoading: boolean;
  errorCep?: string;
  errorEndereco?: string;
  errorNumero?: string;
  errorBairro?: string;
  errorCidade?: string;
  errorEstado?: string;
  onCepChange: (value: string) => void;
  onNumeroChange: (value: string) => void;
  onComplementoChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onCepHelpPress: () => void;
}

function RegisterStepTwo({
  cep,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cepLoading,
  errorCep,
  errorEndereco,
  errorNumero,
  errorBairro,
  errorCidade,
  errorEstado,
  onCepChange,
  onNumeroChange,
  onComplementoChange,
  onEstadoChange,
  onCepHelpPress,
}: RegisterStepTwoProps) {
  return (
    <View style={styles.formPage}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FloatingLabelInput
            label="CEP"
            value={cep}
            onChangeText={onCepChange}
            keyboardType="numeric"
            maxLength={9}
            placeholderTextColor="#6C63FF"
            placeholder="00000-000"
            labelStyle={styles.label}
            inputStyle={styles.inputText}
            error={errorCep}
            errorStyle={styles.errorText}
          />

          {cepLoading ? (
            <ActivityIndicator
              style={styles.cepLoadingIndicator}
              color="#6C63FF"
              size="small"
            />
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <PrimaryButton
            style={styles.cepHelpButton}
            activeOpacity={0.7}
            onPress={onCepHelpPress}
          >
            <Text style={styles.cepHelpButtonText}>NÃO SABE O CEP?</Text>
          </PrimaryButton>
        </View>
      </View>

      <FloatingLabelInput
        label="Endereço"
        value={endereco}
        editable={false}
        placeholderTextColor="#6C63FF"
        placeholder="Preencha com seu Endereço"
        labelStyle={styles.label}
        inputStyle={[styles.inputText, styles.readOnlyInput]}
        error={errorEndereco}
        errorStyle={styles.errorText}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FloatingLabelInput
            label="Nº"
            value={numero}
            onChangeText={onNumeroChange}
            keyboardType="numeric"
            placeholderTextColor="#6C63FF"
            placeholder="Nº"
            labelStyle={styles.label}
            inputStyle={styles.inputText}
            error={errorNumero}
            errorStyle={styles.errorText}
          />
        </View>

        <View style={{ flex: 4 }}>
          <FloatingLabelInput
            label="Complemento"
            value={complemento}
            onChangeText={onComplementoChange}
            placeholderTextColor="#6C63FF"
            placeholder="Preencha com seu Complemento"
            labelStyle={styles.label}
            inputStyle={styles.inputText}
          />
        </View>
      </View>

      <FloatingLabelInput
        label="Bairro"
        value={bairro}
        editable={false}
        placeholderTextColor="#6C63FF"
        placeholder="Preencha com seu Bairro"
        labelStyle={styles.label}
        inputStyle={[styles.inputText, styles.readOnlyInput]}
        error={errorBairro}
        errorStyle={styles.errorText}
      />

      <View style={styles.row}>
        <View style={{ flex: 2 }}>
          <FloatingLabelInput
            label="Cidade"
            value={cidade}
            editable={false}
            placeholderTextColor="#6C63FF"
            placeholder="Preencha com sua Cidade"
            labelStyle={styles.label}
            inputStyle={[styles.inputText, styles.readOnlyInput]}
            error={errorCidade}
            errorStyle={styles.errorText}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Estado</Text>

          <View
            style={[styles.pickerWrapper, errorEstado && styles.inputError]}
          >
            <Picker
              selectedValue={estado}
              onValueChange={(value) => onEstadoChange(String(value))}
              style={styles.picker}
              dropdownIconColor="#6C63FF"
            >
              <Picker.Item label="Selecione" value="" />
              {ESTADOS.map((uf) => (
                <Picker.Item key={uf} label={uf} value={uf} />
              ))}
            </Picker>
          </View>

          {errorEstado ? (
            <Text style={styles.errorText}>{errorEstado}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default React.memo(RegisterStepTwo);

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
  inputError: {
    borderColor: "#ff6584",
  },
  readOnlyInput: {
    backgroundColor: "#E8EAF2",
    color: "#5B5B5B",
    borderRadius: 12,
  },
  cepLoadingIndicator: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  cepHelpButton: {
    padding: 12,
    paddingVertical: 16,
  },
  cepHelpButtonText: {
    color: "#fff",
    fontFamily: "montserratBold",
    fontSize: 14,
    textAlign: "center",
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#6C63FF",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    height: 50,
  },
  picker: {
    height: 50,
    color: "#6C63FF",
    marginTop: -4,
  },
});
