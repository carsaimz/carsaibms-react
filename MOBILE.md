# Carsai BMS — App Móvel (Capacitor)

A PWA React é empacotada como app Android nativa via **Capacitor**, com
acesso a câmara (scanner de código de barras), notificações push (Firebase
Cloud Messaging), partilha nativa, e funcionamento offline completo.

---

## 📦 Plugins Capacitor incluídos

| Plugin | Uso |
|---|---|
| `@capacitor/android` | Plataforma Android |
| `@capacitor/camera` | Captura de fotos (avatar, comprovativos) |
| `@capacitor/push-notifications` | Notificações push via FCM |
| `@capacitor/splash-screen` | Ecrã de abertura |
| `@capacitor/status-bar` | Cor da barra de estado |
| `@capacitor/app` | Botão voltar, deep links, estado da app |
| `@capacitor/network` | Estado de ligação (online/offline) |
| `@capacitor/preferences` | Armazenamento nativo (substitui localStorage em alguns casos) |
| `@capacitor/share` | Partilha nativa de facturas/links |
| `@capacitor/filesystem` | Guardar facturas PDF localmente |
| `@capacitor-mlkit/barcode-scanning` | Scanner de código de barras (POS) — usa ML Kit do Google, 100% offline |

### Firebase — funcionalidades nativas (`@capacitor-firebase/*`)

| Plugin | Uso | Onde é usado |
|---|---|---|
| `@capacitor-firebase/authentication` | Login com Google nativo | Página de Login (`Continuar com Google`) → troca o ID token por JWT próprio via `POST /api/auth/google` |
| `@capacitor-firebase/analytics` | Eventos e ecrãs visitados | `useAnalytics()` regista `screen_view` automaticamente em cada rota; eventos custom como `login` |
| `@capacitor-firebase/crashlytics` | Relatórios de falhas | Apanha erros não tratados (`window.onerror`, promises rejeitadas) automaticamente em `main.tsx` |
| `@capacitor-firebase/remote-config` | Feature flags sem novo deploy | `fetchRemoteConfig()` no arranque — controla `maintenance_mode`, intervalos de sync, etc. |
| `@capacitor-firebase/firestore` | Camada realtime opcional | Indicador "a escrever..." em conversas de tickets (`setTicketTyping`/`listenToTicketTyping`) |

Todos os módulos nativos Firebase estão em `client/src/lib/native/firebase-native.ts`
e são **no-op automático no browser** (web usa apenas Messaging via `lib/firebase.ts`).
Não é preciso configuração extra além do `google-services.json` já usado para Push.

---

## 🚀 Configuração inicial (uma vez)

```bash
cd client
npm install

# Adicionar a plataforma Android (cria a pasta android/)
npx cap add android

# Sincronizar configuração + plugins
npx cap sync android
```

### Firebase (Push Notifications)

1. Criar projecto em https://console.firebase.google.com
2. Adicionar app Android com package name `com.carsaibms.lite`
3. Descarregar `google-services.json`
4. Colocar em `client/android/app/google-services.json` (já está no `.gitignore` — nunca commitar)
5. Para CI/CD: codificar em base64 e guardar como secret `GOOGLE_SERVICES_JSON_BASE64`:
   ```bash
   base64 -i google-services.json | tr -d '\n' | pbcopy   # macOS
   base64 -w0 google-services.json                          # Linux
   ```

### Assinatura da App (Keystore)

```bash
keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias carsai
```

Guardar como secrets no GitHub:
- `ANDROID_KEYSTORE_BASE64` — `base64 -w0 release.jks`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

---

## 🔧 Desenvolvimento local

```bash
# Build da web app + sync com Android
npm run cap:build

# Abrir no Android Studio
npm run cap:android

# Correr num emulador/dispositivo a partir do Android Studio
```

---

## 📱 Scanner de Código de Barras (POS)

O POS (`/pos`) usa `@capacitor-mlkit/barcode-scanning` para ler códigos de
barras de produtos via câmara, 100% offline (ML Kit corre no dispositivo).

- **No telemóvel (app nativa)**: toca em "Scan" → abre a câmara → lê o código → adiciona o produto automaticamente ao carrinho.
- **No browser (PWA web)**: o botão "Código" pede introdução manual do código (a leitura por câmara no browser exigiria uma biblioteca JS adicional, fora do âmbito desta fase).

Os produtos têm agora um campo `barcode` (separado do `sku`), pesquisável
tanto na API pública (`GET /api/products?search=`) como no POS.

---

## 🏗️ Build de Produção

### Manual
```bash
cd client
npm run build
npx cap sync android
cd android
./gradlew assembleRelease   # gera .apk
./gradlew bundleRelease     # gera .aab (para Google Play)
```//
Ficheiros gerados em:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Via GitHub Actions (automático)
Ver `.github/workflows/release-android.yml` — disparado manualmente
(`workflow_dispatch`) ou ao criar uma tag `v*` (ex: `v1.0.0`).

Secrets necessários no repositório GitHub:
| Secret | Descrição |
|---|---|
| `GOOGLE_SERVICES_JSON_BASE64` | `google-services.json` codificado em base64 |
| `ANDROID_KEYSTORE_BASE64` | Keystore de assinatura codificado em base64 |
| `ANDROID_KEYSTORE_PASSWORD` | Password do keystore |
| `ANDROID_KEY_ALIAS` | Alias da chave |
| `ANDROID_KEY_PASSWORD` | Password da chave |
| `VITE_FIREBASE_*` | 6 variáveis do Firebase (Web Push + Analytics) |
| `FIREBASE_SERVICE_ACCOUNT` | Conta de serviço Firebase (base64) para push server-side e verificação de Google ID tokens |

O workflow gera APK + AAB e anexa-os automaticamente a uma GitHub Release
quando uma tag `v*` é publicada.

---

## 🍎 iOS (futuro)

```bash
npx cap add ios
npx cap sync ios
npx cap open ios   # requer macOS + Xcode
```

A estrutura está pronta para iOS — falta apenas adicionar a plataforma e
configurar o `GoogleService-Info.plist` equivalente para Firebase no iOS.
