# Meeting Pair AI

**Meeting Pair AI** Meeting Pair AI is a closed-source AI assistant I built to help users take better notes during meetings. It uses OpenAI’s Whisper to transcribe system audio in real time, then feeds that into local large language models through Ollama for processing. The tool creates clean, well-written meeting notes and pushes them into the app of your choice. It’s built to run locally for speed and privacy, and it combines audio transcription, text generation, and automation to make meetings easier to follow and keep track of.

---
<img width="593" alt="Screenshot 2025-06-27 at 6 00 38 PM" src="https://github.com/user-attachments/assets/33ed70fc-d6b4-41b6-83de-69e591164e5c" />
---

## Features

- Real-time audio transcription using OpenAI’s Whisper
- Local language model processing through Ollama (e.g. LLaMA, TinyLLaMA, etc.)
- Automatic summary generation for meetings and spoken content
- Saves notes to your preferred app (Notion, Docs, etc.)
- Runs fully offline/local for privacy and speed
- Minimal UI with simple start/stop commands
- Support for visual input (via screenshot or webcam) if enabled with LLaVA
- Configurable settings for custom workflows

## Requirements

Before you begin, ensure you have installed:
- Node.js (v22.13.1 or later) and npm
- Git
- Obsidian (Or other desired note taking app)

## Install Requirements

Install Node.js (v16 or later) and npm:
```sh
brew install node
```

Install Git:
```sh
brew install git
```

## Installation

Clone the repository:

```sh
git clone https://github.com/merrittcmason/Meeting-Pair-AI/
```

Navigate to your cloned repository location:

```sh
cd your-repo
```

Install dependencies:

```sh
npm install
```

## Development

To run the application in development mode with live reload support, use:

```sh
npm run electron:dev
```
To run application from a browser:
```sh
npm run dev
```

This launches the Vite development server and opens the app in an **Electron window** or **browser window**.

## Packaging

To build and package the application into a standalone executable, use:

```sh
npm run electron:build
```

The packaged application will be available in the release folder.

- For the packaged app, open the executable found in the release folder.



## License

This project is licensed under the MIT License. See the LICENSE file for details.
