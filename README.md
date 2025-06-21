# Dataflow - Visual Logic Builder for the Web

Dataflow is a browser-based visual programming environment designed for learning, prototyping, and executing logic without touching traditional syntax. Inspired by UE5's Blueprints—but reimagined for data, structures, and flow control.
Dataflow allows developers to build functional logic through an intuitive graph interface.

- 🧠 Define and reuse custom nodes and data types
- 🔍 Hover-to-debug and trace execution output visually
- 🔄 Supports both local and remote execution environments
- 🌐 Built using JSON-schema and designed for backend/runtime portability
- 🛠 Full introspection of variables, types, execution state and graph structure
- ⚡️ Built for speed. Node movements, edits, and graph interactions are reflected instantly thanks to a minimal re-rendering architecture. Designed for responsiveness without sacrificing structure

> 💼 Built as a cornerstone project to demonstrate architecture-level thinking and full-stack implementation beyond language boundaries.

## 🚀 Getting Started

First, run the development server:

```bash
npm i && npm run dev
# or use yarn, pnpm or bun
```

Open [http://localhost:3000/editor](http://localhost:3000/editor) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 💡 Why I Built It

After over a decade of professional experience as a PHP developer, I wanted to break out of language silos and showcase what I really love: designing systems that are intuitive, expressive, and empowering to others. Dataflow was born from that mission.

I built this as a response to the complexity and elitism that often surrounds programming tools. I wanted to prove that powerful logic and creativity shouldn't require deep language knowledge or boilerplate code—just the right interface.

Whether you're a developer, a student, or just curious about how logic works, Dataflow is meant to be a transparent, accessible tool that turns thinking into building.

It’s also my way of demonstrating architectural thinking, full-stack capability, and a deep appreciation for developer experience—regardless of the tech stack.

## ⚙️ Performance Architecture

Dataflow is built to feel as fast as it looks. From dragging nodes to editing types, every interaction reflects instantly—without lag or jank—thanks to a custom signal-based state system under the hood.

### 🧠 Powered by `react-refsignal`

To achieve low-latency graph reactivity with full React compatibility, this project uses [`react-refsignal`](https://github.com/jav974/react-refsignal)—a lightweight reactive signal library built specifically for this ecosystem.

- ⚡️ Zero-cost updates: Only affected nodes re-render, nothing else
- 🔬 Fine-grained state tracking without React context overhead
- 🔄 Seamlessly integrates with hooks and functional components

> Built from the ground up for this project, `react-refsignal` is now available as a standalone package for other React developers who need precision-level rendering without the bulk.

The result? A graph editor that feels instantaneous even with hundreds of connections—no need for compromise between reactivity and elegance.

## 📜 License
This project is licensed under the Business Source License 1.1 (BSL-1.1).
- Non-commercial use is allowed for development, education, and personal experimentation.
- Commercial use requires a separate license. Please contact [jeremyvienne@gmail.com] for licensing inquiries.
- License change date: On June 21, 2030, this project will automatically transition to the MIT License.
You can view the full BSL-1.1 license text [here](https://spdx.org/licenses/BUSL-1.1.html), or see the [LICENSE](LICENSE) file in this repository.
