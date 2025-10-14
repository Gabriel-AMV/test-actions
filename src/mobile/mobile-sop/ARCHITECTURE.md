# Architecture Documentation

## Overview

This is a React Native application built with Expo, TypeScript, and an offline-first architecture using SQLite for local data persistence and TanStack Query for state management.

## Technology Stack

### Core
- **React Native 0.81.4** with **React 19.1.0**
- **Expo SDK 54** - Development framework
- **TypeScript 5.9** - Type safety

### Navigation
- **React Navigation 7** (Native Stack) - Simple stack-based navigation for Login → Folder hierarchy

### State Management
- **TanStack Query 5** - Server state management with offline-first capabilities
- **SQLite (expo-sqlite)** - Local database with CR-SQLite for performance

### Security
- **expo-secure-store** - Encrypted storage for sensitive data (tokens, credentials)
- **SQLite with CR-SQLite** - Enhanced database performance and capabilities

### Networking
- **Axios** - HTTP client with interceptors for auth token management

### Code Quality
- **ESLint** - Linting with TypeScript, React, and React Native rules
- **Prettier** - Code formatting
- **Husky + lint-staged** - Pre-commit hooks

### Testing
- **Jest 30** - Test runner
- **@testing-library/react-native** - Component testing
- **jest-expo** - Expo-specific Jest preset

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Generic UI components
│   └── layout/         # Layout components
├── screens/            # Screen components
│   ├── LoginScreen.tsx
│   └── FolderViewScreen.tsx
├── navigation/         # Navigation setup
│   └── RootNavigator.tsx
├── services/           # External services
│   ├── api/           # API client and endpoints
│   │   └── client.ts
│   └── storage/       # Storage services
│       └── secureStorage.ts
├── database/          # SQLite database
│   ├── index.ts       # Database initialization
│   ├── models/        # Database models/types
│   │   ├── User.ts
│   │   ├── Folder.ts
│   │   └── File.ts
│   └── migrations/    # Database migrations
│       ├── index.ts
│       └── 001_initial_schema.ts
├── hooks/             # Custom React hooks
│   └── useFolders.ts
├── utils/             # Utility functions
│   └── logger.ts
├── types/             # TypeScript types
│   └── navigation.ts
├── config/            # Configuration
│   ├── env.ts
│   └── queryClient.ts
└── constants/         # App constants

__tests__/
├── unit/              # Unit tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests
```

## Key Features

### 1. Offline-First Architecture

- **SQLite Database**: All data stored locally for offline access
- **TanStack Query**: Handles caching, synchronization, and optimistic updates
- **Automatic Sync**: Background sync when network available

### 2. Database Schema

**Users Table**: User authentication data
- id, username, email, created_at, updated_at

**Folders Table**: Hierarchical folder structure
- id, name, parent_id, user_id, created_at, updated_at
- Self-referencing for nested folders

**Files Table**: File metadata
- id, name, folder_id, size, mime_type, local_path, remote_url, synced, created_at, updated_at

### 3. Security

- **Secure Token Storage**: Auth tokens stored in expo-secure-store (encrypted)
- **Token Refresh**: Automatic token refresh with interceptors
- **SQL Injection Protection**: Parameterized queries
- **Future**: SQLCipher encryption for database, Sentry error tracking

### 4. State Management

**TanStack Query** manages:
- Server state caching
- Background refetching
- Optimistic updates
- Query invalidation
- Offline persistence (planned)

Example usage:
```typescript
const { data: folders } = useFolders(parentId);
const createFolder = useCreateFolder();
```

### 5. Navigation

Simple stack navigator:
- **Login Screen** → **Folder View Screen**
- Folder View can navigate to sub-folders (same screen, different params)
- Uses TypeScript for type-safe navigation params

### 6. API Client

- Axios-based with interceptors
- Automatic auth token injection
- Token refresh on 401
- Error handling and logging

## Environment Configuration

Copy `.env.example` to `.env`:
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

Note: Only variables prefixed with `EXPO_PUBLIC_` are accessible in the app.

## Development Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Testing
npm test
npm run test:watch
npm run test:coverage
```

## Database Migrations

Migrations are run automatically on app startup. To add a new migration:

1. Create `src/database/migrations/00X_description.ts`
2. Export `up` and `down` functions
3. Add to migrations array in `src/database/migrations/index.ts`

Example:
```typescript
export const up = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE example (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);
};

export const down = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync('DROP TABLE IF EXISTS example;');
};
```

## Path Aliases

TypeScript path aliases configured in `tsconfig.json` and `babel.config.js`:

- `@/` → `src/`
- `@components/` → `src/components/`
- `@screens/` → `src/screens/`
- `@services/` → `src/services/`
- `@database/` → `src/database/`
- `@hooks/` → `src/hooks/`
- `@utils/` → `src/utils/`
- `@types/` → `src/types/`
- `@config/` → `src/config/`

## Testing Strategy

### Unit Tests
- Test individual functions and hooks
- Mock external dependencies
- Located in `__tests__/unit/`

### Integration Tests
- Test feature flows
- Use real database (in-memory)
- Located in `__tests__/integration/`

### E2E Tests
- Test complete user flows
- Future: Use Detox or Maestro

## Future Enhancements

- [ ] Sentry integration for error tracking
- [ ] TanStack Query persistence plugin
- [ ] SQLCipher for database encryption
- [ ] Biometric authentication
- [ ] File upload/download with progress
- [ ] Conflict resolution for offline changes
- [ ] Background sync worker
- [ ] Push notifications

## Security Best Practices

1. **Never commit** `.env` files
2. **Use expo-secure-store** for sensitive data
3. **Validate all user inputs** before database operations
4. **Use parameterized queries** to prevent SQL injection
5. **Implement proper authentication** before production
6. **Enable Hermes** for better performance and security
7. **Use ProGuard** for code obfuscation (Android)

## Performance Considerations

- **CR-SQLite enabled** for better database performance
- **Query key factory pattern** for efficient cache invalidation
- **Optimistic updates** for instant UI feedback
- **Image optimization** (to be implemented)
- **Lazy loading** for large lists (FlatList with pagination)

## Contributing

1. Follow ESLint/Prettier rules (enforced by pre-commit hooks)
2. Write tests for new features
3. Update this documentation for architectural changes
4. Use conventional commits