import DismissKeyboardView from "@/src/components/dismissKeyboardView";
import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import { formatDate, formatPhone } from "@/src/lib/input-masks";
import { ApiError } from "@/src/services/api";
import { imageService } from "@/src/services/image.service";
import { userService, type UserProfile } from "@/src/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
  TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDateFromApi(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("pt-BR");
}

function parseBirthDate(value: string) {
  const [day, month, year] = value.split("/");

  if (!day || !month || !year) {
    return null;
  }

  const normalized = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  return normalized;
}

function getPrimaryAddress(user?: UserProfile | null) {
  return user?.Addresses?.[0] ?? null;
}

export default function EditProfile() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [profileImageDirty, setProfileImageDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function loadUser() {
        try {
          setLoadError(null);
          const me = await userService.getMe();

          if (cancelled) {
            return;
          }

          const address = getPrimaryAddress(me);

          setName(me.name ?? "");
          setBirthDate(formatDateFromApi(me.birthDate));
          setStreet(address?.street ?? "");
          setNumber(address?.number ?? "");
          setComplement(address?.complement ?? "");
          setNeighborhood(address?.neighborhood ?? "");
          setCity(address?.city ?? "");
          setState(address?.state ?? "");
          setZipCode(address?.zipCode ?? "");
          setEmail(me.email ?? "");
          setPhone(formatPhone(me.phoneNumber ?? ""));
          setProfileImageUri(me.ProfileImage?.url ?? null);
          setProfileImageDirty(false);
        } catch (error) {
          if (!cancelled) {
            setLoadError(
              error instanceof ApiError
                ? error.message
                : "Não foi possível carregar o perfil.",
            );
          }
        }
      }

      loadUser();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handlePickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ["images"],
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setProfileImageUri(result.assets[0].uri);
    setProfileImageDirty(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedState = state.trim().toUpperCase();
    const normalizedBirthDate = parseBirthDate(birthDate);

    if (!normalizedName) {
      Alert.alert("Nome obrigatório", "Informe seu nome completo.");
      return;
    }

    if (!normalizedBirthDate) {
      Alert.alert("Data inválida", "Informe sua data de nascimento.");
      return;
    }

    if (
      !street.trim() ||
      !number.trim() ||
      !neighborhood.trim() ||
      !city.trim() ||
      !normalizedState ||
      !zipCode.trim()
    ) {
      Alert.alert("Endereço incompleto", "Preencha todos os campos do endereço.");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedProfileImageId: string | undefined;

      if (profileImageDirty && profileImageUri) {
        const uploadedImage = await imageService.uploadImage(profileImageUri);
        uploadedProfileImageId = uploadedImage.id;
      }

      await userService.updateMe({
        name: normalizedName,
        email: normalizedEmail || undefined,
        phoneNumber: normalizedPhone || undefined,
        birthDate: normalizedBirthDate,
        profileImageId: uploadedProfileImageId,
        address: {
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim() || null,
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: normalizedState,
          zipCode: zipCode.trim(),
        },
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso.");
      router.back();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar o perfil.";
      Alert.alert("Erro", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DismissKeyboardView>
        <View style={styles.dismissArea}>
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
              {loadError ? (
                <Text style={styles.loadErrorText}>{loadError}</Text>
              ) : null}

              <Text style={styles.title}>Informações do seu perfil</Text>

              <View style={styles.avatarSection}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePickProfileImage}
                >
                  <Image
                    source={
                      profileImageUri
                        ? { uri: profileImageUri }
                        : require("../assets/images/profile.png")
                    }
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  <View style={styles.avatarBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>

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
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#6C63FF"
                      />
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
                  label="Complemento"
                  value={complement}
                  onChangeText={setComplement}
                  labelBackgroundColor="#F0F2F5"
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputValue}
                  inputContainerStyle={styles.inputContainer}
                />
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
                    autoCapitalize="characters"
                    labelBackgroundColor="#F0F2F5"
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.inputValue}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <FloatingLabelInput
                  label="CEP"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  labelBackgroundColor="#F0F2F5"
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputValue}
                  inputContainerStyle={styles.inputContainer}
                />
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
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.confirmButton}
                textStyle={styles.confirmText}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  dismissArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 28,
  },
  loadErrorText: {
    fontFamily: "montserratRegular",
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontFamily: "lexendBold",
    fontSize: 20,
    lineHeight: 20,
    color: "#1f1f1f",
    marginBottom: 8,
    marginTop: 4,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#F0F2F5",
    backgroundColor: "#d5d5d5",
  },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#F0F2F5",
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
