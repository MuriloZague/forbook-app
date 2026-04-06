# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm install -g eas-cli
   ```

    ```bash
    npx eas login
   ```
    ```bash
    npx eas build:configure  --> selecionar android ou ios
   ```
   ```bash
   para buildar o aplicativo voce tem duas opcoes:

   1 opcao - buildar nos servidores eas e depois baixar o app por lá
   npx eas build --profile development --platform android

   2 opcao - buildar usando seu PC (precisar ter o android SDK instalado e seu telefone conectado no usb)
   npx expo run:android

   se for usar a segunda opcao pode ignorar os 2 primeiros comandos dessa sessao
   ```
   ```bash
   --> abre o app e excuta o comando:
   
   npx expo start   
     ```

## Esses comandos geram o arquivo para development build:


   ```bash
   --> para buildar uma versao final do aplicativo usar:
   
   npx eas build --profile preview --platform android
   npx expo run:android --variant release

   --> versão de produção real:
   
   npx eas build --platform android   
   ```
