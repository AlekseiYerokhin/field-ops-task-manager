# Product Requirements Document (PRD)

**Product Name:** Field Operations Task Manager (Mobile)
**Document Version:** 2.0
**Target Platform:** Android (React Native)
**Assignment Type:** Intern Test Task (48-hour deadline)

---

## 1. Product Overview

### 1.1 Purpose

The Field Operations Task Manager is an internal productivity mobile application designed for field employees (technicians) who work outside the office. The application enables them to create, plan, track, and review daily work tasks, including managing locations, attachments, status changes, and action history.

### 1.2 Core Philosophy

The application must be built with an **"Offline-First"** architecture. Field technicians often work in areas with poor or no network connectivity. The app must remain fully functional for all core operations offline and seamlessly synchronize with the backend when connectivity is restored.

### 1.3 Candidate Code Requirement

Each candidate must generate a unique code (e.g., `SA-RN-1234`) and include it in **all three** of the following places:

1. In the app footer, About screen, or Settings screen.
2. In the `README.md` file.
3. In the video demonstration.

Submissions without the candidate code in all three locations are considered incomplete.

---

## 2. User Personas

**Field Technician (Primary User):** Needs a fast, reliable, and easy-to-use interface to log tasks, attach photos of their work, and update statuses while on the go, often with dirty hands or in bright sunlight.

---

## 3. Scope

### 3.1 In-Scope (MVP)

- Offline-first Task CRUD (Create, Read, Update, Delete).
- Local data persistence and background synchronization with a mock REST API (`json-server`).
- Image attachments and local file metadata storage.
- Local push notifications for task due dates (with demo/debug mode).
- Map integration with task location markers.
- Comprehensive audit/history logging.
- Light/Dark theme support and accessibility compliance.
- Candidate code display in-app, in README, and in video.

### 3.2 Out-of-Scope

- User authentication/authorization.
- Production backend (mock `json-server` is sufficient).
- Real-time collaboration (multi-user live editing).
- Real-time geocoding (manual address entry or predefined dropdowns are acceptable).

---

## 4. Functional Requirements

### 4.1 Task Management (CRUD)

| ID         | Requirement                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-1.1** | Users must be able to create and edit tasks with the following fields:                                                                                                                                         |
|            | - **Title:** Text (Required).                                                                                                                                                                                  |
|            | - **Description:** Text (Required).                                                                                                                                                                            |
|            | - **Due Date/Time:** DateTime picker (Required).                                                                                                                                                               |
|            | - **Location:** Manual address input (Required). Predefined location dropdown or manual coordinate entry is an acceptable alternative to real geocoding. Coordinate selection on map is a plus.                |
|            | - **Attachments:** Image attachment support is required. At least one image capability must exist, but attachments are **not mandatory at task creation**. PDF/other file support is optional but recommended. |
|            | - **Status:** Enum: `New`, `In Progress`, `Completed`, `Cancelled` (Required, defaults to `New`).                                                                                                              |
| **FR-1.2** | The system must enforce basic input validation and display user-friendly error messages. Incomplete or invalid tasks cannot be saved.                                                                          |
| **FR-1.3** | Users must be able to view a list of all tasks displaying: title, due date/time, status, and location summary.                                                                                                 |
| **FR-1.4** | The task list must support sorting by: Date Added, Due Date, and Current Status.                                                                                                                               |
| **FR-1.5** | Users must be able to open a detailed view showing full task info, attachments, location, and history.                                                                                                         |
| **FR-1.6** | Users must be able to delete tasks. Completed and Cancelled tasks remain visible in the list until explicitly deleted.                                                                                         |
| **FR-1.7** | The system must display a clear, illustrative empty state when no tasks exist.                                                                                                                                 |

### 4.2 Status & History Management

| ID         | Requirement                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **FR-2.1** | Users can update task status to `In Progress`, `Completed`, or `Cancelled`.                                         |
| **FR-2.2** | Every status change, creation, edit, attachment change, deletion, and sync event must be recorded in a History Log. |
| **FR-2.3** | Each log entry must include: Timestamp, Action Type, and a short description.                                       |
| **FR-2.4** | The History Log must be displayed in a dedicated tab/screen and persist locally across app restarts.                |

### 4.3 Attachments

| ID         | Requirement                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **FR-3.1** | Users must be able to attach at least one image to a task.                                                                                             |
| **FR-3.2** | Attached files/images must be displayed on the task detail screen.                                                                                     |
| **FR-3.3** | The system must store sufficient attachment metadata locally so attachments remain visible after an app restart, even if the network is down.          |
| **FR-3.4** | The system must handle missing, deleted, or inaccessible attachments gracefully (e.g., showing a "File Unavailable" placeholder rather than crashing). |

### 4.4 Push Notifications

| ID         | Requirement                                                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-4.1** | The system must schedule a local push notification exactly 30 minutes before the task's due date/time.                                                                                                                                 |
| **FR-4.2** | If a task is created/edited and the due date is less than 30 minutes away, the system must trigger an immediate notification or display a clear in-app validation/fallback message.                                                    |
| **FR-4.3** | The system must gracefully handle notification permission denials and OS-level errors.                                                                                                                                                 |
| **FR-4.4** | **Demo/Debug Mode:** The app must include a debug mode that can trigger the same notification flow after 30-60 seconds, so reviewers can verify the implementation without waiting 30 minutes. This must be demonstrated in the video. |

### 4.5 Location & Maps

| ID         | Requirement                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **FR-5.1** | Users must be able to attach a location to a task via manual address input.                                                      |
| **FR-5.2** | If real geocoding is not implemented, the app must provide either manual coordinate entry or a predefined dropdown of locations. |
| **FR-5.3** | Tasks with locations must be displayed as pins/markers on a Map screen (using `react-native-maps` or equivalent).                |
| **FR-5.4** | Tapping a map marker must allow the user to open the corresponding task details.                                                 |

### 4.6 Offline Support & Mock Synchronization

| ID         | Requirement                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-6.1** | The app must function 100% offline for creating, editing, viewing, and deleting tasks.                                                 |
| **FR-6.2** | Tasks and logs must be stored locally and remain available after app restart.                                                          |
| **FR-6.3** | When network connectivity is restored, the app must automatically synchronize local changes with the mock REST server (`json-server`). |
| **FR-6.4** | The UI must display a clear sync status indicator (e.g., Pending Sync, Synced, Sync Failed).                                           |
| **FR-6.5** | Conflict resolution: The baseline strategy is Last-Write-Wins. If a more robust strategy is implemented, it must be documented.        |
| **FR-6.6** | The `json-server` setup must include setup instructions and sample seed data in the repository.                                        |

---

## 5. Non-Functional Requirements

### 5.1 UI/UX & Accessibility

| ID          | Requirement                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| **NFR-1.1** | The interface must be clean, modern, and optimized for field workers (high contrast, large tap targets).      |
| **NFR-1.2** | The app must support Light and Dark themes with a visible toggle in the settings.                             |
| **NFR-1.3** | The app must implement standard UI states: Loading, Empty, Error, and Success.                                |
| **NFR-1.4** | The layout must be fully responsive and usable on standard Android phone screens without clipped text.        |
| **NFR-1.5** | Accessibility basics are required: readable text sizes, clear button labels, and screen-reader compatibility. |

### 5.2 Code Quality & Architecture

| ID          | Requirement                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **NFR-2.1** | Strict TypeScript must be used across the entire codebase.                                                                                                         |
| **NFR-2.2** | The architecture must enforce a strict separation of concerns: UI components must be decoupled from data access, storage, synchronization, and notification logic. |
| **NFR-2.3** | The project must follow a standardized folder structure (e.g., `screens`, `components`, `services`, `storage`, `api`, `hooks`, `types`, `utils`).                  |
| **NFR-2.4** | Meaningful naming conventions must be used. Comments should only clarify non-obvious business logic.                                                               |
| **NFR-2.5** | Secrets and API keys must never be committed to the repository; environment variables (`.env`) must be used.                                                       |
| **NFR-2.6** | A meaningful commit history is preferred over a single final commit.                                                                                               |

---

## 6. Technical Stack & Architecture Guidelines

| Component            | Options / Notes                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | React Native (Expo or React Native CLI). Final APK must be installable and testable.                                   |
| **Language**         | TypeScript (Strict mode).                                                                                              |
| **Local Database**   | SQLite, WatermelonDB, MMKV, or AsyncStorage. Engineering team to select and justify.                                   |
| **State Management** | Redux Toolkit, Zustand, or React Context. Team to select and justify in README.                                        |
| **Maps**             | `react-native-maps` or equivalent.                                                                                     |
| **Notifications**    | `notifee`, `expo-notifications`, or equivalent.                                                                        |
| **Mock Backend**     | `json-server` with seed data. API layer must be abstracted so the app can switch between mock and production REST API. |

---

## 7. Core Data Models (Proposed)

Engineering team to refine. The local schema must support at minimum:

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO 8601
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'New' | 'In Progress' | 'Completed' | 'Cancelled';
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

interface Attachment {
  id: string;
  taskId: string;
  uri: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface HistoryLog {
  id: string;
  taskId: string;
  timestamp: string;
  actionType:
    | 'created'
    | 'edited'
    | 'status_changed'
    | 'attachment_added'
    | 'attachment_removed'
    | 'deleted'
    | 'synced';
  description: string;
}
```

---

## 8. Bonus Points (Nice-to-Have)

These are not required but will positively impact evaluation:

- Search and filtering by title, status, or date range.
- Basic unit tests for validation, storage, sync, or reducers.
- Better sync conflict handling than last-write-wins (e.g., field-level merging).
- Reusable UI components and polished animations used appropriately.
- Support for multiple attachment types (video, PDF).
- Better accessibility support and responsive layout handling.

---

## 9. Submission Requirements

### 9.1 Deliverables

| Deliverable     | Details                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source Code** | GitHub (or other) repository link. If private, reviewers must be invited.                                                                                                                         |
| **APK**         | Working APK file or unrestricted Google Drive link. Must be installable and not crash on launch.                                                                                                  |
| **Video Demo**  | 2-5 minutes, unrestricted Google Drive link. Must cover all items in Section 10.                                                                                                                  |
| **README.md**   | Must include: project overview, installation/run instructions, APK build instructions, mock server setup, architecture explanation, known limitations, AI/tooling disclosure, and candidate code. |
| **Email**       | Sent to specified addresses with subject line format, including: full name, CV (PDF), resume/profile link, repo link, APK link, video link, tech stack explanation, and design decisions.         |

### 9.2 Candidate Code

The unique candidate code (e.g., `SA-RN-1234`) must appear in:

1. The app (footer, About, or Settings screen).
2. The `README.md` file.
3. The video demonstration.

---

## 10. Video Demonstration Requirements

**Duration:** 2-5 minutes. **Access:** Must be viewable without requesting access.

The video must demonstrate:

1. The app installed and running from the APK or release build.
2. Creating a task with title, description, due date/time, location, and an attachment.
3. Validation behavior when required fields are missing or invalid.
4. Task list, sorting, detail screen, status update, and delete flow.
5. Map screen with task markers.
6. Local notification flow (using the 30-60 second demo mode).
7. History tab with timestamps and task actions.
8. Offline behavior and sync status with the mock server.
9. Light/dark theme toggle.
10. A brief code walkthrough of one important module (e.g., sync service, local storage layer, notification scheduler, or map integration).
11. The candidate code visible in the app.

---

## 11. Evaluation Criteria

| Criterion                       | Weight | What We Look For                                                                                       |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| **Core Functionality**          | 25%    | CRUD, statuses, sorting, details, deletion, validation.                                                |
| **Advanced Functionality**      | 25%    | Attachments, notifications, map/location, history log, offline sync.                                   |
| **Code Quality & Architecture** | 20%    | Clear structure, TypeScript types, separation of concerns, error handling.                             |
| **UI/UX Quality**               | 15%    | Clean layout, theme toggle, useful states, field-worker usability.                                     |
| **Submission Quality**          | 10%    | README, video, APK, repository access, clear setup instructions.                                       |
| **Code Understanding**          | 5%     | Ability to explain decisions and important implementation details in the video or follow-up interview. |

---

## 12. Automatic Rejection Conditions

- Submission is late (even by 1 minute).
- APK is missing, cannot be installed, or crashes immediately on launch.
- Video link is missing, private, or cannot be viewed.
- Repository link is missing or inaccessible.
- Candidate code is missing from the app, README, or video.
- The project is clearly unrelated to the assignment or appears to be a generic template without meaningful adaptation.
- The candidate cannot explain the main parts of the submitted code during a follow-up review.

---

## 13. Future Enhancements (Post-MVP)

- Real-time geocoding (auto-complete addresses).
- Advanced sync conflict resolution (e.g., field-level merging).
- Unit and integration test coverage expansion.
- Advanced search and filtering (by title, status, date range).
- Support for multiple complex attachment types (video, large PDFs).
- Dispatcher/Manager backend view for tracking technician progress.
