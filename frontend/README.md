# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Running without a physical device

There are several ways to run and test the app without needing to scan a QR code on your phone:

### 1. Web Browser (Recommended for quick testing)

Run the app in your web browser:

```bash
npm run web
```

or

```bash
npx expo start --web
```

This will open the app in your default browser at `http://localhost:8081` (or another port).

### 2. Tunnel Mode (Access from anywhere)

Use Expo's tunnel feature to create a public URL:

```bash
npm run tunnel
```

or

```bash
npx expo start --tunnel
```

This creates a public URL (e.g., `https://xxx.tunnel.expo.dev`) that can be accessed from anywhere:
- Perfect for testing on multiple devices
- Great for demos and sharing with team members
- Requires a free Expo account
- Ideal for GitHub Student Pack users who want to leverage cloud services

**Note**: The first time you use tunnel mode, you'll be prompted to log in to your Expo account. If you don't have one, you can create a free account at [expo.dev](https://expo.dev).

### 3. Emulator/Simulator

- **Android Emulator**: Press `a` in the terminal after running `npx expo start`
- **iOS Simulator** (macOS only): Press `i` in the terminal after running `npx expo start`

Make sure you have Android Studio (for Android) or Xcode (for iOS on macOS) installed first.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Dev auth override (optional)

For fast local development you can bypass JWT auth and send a fixed userId to the backend. This mirrors the backend's dev override and should only be used locally.

How to enable:

1. Copy `.env.example` to `.env`
2. Set these keys:
   - `EXPO_PUBLIC_DEV_AUTH_OVERRIDE=true`
   - `EXPO_PUBLIC_DEV_USER_ID=<your-dev-user-id>`
3. Start the app (`pnpm --filter frontend dev` or `npm run dev`).

What it does:

- Adds `x-user-id: <EXPO_PUBLIC_DEV_USER_ID>` to every request header.
- For POST/PUT/PATCH with JSON bodies, injects `{ userId: <id> }` if the body doesn't already include `userId` or `id`.
- If an access token is present, it will still be sent in the `Authorization` header.

Safety notes:

- Never enable this in production.
- The interceptor does not overwrite existing `userId`/`id` fields or tamper with FormData.
- Backend must also have its dev override enabled to accept the userId directly.
