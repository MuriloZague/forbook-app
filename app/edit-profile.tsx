import DismissKeyboardView from "@/src/components/dismissKeyboardView";
import FloatingLabelInput from "@/src/components/floatingLabelInput";
import PrimaryButton from "@/src/components/primaryButton";
import ScreenHeader from "@/src/components/screenHeader";
import { formatCep, formatDate, formatPhone } from "@/src/lib/input-masks";
import { ApiError } from "@/src/services/api";
import { imageService } from "@/src/services/image.service";
import {
  userService,
  type UserAddress,
} from "@/src/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
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

function formatAddressPreview(address?: UserAddress | null) {
  if (!address) {
    return "Endereço não informado";
  }

  const complement = address.complement ? `, ${address.complement}` : "";
  return `${address.street}, ${address.number}${complement} - ${address.neighborhood}\n${address.city} - ${address.state} (${address.zipCode})`;
}

function getPrimaryAddress(addresses: UserAddress[]) {
  return addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;
}

type CorreiosCepResponse = {
  erro: boolean | string;
  mensagem: string;
  total?: number;
  dados?: {
    uf: string;
    localidade: string;
    logradouroDNEC: string;
    bairro: string;
    cep: string;
  }[];
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

type CepAddressData = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export default function EditProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const [addressMode, setAddressMode] = useState<"edit" | "create">("edit");
  const [makeDefault, setMakeDefault] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressErrors, setAddressErrors] = useState<
    Partial<
      Record<
        "street" | "number" | "complement" | "neighborhood" | "city" | "state" | "zipCode",
        string
      >
    >
  >({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [profileImageDirty, setProfileImageDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [defaultAddressLoadingId, setDefaultAddressLoadingId] = useState<string | null>(null);
  const [deleteAddressLoadingId, setDeleteAddressLoadingId] = useState<string | null>(null);

  const lastCepFetchedRef = useRef("");
  const cepRequestRef = useRef(0);
  const cepLookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const primaryAddress = getPrimaryAddress(addresses);

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

          const list = me.Addresses ?? [];
          const address = getPrimaryAddress(list);

          setUserId(me.id ?? null);
          setName(me.name ?? "");
          setBirthDate(formatDateFromApi(me.birthDate));
          setAddresses(list);
          setActiveAddressId(address?.id ?? null);
          setAddressMode(address ? "edit" : "create");
          setMakeDefault(false);
          setShowAddressForm(false);
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

  const applyAddressToForm = (address?: UserAddress | null) => {
    setStreet(address?.street ?? "");
    setNumber(address?.number ?? "");
    setComplement(address?.complement ?? "");
    setNeighborhood(address?.neighborhood ?? "");
    setCity(address?.city ?? "");
    setState(address?.state ?? "");
    setZipCode(address?.zipCode ?? "");
    setAddressErrors({});
  };

  const handleCepLookup = useCallback(async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, "");

    if (digits.length !== 8) {
      setStreet("");
      setNeighborhood("");
      setCity("");
      setState("");
      lastCepFetchedRef.current = "";
      return;
    }

    if (lastCepFetchedRef.current === digits) {
      return;
    }

    const requestId = ++cepRequestRef.current;
    setCepLoading(true);

    try {
      const lookupViaCorreios = async (): Promise<CepAddressData | null> => {
        const params = new URLSearchParams({
          cep: digits,
          capt: "1",
          inicio: "1",
          final: "50",
        });

        const response = await fetch(
          "https://buscacepinter.correios.com.br/app/cep/carrega-cep.php",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: params.toString(),
          },
        );

        const result = (await response.json()) as CorreiosCepResponse;
        const hasError = result.erro === true || result.erro === "true";
        const firstAddress = result.dados?.[0];

        if (!response.ok || hasError || !firstAddress) {
          return null;
        }

        return {
          street: firstAddress.logradouroDNEC ?? "",
          neighborhood: firstAddress.bairro ?? "",
          city: firstAddress.localidade ?? "",
          state: firstAddress.uf ?? "",
        };
      };

      const lookupViaViaCep = async (): Promise<CepAddressData | null> => {
        const response = await fetch(
          `https://viacep.com.br/ws/${digits}/json/`,
        );
        const result = (await response.json()) as ViaCepResponse;

        if (!response.ok || result.erro) {
          return null;
        }

        return {
          street: result.logradouro ?? "",
          neighborhood: result.bairro ?? "",
          city: result.localidade ?? "",
          state: result.uf ?? "",
        };
      };

      let addressData: CepAddressData | null = null;

      if (Platform.OS === "web") {
        addressData = await lookupViaViaCep();
      } else {
        try {
          addressData = await lookupViaCorreios();
        } catch {
          addressData = await lookupViaViaCep();
        }
      }

      if (requestId !== cepRequestRef.current) {
        return;
      }

      if (!addressData) {
        setStreet("");
        setNeighborhood("");
        setCity("");
        setState("");
        setAddressErrors((prevState) => ({
          ...prevState,
          zipCode: "CEP não encontrado.",
        }));
        return;
      }

      setStreet(addressData.street);
      setNeighborhood(addressData.neighborhood);
      setCity(addressData.city);
      setState(addressData.state);
      lastCepFetchedRef.current = digits;
      setAddressErrors((prevState) => ({
        ...prevState,
        zipCode: undefined,
      }));
    } finally {
      if (requestId === cepRequestRef.current) {
        setCepLoading(false);
      }
    }
  }, []);

  const handleSelectAddress = (address: UserAddress) => {
    setActiveAddressId(address.id);
    setAddressMode("edit");
    setMakeDefault(false);
    setShowAddressForm(true);
    applyAddressToForm(address);
  };

  const handleSelectAddressCard = async (address: UserAddress) => {
    if (defaultAddressLoadingId) {
      return;
    }

    setActiveAddressId(address.id);

    if (address.isDefault) {
      return;
    }

    setDefaultAddressLoadingId(address.id);
    await handleSetDefaultAddress(address.id);
    setDefaultAddressLoadingId(null);
  };

  const handleAddAddress = () => {
    setActiveAddressId(null);
    setAddressMode("create");
    setMakeDefault(false);
    setShowAddressForm(true);
    applyAddressToForm(null);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!userId) {
      return;
    }

    try {
      await userService.setDefaultAddress(userId, addressId);
      setActiveAddressId(addressId);
      setAddresses((prevState) =>
        prevState.map((address) => ({
          ...address,
          isDefault: address.id === addressId,
        })),
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível definir o endereço principal.";
      Alert.alert("Erro", message);
    } finally {
      setDefaultAddressLoadingId(null);
    }
  };

  const handleDeleteAddress = (address: UserAddress) => {
    if (!userId) {
      return;
    }

    if (addresses.length <= 1) {
      Alert.alert("Ação indisponível", "Você precisa ter ao menos 1 endereço.");
      return;
    }

    Alert.alert(
      "Excluir endereço",
      "Tem certeza que deseja excluir este endereço?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setDeleteAddressLoadingId(address.id);
            try {
              await userService.deleteAddress(userId, address.id);
              const remaining = addresses.filter(
                (item) => item.id !== address.id,
              );
              setAddresses(remaining);

              if (activeAddressId === address.id) {
                const nextPrimary = getPrimaryAddress(remaining);
                setActiveAddressId(nextPrimary?.id ?? null);
                setAddressMode(nextPrimary ? "edit" : "create");
                applyAddressToForm(nextPrimary);
              }
            } catch (error) {
              const message =
                error instanceof ApiError
                  ? error.message
                  : "Não foi possível excluir o endereço.";
              Alert.alert("Erro", message);
            } finally {
              setDeleteAddressLoadingId(null);
            }
          },
        },
      ],
    );
  };

  const handleSaveAddress = async () => {
    if (isSubmitting) {
      return;
    }

    if (!userId) {
      Alert.alert("Erro", "Não foi possível identificar o usuário.");
      return;
    }

    const normalizedState = state.trim().toUpperCase();
    const normalizedZip = zipCode.replace(/\D/g, "");
    const nextErrors: typeof addressErrors = {};

    if (!normalizedZip) {
      nextErrors.zipCode = "Informe o CEP.";
    } else if (normalizedZip.length !== 8) {
      nextErrors.zipCode = "CEP inválido.";
    } else if (!street.trim() || !neighborhood.trim() || !city.trim() || !normalizedState) {
      nextErrors.zipCode = "CEP não encontrado.";
    }

    if (!number.trim()) {
      nextErrors.number = "Informe o numero.";
    }


    if (Object.keys(nextErrors).length > 0) {
      setAddressErrors(nextErrors);
      return;
    }

    setAddressErrors({});

    setIsSubmitting(true);
    try {
      const normalizedAddress = {
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim() || null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: normalizedState,
        zipCode: normalizedZip,
      };

      if (addressMode === "create") {
        const created = await userService.createAddress(userId, {
          ...normalizedAddress,
          makeDefault,
        });
        setAddresses((prevState) => [...prevState, created]);
        setActiveAddressId(created.id);
        setAddressMode("edit");
        setMakeDefault(false);
      } else if (activeAddressId) {
        const updated = await userService.updateAddress(
          userId,
          activeAddressId,
          normalizedAddress,
        );
        setAddresses((prevState) =>
          prevState.map((item) => (item.id === updated.id ? updated : item)),
        );
      }

      setShowAddressForm(false);
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const apiErrors = Object.entries(error.errors).reduce(
          (acc, [key, value]) => {
            const message = Array.isArray(value) ? value[0] : undefined;

            if (!message) {
              return acc;
            }

            if (
              key === "street" ||
              key === "number" ||
              key === "complement" ||
              key === "neighborhood" ||
              key === "city" ||
              key === "state" ||
              key === "zipCode"
            ) {
              acc[key] = message;
            }

            return acc;
          },
          {} as typeof addressErrors,
        );

        if (Object.keys(apiErrors).length > 0) {
          setAddressErrors(apiErrors);
        }
      }
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar o endereço.";
      if (!Object.keys(addressErrors).length) {
        Alert.alert("Erro", message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedBirthDate = parseBirthDate(birthDate);

    if (!normalizedName) {
      Alert.alert("Nome obrigatório", "Informe seu nome completo.");
      return;
    }

    if (!normalizedBirthDate) {
      Alert.alert("Data inválida", "Informe sua data de nascimento.");
      return;
    }

    if (!userId) {
      Alert.alert("Erro", "Não foi possível identificar o usuário.");
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

              <View style={styles.addressCard}>
                <View style={styles.addressCardHeader}>
                  <View style={styles.addressCardTitleFloating}>
                    <Text style={styles.addressCardTitleFloatingText}>
                      Endereços
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.addressHeaderAction}
                    onPress={handleAddAddress}
                  >
                    <Ionicons name="add" size={16} color="#6C63FF" />
                    <Text style={styles.addressHeaderActionText}>
                      Adicionar novo
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.addressPrimaryText}>
                  {formatAddressPreview(primaryAddress)}
                </Text>

                <View style={styles.addressList}>
                  {addresses.length ? (
                    addresses.map((address) => (
                      <View
                        key={address.id}
                        style={styles.addressItem}
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.addressSelectArea}
                          onPress={() => handleSelectAddressCard(address)}
                          disabled={!!defaultAddressLoadingId}
                        >
                          <View style={styles.addressRadioOuter}>
                            {defaultAddressLoadingId === address.id ? (
                              <ActivityIndicator size="small" color="#6C63FF" />
                            ) : address.id === activeAddressId ? (
                              <View style={styles.addressRadioInner} />
                            ) : null}
                          </View>

                          <View style={styles.addressItemContent}>
                            <Text style={styles.addressItemText}>
                              {formatAddressPreview(address)}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <View style={styles.addressItemActions}>
                          <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.addressEditButton}
                            onPress={() => handleSelectAddress(address)}
                          >
                            <Ionicons
                              name="create-outline"
                              size={14}
                              color="#4b42c7"
                            />
                            <Text style={styles.addressEditText}>Editar</Text>
                          </TouchableOpacity>

                          {address.isDefault ? (
                            <View style={styles.addressBadge}>
                              <Text style={styles.addressBadgeText}>
                                Principal
                              </Text>
                            </View>
                          ) : null}

                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={
                              addresses.length <= 1 || deleteAddressLoadingId === address.id
                                ? styles.addressDeleteButtonDisabled
                                : styles.addressDeleteButton
                            }
                            onPress={() => handleDeleteAddress(address)}
                            disabled={
                              addresses.length <= 1 || deleteAddressLoadingId === address.id
                            }
                          >
                            {deleteAddressLoadingId === address.id ? (
                              <ActivityIndicator size="small" color="#d9534f" />
                            ) : (
                              <Ionicons
                                name="trash-outline"
                                size={14}
                                color={
                                  addresses.length <= 1 ? "#b8b8b8" : "#d9534f"
                                }
                              />
                            )}
                            <Text
                              style={
                                addresses.length <= 1 || deleteAddressLoadingId === address.id
                                  ? styles.addressDeleteTextDisabled
                                  : styles.addressDeleteText
                              }
                            >
                              Excluir
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.addressEmptyText}>
                      Nenhum endereço cadastrado.
                    </Text>
                  )}
                </View>

                {showAddressForm ? (
                  <View style={styles.addressForm}>
                    <View style={styles.fieldBlock}>
                      <FloatingLabelInput
                        label="CEP"
                        value={zipCode}
                        onChangeText={(value) => {
                          const formatted = formatCep(value);
                          setZipCode(formatted);
                          if (addressErrors.zipCode) {
                            setAddressErrors((prevState) => ({
                              ...prevState,
                              zipCode: undefined,
                            }));
                          }

                          if (cepLookupTimeoutRef.current) {
                            clearTimeout(cepLookupTimeoutRef.current);
                          }

                          cepLookupTimeoutRef.current = setTimeout(() => {
                            handleCepLookup(formatted);
                          }, 350);
                        }}
                        error={addressErrors.zipCode}
                        keyboardType="numeric"
                        labelBackgroundColor="#F0F2F5"
                        labelStyle={styles.inputLabel}
                        inputStyle={styles.inputValue}
                        inputContainerStyle={styles.inputContainer}
                        rightElement={
                          cepLoading ? (
                            <ActivityIndicator size="small" color="#6C63FF" />
                          ) : undefined
                        }
                      />
                      <Text style={styles.cepHelperText}>
                        Preencha o CEP para buscar o endereco automaticamente.
                      </Text>
                    </View>

                    <View style={styles.rowFields}>
                      <View style={styles.addressField}>
                        <FloatingLabelInput
                          label="Endereço"
                          value={street}
                          onChangeText={(value) => {
                            setStreet(value);
                            if (addressErrors.street) {
                              setAddressErrors((prevState) => ({
                                ...prevState,
                                street: undefined,
                              }));
                            }
                          }}
                          error={addressErrors.street}
                          editable={false}
                          labelBackgroundColor="#F0F2F5"
                          labelStyle={styles.inputLabelDisabled}
                          inputStyle={styles.inputValueDisabled}
                          inputContainerStyle={styles.inputContainerDisabled}
                        />
                      </View>

                      <View style={styles.numberField}>
                        <FloatingLabelInput
                          label="N°"
                          value={number}
                          onChangeText={(value) => {
                            setNumber(value);
                            if (addressErrors.number) {
                              setAddressErrors((prevState) => ({
                                ...prevState,
                                number: undefined,
                              }));
                            }
                          }}
                          error={addressErrors.number}
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
                        onChangeText={(value) => {
                          setComplement(value);
                          if (addressErrors.complement) {
                            setAddressErrors((prevState) => ({
                              ...prevState,
                              complement: undefined,
                            }));
                          }
                        }}
                        error={addressErrors.complement}
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
                        onChangeText={(value) => {
                          setNeighborhood(value);
                          if (addressErrors.neighborhood) {
                            setAddressErrors((prevState) => ({
                              ...prevState,
                              neighborhood: undefined,
                            }));
                          }
                        }}
                        error={addressErrors.neighborhood}
                        editable={false}
                        labelBackgroundColor="#F0F2F5"
                        labelStyle={styles.inputLabelDisabled}
                        inputStyle={styles.inputValueDisabled}
                        inputContainerStyle={styles.inputContainerDisabled}
                      />
                    </View>

                    <View style={styles.rowFields}>
                      <View style={styles.cityField}>
                        <FloatingLabelInput
                          label="Cidade"
                          value={city}
                          onChangeText={(value) => {
                            setCity(value);
                            if (addressErrors.city) {
                              setAddressErrors((prevState) => ({
                                ...prevState,
                                city: undefined,
                              }));
                            }
                          }}
                          error={addressErrors.city}
                          editable={false}
                          labelBackgroundColor="#F0F2F5"
                          labelStyle={styles.inputLabelDisabled}
                          inputStyle={styles.inputValueDisabled}
                          inputContainerStyle={styles.inputContainerDisabled}
                        />
                      </View>

                      <View style={styles.stateField}>
                        <FloatingLabelInput
                          label="Estado"
                          value={state}
                          onChangeText={(value) => {
                            setState(value);
                            if (addressErrors.state) {
                              setAddressErrors((prevState) => ({
                                ...prevState,
                                state: undefined,
                              }));
                            }
                          }}
                          error={addressErrors.state}
                          editable={false}
                          autoCapitalize="characters"
                          labelBackgroundColor="#F0F2F5"
                          labelStyle={styles.inputLabelDisabled}
                          inputStyle={styles.inputValueDisabled}
                          inputContainerStyle={styles.inputContainerDisabled}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.makeDefaultRow}
                      onPress={() => {
                        if (addressMode !== "create") {
                          return;
                        }
                        setMakeDefault((prevState) => !prevState);
                      }}
                    >
                      <Ionicons
                        name={
                          addressMode === "create" && makeDefault
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={18}
                        color={addressMode === "create" ? "#6C63FF" : "#B0B2B5"}
                      />
                      <Text
                        style={
                          addressMode === "create"
                            ? styles.makeDefaultText
                            : styles.makeDefaultTextDisabled
                        }
                      >
                        Definir como principal
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.addressFormActions}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.addressCancelButton}
                        onPress={() => setShowAddressForm(false)}
                      >
                        <Text style={styles.addressCancelText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.addressSaveButton}
                        onPress={handleSaveAddress}
                        disabled={cepLoading}
                      >
                        <Text style={styles.addressSaveText}>
                          Salvar endereço
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
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
  addressCard: {
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: "#6C63FF",
  },
  addressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  addressCardTitle: {
    fontFamily: "lexendBold",
    fontSize: 16,
    color: "#1f1f1f",
  },
  addressHeaderAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d7d9e5",
    backgroundColor: "#f7f7fb",
  },
  addressHeaderActionText: {
    fontFamily: "montserratBold",
    fontSize: 12,
    color: "#4b42c7",
  },
  addressActionRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  addressCardTitleFloating: {
    marginTop: -8,
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#F0F2F5",
  },
  addressCardTitleFloatingText: {
    fontFamily: "montserratBold",
    fontSize: 18,
    color: "#262626",
    marginTop: 8,
  },
  addressActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#eef0ff",
  },
  addressActionText: {
    fontFamily: "montserratBold",
    fontSize: 12,
    color: "#4b42c7",
  },
  addressPrimaryText: {
    marginTop: 4,
    fontFamily: "montserratRegular",
    fontSize: 14,
    lineHeight: 20,
    color: "#1f1f1f",
  },
  addressList: {
    marginTop: 12,
    gap: 10,
  },
  addressItem: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eceff4",
    backgroundColor: "#f8f9fb",
  },
  addressSelectArea: {
    flexDirection: "row",
    gap: 10,
  },
  addressRadioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  addressRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
  },
  addressItemContent: {
    flex: 1,
    gap: 6,
  },
  addressItemActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  addressItemText: {
    fontFamily: "montserratRegular",
    fontSize: 13,
    lineHeight: 18,
    color: "#2f2f2f",
  },
  addressBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#e8f0ff",
    borderColor: "#2a4fb652",
    borderWidth: 1,
  },
  addressBadgeText: {
    fontFamily: "montserratBold",
    fontSize: 11,
    color: "#2a4fb6",
  },
  addressDefaultButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d7d9e5",
    backgroundColor: "#ffffff",
  },
  addressDefaultButtonText: {
    fontFamily: "montserratBold",
    fontSize: 11,
    color: "#4b42c7",
  },
  addressEditButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d7d9e5",
    backgroundColor: "#ffffff",
  },
  addressEditText: {
    fontFamily: "montserratBold",
    fontSize: 11,
    color: "#4b42c7",
  },
  addressDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f1c8c7",
    backgroundColor: "#fff5f5",
  },
  addressDeleteText: {
    fontFamily: "montserratBold",
    fontSize: 11,
    color: "#d9534f",
  },
  addressDeleteButtonDisabled: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#f4f4f4",
  },
  addressDeleteTextDisabled: {
    fontFamily: "montserratBold",
    fontSize: 11,
    color: "#b8b8b8",
  },
  addressForm: {
    marginTop: 16,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#eceff4",
  },
  addressFormActions: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  addressCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d7d9e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  addressCancelText: {
    fontFamily: "montserratBold",
    fontSize: 13,
    color: "#5f6368",
  },
  addressSaveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#6C63FF",
    alignItems: "center",
  },
  addressSaveText: {
    fontFamily: "montserratBold",
    fontSize: 13,
    color: "#ffffff",
  },
  addressEmptyText: {
    fontFamily: "montserratRegular",
    fontSize: 12,
    color: "#7a7a7a",
  },
  cepHelperText: {
    marginTop: 6,
    fontFamily: "montserratRegular",
    fontSize: 12,
    color: "#7a7a7a",
  },
  makeDefaultRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  makeDefaultText: {
    fontFamily: "montserratBold",
    fontSize: 13,
    color: "#4b42c7",
  },
  makeDefaultTextDisabled: {
    fontFamily: "montserratRegular",
    fontSize: 13,
    color: "#9da1a7",
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
  inputContainerDisabled: {
    borderWidth: 2,
    borderColor: "#d7d9e5",
    borderRadius: 12,
    opacity: 0.6,
  },
  inputLabel: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#262626",
  },
  inputLabelDisabled: {
    fontFamily: "montserratRegular",
    fontSize: 14,
    color: "#9aa0a6",
  },
  inputValue: {
    fontFamily: "montserratRegular",
    fontSize: 16,
    color: "#242424",
    paddingVertical: 12,
  },
  inputValueDisabled: {
    fontFamily: "montserratRegular",
    fontSize: 16,
    color: "#9aa0a6",
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
