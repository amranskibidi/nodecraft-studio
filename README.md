# 🎮 NodeCraft Studio

[![Next.js](https://img.shields.io/badge/Framework-Next.js_14-black?style=flat-square\&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square\&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38bdf8?style=flat-square\&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

> **NodeCraft Studio** is a modern, high-performance web-based visual node graph editor built for game developers, technical designers, and system architects.

Design game logic, visualize system architectures, model data pipelines, and generate structured AI prompts for LLMs such as **Gemini, ChatGPT, and Claude** — all from one visual workspace.

---

## ✨ Features

### 🧠 Interactive Visual Node Canvas

* Create and edit nodes visually.
* Drag nodes freely across the canvas.
* Pan and zoom through an infinite-style workspace.
* Organize complex game logic and system architectures visually.

### ⚡ Glowing Bezier Connections

Create dynamic connections between nodes using glowing Bezier wires with custom neon color palettes:

* 🩵 Neon Cyan
* 💚 Emerald
* 💜 Electric Violet
* 🟡 Amber Gold
* 🌹 Neon Rose

### 🤖 AI Prompt Exporter

Automatically serialize your node graph into structured **Markdown prompts** designed for use with LLMs.

Compatible with AI assistants such as:

* Gemini
* ChatGPT
* Claude
* Other LLM-based coding assistants

### 📤 Multi-Format Export

Export and manage your projects in multiple formats:

| Format   | Purpose                                             |
| -------- | --------------------------------------------------- |
| **PNG**  | Export the visual canvas as a high-resolution image |
| **PDF**  | Generate a document version of your node graph      |
| **JSON** | Save and load native project state                  |

### 🛡️ Safe Workspace Controls

* Canvas clearing confirmation modal.
* Visual warnings before destructive actions.
* Helps prevent accidental loss of your node graph.

### 🎨 Futuristic Dark UI

Built with a modern dark interface featuring:

* Tailwind CSS v4
* Backdrop blur effects
* Neon visual accents
* Smooth animations
* Lucide React icons
* Grid-based canvas background

---

## 🛠️ Tech Stack

| Technology                                      | Purpose                                    |
| ----------------------------------------------- | ------------------------------------------ |
| [Next.js](https://nextjs.org/)                  | React framework & application architecture |
| [TypeScript](https://www.typescriptlang.org/)   | Type-safe development                      |
| [Tailwind CSS](https://tailwindcss.com/)        | Styling & responsive UI                    |
| [Lucide React](https://lucide.dev/)             | Interface icons                            |
| [html2canvas](https://html2canvas.hertzen.com/) | Canvas/image rendering                     |
| [jsPDF](https://github.com/parallax/jsPDF)      | PDF generation                             |

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed:

* **Node.js** `v18.0.0` or higher
* **npm**

Check your installed versions:

```bash
node -v
npm -v
```

---

### 📥 Installation

#### 1. Clone the repository

```bash
git clone https://github.com/amranskibidi/nodecraft-studio.git
```

#### 2. Navigate to the project directory

```bash
cd nodecraft-studio
```

#### 3. Install dependencies

```bash
npm install
```

#### 4. Start the development server

```bash
npm run dev
```

#### 5. Open the application

Open your browser and visit:

```text
http://localhost:3000
```

You can now start creating and connecting your node graphs.

---

## 🎮 Canvas Navigation & Controls

| Action            | Control / Interaction                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **Move Node**     | Click and drag any node card                                                                    |
| **Pan Canvas**    | Click and drag on an empty area of the canvas                                                   |
| **Connect Nodes** | Click the output port on the right side of a node, then click the input port on the target node |
| **Delete Cable**  | Click directly on a glowing Bezier wire                                                         |
| **Zoom In / Out** | Use the zoom controls in the bottom-right corner                                                |
| **Clear Canvas**  | Click the red **Clear Canvas** button in the top toolbar                                        |

---

## 📁 Project Structure

```text
nodecraft-studio/
├── app/
│   ├── layout.tsx          # Root layout & application metadata
│   ├── page.tsx            # Core node editor & state logic
│   └── globals.css         # Custom styles, animations & grid background
│
├── public/                 # Static media assets
│
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Scripts & dependencies
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

---

## 🧩 Use Cases

NodeCraft Studio can be used for:

* 🎮 Game feature logic planning
* 🧱 System architecture visualization
* 🔄 Data pipeline modeling
* 🧠 AI-assisted development workflows
* 📋 Technical design documentation
* 🗺️ Game mechanic planning
* 🤖 Generating structured AI coding prompts

---

## 🤖 AI Workflow

A typical workflow looks like this:

```text
Design Node Graph
       ↓
Connect Game/System Logic
       ↓
Organize & Visualize
       ↓
Export AI Prompt
       ↓
Send to Gemini / ChatGPT / Claude
       ↓
Generate Implementation
```

This workflow allows developers to visually describe complex systems before turning them into implementation-ready AI prompts.

---

## 📦 Available Scripts

Run these commands from the project directory:

```bash
# Start development server
npm run dev

# Build the application
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 🗺️ Roadmap

Future improvements may include:

* [ ] More node types
* [ ] Custom node creation
* [ ] Node grouping
* [ ] Minimap navigation
* [ ] Undo / Redo history
* [ ] Keyboard shortcuts
* [ ] Project autosave
* [ ] Cloud project storage
* [ ] More export formats
* [ ] Advanced AI prompt templates
* [ ] Real-time collaboration

---

## 🔗 Repository

GitHub repository:

**https://github.com/amranskibidi/nodecraft-studio**

---

## 📄 License

Copyright © 2026 **amranskibidi**.

Distributed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for more information.

---

## ⭐ Support

If you find **NodeCraft Studio** useful, consider giving the repository a ⭐ on GitHub.

Made with ❤️ and TypeScript.

**NodeCraft Studio — Visualize. Connect. Build.**
