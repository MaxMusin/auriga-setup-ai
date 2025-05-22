# Auriga Setup AI

A desktop application to assist with iRacing car setup creation and adjustment using AI agents.

## 🧱 Tech Stack

- **Electron** (main + preload) for desktop app functionality and file system access
- **React + Vite + TypeScript** for the user interface
- **Monorepo structure** with pnpm workspaces
- **AI Agents** for telemetry analysis and setup recommendations

## 🎯 Project Purpose

Auriga Setup AI helps sim racers generate, modify, and automatically adjust iRacing setup files (.sto or .json) using intelligent AI agents. The application streamlines the process of analyzing telemetry data and making informed setup changes based on driver feedback or performance data.

## 🧠 AI Agents Architecture

The application uses a modular AI agent architecture:

### TelemetryAgent
- Analyzes CSV telemetry data from SimHub/iRacing
- Extracts key metrics like average speed, temperatures, braking points
- Provides insights on car behavior and performance

### EngineerAgent
- Processes driver feedback or telemetry analysis
- Suggests setup adjustments (tire pressure, springs, camber, ride height, etc.)
- Generates a JSON structure for the modified setup

### TestDriverAgent
- Evaluates the potential effects of proposed modifications
- Provides subjective feedback on how changes might affect handling
- Asks follow-up questions to refine setup adjustments

### CoordinatorAgent (optional)
- Orchestrates the other agents
- Manages the dialogue flow between agents and the user
- Provides a cohesive experience

## 📁 Setup File Handling

- Works with `.sto` files used by iRacing (INI-like or binary format)
- Converts to JSON for AI manipulation
- Converts back to `.sto` format for use in iRacing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v8+)
- iRacing and/or SimHub for telemetry data

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/auriga-setup-ai.git
   cd auriga-setup-ai
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development environment:
   ```bash
   pnpm dev
   ```

### Building for Production

1. Build the application:
   ```bash
   pnpm build
   ```

2. Package the application:
   ```bash
   pnpm package
   ```

## 📦 Project Structure

```
auriga-setup-ai/
├── apps/
│   ├── electron/         # Electron main process
│   │   ├── src/
│   │   │   ├── main.ts   # Main process entry point
│   │   │   └── preload.ts # Preload script for IPC
│   │   └── package.json
│   └── renderer/         # React frontend
│       ├── src/
│       │   ├── App.tsx   # Main React component
│       │   └── main.tsx  # React entry point
│       └── package.json
├── packages/
│   └── ai-agents/        # AI agent implementations
│       ├── src/
│       │   ├── agents/   # Agent implementations
│       │   ├── interfaces/ # TypeScript interfaces
│       │   └── utils/    # Utility functions
│       └── package.json
├── package.json          # Root package.json
└── pnpm-workspace.yaml   # Workspace configuration
```

## 🔜 Roadmap

- [ ] Implement file parsers for `.sto` format
- [ ] Integrate AI agents one by one
- [ ] Create a user-friendly interface for setup management
- [ ] Implement automated testing with SimHub
- [ ] Package the application for distribution (Windows/macOS)

## 📄 License

MIT

## 🙏 Acknowledgements

- iRacing for the racing simulation platform
- SimHub for telemetry data extraction
- The sim racing community for inspiration and feedback
