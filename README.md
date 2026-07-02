# E.L.Y.S.I.U.M Desktop

A Flutter desktop client for the E.L.Y.S.I.U.M AI platform. Built for Linux with a dark, minimal interface, voice input, live conversation mode, and multi-model chat.

## Features

- **Multi-model chat** — Switch between E.L.Y.S.I.U.M (Krypton), Krypton Agent, ChatGPT, and Gemini 3 Flash Preview
- **Markdown rendering** — Full markdown support with syntax-highlighted code blocks and copy buttons
- **Voice input** — Record audio and transcribe it to text via the backend
- **Live conversation** — Full-duplex voice mode: record → silence detection → send → play TTS response → auto-resume
- **Sidebar navigation** — Collapsible sidebar with Chats, Memory, Agents, Code, Logs, Updates, Workers, and Email
- **Keyboard shortcuts** — `Ctrl + Enter` to send, `Ctrl + Shift + O` to clear chat, `Ctrl + C` to toggle the sidebar
- **Settings** — Accessible from the sidebar

## Screens

| Screen | Description |
|--------|-------------|
| Chat | Main chat interface with message history, markdown, voice input, and model selection |
| Live Conversation | Voice-only mode with breathing animation and auto-listening loop |

## Tech Stack

- **Flutter** (Dart SDK ^3.10.0) with Material 3
- **google_fonts** — Outfit + Inter typography
- **http** — Backend API communication
- **markdown_widget** — Markdown rendering
- **record** + **audioplayers** — Audio recording and playback

## Backend

The app expects a local backend server running at `http://127.0.0.1:8000` with the following endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/chat/krypton/` | Default E.L.Y.S.I.U.M model |
| POST | `/v1/chat/krypton/agent/` | Autonomous agent |
| POST | `/v1/chat/gpt/` | ChatGPT |
| POST | `/v1/chat/gemini/3/flash/preview/` | Gemini 3 Flash |
| POST | `/v1/transcribe/` | Audio → text transcription |
| POST | `/v1/live/conv/` | Live conversation (audio → audio) |

## Getting Started

### Prerequisites

- Flutter SDK (^3.10.0)
- Linux build dependencies (GTK, CMake, clang)
- `arecord` (ALSA) for Linux audio recording fallback
- Backend server running on `127.0.0.1:8000`

### Run

```bash
flutter pub get
flutter run -d linux
```

### Build

```bash
flutter build linux
```

## Project Structure

```
lib/
├── main.dart                          # App entrypoint, dark Material 3 theme
├── models/
│   └── chat_message.dart              # Chat message data model
├── screens/
│   ├── chat_screen.dart               # Main chat screen + sidebar integration
│   └── live_conversation_screen.dart  # Voice conversation mode
├── widgets/
│   ├── sidebar.dart                   # Collapsible navigation sidebar
│   ├── model_selector_modal.dart      # Model picker dialog
│   ├── voice_input_widget.dart        # Voice recording with waveform
│   └── typing_indicator.dart          # Animated typing indicator
└── linux/                             # Linux GTK runner (CMake)
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Send message |
| `Ctrl + Shift + O` | Clear chat |
| `Ctrl + C` | Toggle sidebar |
