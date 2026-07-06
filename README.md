# E.L.Y.S.I.U.M Desktop

A cross-platform React Native client for the E.L.Y.S.I.U.M AI platform. Runs on Android and Web with a dark, minimal interface, voice input, live conversation mode, and multi-model chat.

## Features

- **Multi-model chat** — Switch between E.L.Y.S.I.U.M (Krypton), Krypton Agent, ChatGPT, Gemini 3 Flash Preview, and Groq
- **Markdown rendering** — Full markdown support with syntax-highlighted code blocks and copy buttons
- **Voice input** — Record audio and transcribe it to text via the backend
- **Live conversation** — Full-duplex voice mode: record → silence detection (VAD) → send → play TTS response → auto-resume
- **Live logs** — Real-time SSE log viewer with level filtering and search
- **Sidebar navigation** — Collapsible sidebar with Chats, Memory, Agents, Code, Logs, Updates, Workers, and Email
- **Settings** — Accessible from the sidebar
- **Tools menu** — Generate Image and Generate Code action placeholders

## Screens

| Screen | Description |
|--------|-------------|
| Chat | Main chat interface with message history, markdown, voice input, model selection, and sidebar |
| Live Conversation | Voice-only mode with breathing animation and auto-listening loop |
| Logs | Live SSE log viewer with level filtering, search, and pause/resume |

## Tech Stack

- **React Native 0.82** (TypeScript) with react-native-web for Web
- **Zustand** — Lightweight state management (5 stores)
- **axios** — Backend HTTP communication
- **react-native-markdown-display** — Markdown rendering
- **react-native-audio-recorder-player** + **Web Audio API** — Audio recording and playback
- **Voice Activity Detection** — 8000-threshold, 1200ms silence timeout
- **Server-Sent Events** — Real-time log streaming

## Backend

The app expects a backend server (configurable via `API_BASE_URL` env / `window.__API_BASE_URL__`) with the following endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/chat/krypton/` | Default E.L.Y.S.I.U.M model |
| POST | `/v1/chat/krypton/agent/` | Autonomous agent |
| POST | `/v1/chat/gpt/` | ChatGPT |
| POST | `/v1/chat/gemini/3/flash/preview/` | Gemini 3 Flash |
| POST | `/v1/chat/groq/` | Groq (ultra-low latency) |
| POST | `/v1/transcribe/` | Audio → text transcription |
| POST | `/v1/live/conv/` | Live conversation (audio → audio) |
| GET | `/read` | SSE log stream |

## Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI / Android SDK (for Android)
- Web browser (for Web)
- Backend server running (default `127.0.0.1:8000`)

### Install

```bash
npm install
```

### Run

```bash
# Android
npm run android

# Web
npm run web
```

### Build

```bash
npm run web:build
```

### Lint / Typecheck

```bash
npm run lint
npm run typecheck
```

## Project Structure

```
src/
├── audio/
│   ├── audioEngine.ts              # Interface + platform dispatcher
│   ├── audioEngine.native.ts       # Android/iOS impl (react-native-audio-recorder-player)
│   ├── audioEngine.web.ts          # Web impl (Web Audio API + AudioWorklet)
│   └── sse.ts                      # SSE client for live log streaming
├── components/
│   ├── CodeBlock.tsx               # Syntax-highlighted code block with copy
│   ├── CopyButton.tsx              # Round copy-to-clipboard button
│   ├── InputBar.tsx                # Bottom composer bar (text input, mic, send)
│   ├── MarkdownRenderer.tsx        # Wraps react-native-markdown-display
│   ├── MessageBubble.tsx           # Single chat message (user/bubble, bot/markdown)
│   ├── ModelSelectorModal.tsx      # Model picker modal with search
│   ├── SettingsModal.tsx           # Settings placeholder
│   ├── Sidebar.tsx                 # Collapsible left navigation sidebar
│   ├── SidebarItem.tsx             # One row in the sidebar
│   ├── Snackbar.tsx                # Bottom-centered toast notification
│   ├── ToolsMenu.tsx               # Generate Image / Generate Code placeholders
│   ├── TypingIndicator.tsx         # Three animated dots
│   └── VoiceInputWidget.tsx        # Recording waveform with cancel/confirm
├── config/
│   ├── api.ts                      # Base URL resolution + endpoint map
│   ├── icons.ts                    # MaterialIcons re-export
│   ├── models.ts                   # 5 model descriptors + helpers
│   ├── sidebarItems.ts             # 8 sidebar item descriptors
│   └── theme.ts                    # Color tokens, fonts, spacing, radii
├── navigation/
│   └── RootNavigation.tsx          # Stack navigator (Chat → LiveConversation → Logs)
├── screens/
│   ├── ChatScreen.tsx              # Main chat screen
│   ├── LiveConversationScreen.tsx  # Voice-only mode
│   └── LogsScreen.tsx              # Live SSE log viewer
├── store/
│   ├── chatStore.ts                # Messages, typing, recording, model state
│   ├── liveStore.ts                # isListening/isProcessing/isPlaying
│   ├── logStore.ts                 # Log entries, filtering, connection state
│   ├── modelStore.ts               # Current model ID convenience store
│   └── uiStore.ts                  # Sidebar state, copy-toast, screen selection
├── types/
│   ├── chat.ts                     # ChatMessage interface + factory
│   ├── log.ts                      # LogEntry interface + parser
│   └── index.ts                    # Re-exports
└── utils/
    ├── audioBuffer.ts              # BytesBuilder (growable Uint8Array)
    ├── clipboard.ts                # Cross-platform clipboard wrapper
    ├── platform.ts                 # isWeb/isNative/isAndroid/isIOS helpers
    ├── request.ts                  # axios HTTP client
    ├── timer.ts                    # NativeTimer wrapper
    ├── vad.ts                      # Voice Activity Detection
    └── wav.ts                      # WAV header builder (44-byte PCM header)
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Send message |
| `Ctrl + Shift + O` | Clear chat |
| `Ctrl + C` | Toggle sidebar |
