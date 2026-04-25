# ForBook

Aplicativo mobile para compra, venda e descoberta de livros, desenvolvido com Expo e React Native.

## Tecnologias do projeto

Esta secao resume a stack principal usada no app.

| Camada                 | Tecnologia                  | Versao no projeto        |
| ---------------------- | --------------------------- | ------------------------ |
| Runtime mobile         | React Native                | 0.81.5                   |
| Framework              | Expo                        | SDK 54 (`expo` ~54.0.33) |
| UI base                | React                       | 19.1.0                   |
| Navegacao por arquivos | Expo Router                 | ~6.0.23                  |
| Linguagem              | TypeScript                  | ~5.9.2                   |
| Validacao de dados     | Zod                         | ^4.3.6                   |
| Build em nuvem         | EAS Build                   | via `eas-cli`            |
| Qualidade de codigo    | ESLint + eslint-config-expo | ^9.25.0 / ~10.0.0        |

## Bibliotecas Expo e React Native relevantes

- `expo-camera`: leitura de camera (scanner e captura de imagem)
- `expo-image-picker`: selecao de imagens no dispositivo
- `expo-secure-store`: armazenamento seguro de dados sensiveis
- `react-native-reanimated` e `react-native-gesture-handler`: animacoes e interacoes
- `@react-navigation/*`: suporte de navegacao complementar usado no app

## Estrutura de pastas (resumo)

- `app/`: rotas e telas com Expo Router
- `app/(tabs)/`: navegacao principal por abas
- `src/components/`: componentes reutilizaveis de interface
- `src/context/`: estados globais (ex.: autenticacao)
- `src/services/`: integracao com API
- `src/schemas/`: validacoes com Zod

## Requisitos

- Node.js LTS
- npm
- Android Studio + Android SDK (para build local Android)
- Conta Expo (para EAS Build)

## Comecando

1. Instale as dependencias:

```bash
npm install
```

2. (Opcional, para EAS) Instale o CLI:

```bash
npm install -g eas-cli
```

3. (Opcional, para EAS) Faça login:

```bash
npx eas login
```

4. Configure o projeto no EAS (primeira vez):

```bash
npx eas build:configure
```

5. Inicie o app em desenvolvimento:

```bash
npx expo start
```

## Build de desenvolvimento (Android)

Voce pode escolher uma das opcoes abaixo.

### Opcao 1: Build nos servidores EAS

```bash
npx eas build --profile development --platform android
```

### Opcao 2: Build local no seu PC

Requer Android SDK instalado e telefone/emulador Android configurado.

```bash
npx expo run:android
```

Se usar build local, os passos de `eas login` e `eas build:configure` podem ser ignorados.

## Build de distribuicao

Build de preview:

```bash
npx eas build --profile preview --platform android
```

Build de producao:

```bash
npx eas build --platform android
```
