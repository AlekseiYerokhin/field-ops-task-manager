# Field Operations Task Manager

**Candidate Code: SA-RN-7429**

A React Native mobile application for field technicians to manage daily work tasks with offline-first architecture.

## Features

- ✅ **Task Management**: Create, edit, delete tasks with full CRUD operations
- ✅ **Offline-First**: Works 100% offline with automatic sync when online
- ✅ **Image Attachments**: Attach photos to tasks from gallery or camera
- ✅ **Push Notifications**: Local notifications 30 minutes before task due dates
- ✅ **Map Integration**: View tasks with locations on interactive map
- ✅ **History Log**: Comprehensive audit trail of all task actions
- ✅ **Light/Dark Theme**: Toggle between light and dark modes
- ✅ **Demo Mode**: Test notifications in 45 seconds instead of 30 minutes

## Tech Stack

- **Framework**: React Native with Expo (SDK 57)
- **Language**: TypeScript (Strict mode)
- **Navigation**: React Navigation (bottom tabs + stack)
- **State Management**: Zustand
- **Local Database**: expo-sqlite
- **Maps**: react-native-maps
- **Notifications**: expo-notifications
- **Image Picker**: expo-image-picker
- **Network**: @react-native-community/netinfo
- **Mock API**: json-server

## Installation

### Prerequisites

- Node.js 18+ and npm
- Android Studio (for Android emulator) OR physical Android device
- Expo Go app (for testing on physical device)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/AlekseiYerokhin/field-ops-task-manager.git
cd field-ops-task-manager
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```
API_BASE_URL=http://localhost:3000
APP_ENV=development
```

4. Start the mock server (in a separate terminal):

```bash
npm run mock-server
```

5. Start the Expo development server:

```bash
npx expo start
```

6. Run on Android emulator:

```bash
npx expo run:android
```

Or scan the QR code with Expo Go app on your physical device.

## Mock Server Setup

The app uses `json-server` as a mock REST API for synchronization.

```bash
# Start mock server on port 3000
npm run mock-server
```

The mock server uses `mock-server/db.json` as the data source. Sample data is included.

## Architecture

### Folder Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── navigation/       # React Navigation setup
├── screens/          # Screen components
├── services/         # Business logic (notifications, sync)
├── storage/          # SQLite database and repositories
├── store/            # Zustand state management
├── theme/            # Theme colors and configuration
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Data Flow

1. **Local Storage**: All data stored in SQLite via `storage/` repositories
2. **State Management**: Zustand stores in `store/` connect UI to storage
3. **Sync Service**: `services/syncService.ts` monitors network and syncs pending changes
4. **API Layer**: `api/` abstracts REST calls (mock or production)

### Sync Strategy

- **Offline-First**: All operations work offline
- **Queue-Based**: Changes queued with `syncStatus: 'pending'`
- **Last-Write-Wins**: On conflict, local version overwrites remote
- **Auto-Sync**: Triggers automatically when network restored

### Notifications

- Scheduled 30 minutes before task due date
- **Demo Mode**: Toggle in Settings to trigger in 45 seconds
- Handles edge case: due date < 30 min away triggers immediately
- Requires notification permissions (graceful fallback if denied)

## Building APK

### Using EAS Build (Recommended)

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Configure EAS:

```bash
eas build:configure
```

3. Build APK:

```bash
eas build --platform android --profile preview
```

4. Download APK from the provided URL.

### Local Build

```bash
npx expo run:android --variant release
```

APK will be in `android/app/build/outputs/apk/release/`

## Known Limitations

1. **Geocoding**: Real geocoding not implemented. Uses predefined location dropdown.
2. **Attachment Size**: No file size limits enforced.
3. **Conflict Resolution**: Simple last-write-wins strategy.
4. **Multi-User**: No user authentication or multi-user support.
5. **Background Sync**: Sync only triggers when app is foregrounded.

## Testing

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

Run ESLint:

```bash
npm run lint
```

## AI/Tooling Disclosure

This project was developed with assistance from AI coding tools for:

- Code generation and boilerplate
- Debugging and error resolution
- Architecture suggestions

All code was reviewed and validated by the developer.

## License

MIT
