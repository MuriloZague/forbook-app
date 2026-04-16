import { extractErrors } from "@/src/lib/zod-errors";
import {
    userCreateBodySchema,
    type UserCreateBody,
} from "@/src/schemas/user.schema";
import { useMemo } from "react";

const DISPLAY_FIELD_MAPPING: Record<string, string> = {
  email: "email",
  password: "senha",
  name: "nome",
  cpf: "cpf",
  phoneNumber: "telefone",
  birthDate: "nascimento",
  confirmPassword: "confirmPassword",
  street: "endereco",
  number: "numero",
  neighborhood: "bairro",
  city: "cidade",
  state: "estado",
  zipCode: "cep",
};

const STEP_ONE_FIELD_MAPPING: Record<string, string> = {
  email: "email",
  password: "senha",
  name: "nome",
  cpf: "cpf",
  phoneNumber: "telefone",
  birthDate: "nascimento",
};

type PasswordRequirements = {
  temMinimo8Caracteres: boolean;
  temLetraMaiuscula: boolean;
  temLetraMinuscula: boolean;
};

export interface RegisterStepOneFields {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  cpf: string;
  phoneNumber: string;
  birthDate: string;
}

export interface RegisterStepTwoFields {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

type PayloadValidationResult =
  | { success: true; data: UserCreateBody }
  | { success: false; errors: Record<string, string> };

const normalizeDigits = (value: string, maxLength?: number): string => {
  const digits = value.replace(/\D/g, "");

  if (typeof maxLength === "number") {
    return digits.slice(0, maxLength);
  }

  return digits;
};

const toBirthDateApiFormat = (birthDate: string): string => {
  const digits = normalizeDigits(birthDate, 8);
  if (digits.length !== 8) return birthDate.trim();

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return `${year}-${month}-${day}`;
};

const mapZodErrors = (
  rawErrors: Record<string, string>,
  mapping: Record<string, string>,
): Record<string, string> => {
  const mapped: Record<string, string> = {};

  for (const [zodField, message] of Object.entries(rawErrors)) {
    const localField = mapping[zodField] ?? zodField;
    mapped[localField] = message;
  }

  return mapped;
};

export function usePasswordRequirements(
  password: string,
): PasswordRequirements {
  return useMemo(
    () => ({
      temMinimo8Caracteres: password.length >= 8,
      temLetraMaiuscula: /[A-Z]/.test(password),
      temLetraMinuscula: /[a-z]/.test(password),
    }),
    [password],
  );
}

export function mapRegisterErrorsToDisplay(
  errors: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).map(([key, msg]) => [
      DISPLAY_FIELD_MAPPING[key] ?? key,
      msg,
    ]),
  );
}

export function validateRegisterStepOne(
  fields: RegisterStepOneFields,
  requirements: PasswordRequirements,
): Record<string, string> {
  const payloadForSchema: UserCreateBody = {
    email: fields.email,
    password: fields.password,
    name: fields.name,
    cpf: normalizeDigits(fields.cpf, 11),
    phoneNumber: normalizeDigits(fields.phoneNumber, 11),
    birthDate: normalizeDigits(fields.birthDate, 8),
    address: {
      street: "",
      number: "",
      complement: null,
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  };

  const result = userCreateBodySchema.safeParse(payloadForSchema);
  const filtered: Record<string, string> = {};

  if (!result.success) {
    const zodErrors = extractErrors(result.error);
    for (const [zodField, localField] of Object.entries(
      STEP_ONE_FIELD_MAPPING,
    )) {
      const message = zodErrors[zodField];
      if (message) filtered[localField] = message;
    }
  }

  if (!fields.name.trim()) filtered.nome = "Preencha o campo";
  if (!fields.email.trim()) filtered.email = "Preencha o campo";
  if (!fields.password.trim()) filtered.senha = "Preencha o campo";
  if (!fields.confirmPassword.trim())
    filtered.confirmPassword = "Preencha o campo";

  if (
    fields.password !== fields.confirmPassword &&
    fields.password.trim() &&
    fields.confirmPassword.trim()
  ) {
    filtered.confirmPassword = "As senhas não coincidem";
  }

  if (!requirements.temMinimo8Caracteres && fields.password.trim()) {
    filtered.senha = "Mínimo de 8 caracteres";
  }

  if (!requirements.temLetraMaiuscula && fields.password.trim()) {
    filtered.senha = "Precisa de uma letra maiúscula";
  }

  if (
    !requirements.temLetraMinuscula &&
    fields.password.trim() &&
    !filtered.senha
  ) {
    filtered.senha = "Precisa de uma letra minúscula";
  }

  return filtered;
}

export function buildRegisterPayload(
  stepOne: RegisterStepOneFields,
  stepTwo: RegisterStepTwoFields,
): UserCreateBody {
  return {
    email: stepOne.email.trim(),
    password: stepOne.password,
    name: stepOne.name.trim(),
    cpf: normalizeDigits(stepOne.cpf, 11),
    phoneNumber: normalizeDigits(stepOne.phoneNumber, 11),
    birthDate: toBirthDateApiFormat(stepOne.birthDate),
    address: {
      street: stepTwo.street.trim(),
      number: stepTwo.number.trim(),
      complement: stepTwo.complement.trim() || null,
      neighborhood: stepTwo.neighborhood.trim(),
      city: stepTwo.city.trim(),
      state: stepTwo.state,
      zipCode: stepTwo.zipCode.trim(),
    },
  };
}

export function validateRegisterPayload(
  payload: UserCreateBody,
  confirmPassword: string,
): PayloadValidationResult {
  const result = userCreateBodySchema.safeParse(payload);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const zodErrors = extractErrors(result.error);
  const mappedErrors = mapZodErrors(zodErrors, DISPLAY_FIELD_MAPPING);

  if (payload.password !== confirmPassword) {
    mappedErrors.confirmPassword = "As senhas não coincidem";
  }

  return { success: false, errors: mappedErrors };
}
