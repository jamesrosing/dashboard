# Dashboard

A real-time 3D visualization dashboard for tracking and displaying entities (drones, vehicles, stationary objects) in a three-dimensional environment.

## Features

- Real-time tracking and visualization of moving entities
- 3D environment rendering using Three.js
- Entity trajectory visualization
- Animated entity movement
- Responsive layout with shared components

## Tech Stack

- **Framework**: Next.js
- **3D Rendering**: Three.js
- **State Management**: Custom state management in `/lib/state`
- **Real-time Updates**: WebSocket integration in `/lib/websocket`
- **Background Processing**: Web Workers in `/lib/workers`

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd dashboard
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Build

```bash
npm run build
# or
yarn build
```

## Three.js Implementation Notes

The application implements several safety patterns to prevent "Cannot access before initialization" errors in production:

- Safe wrapper functions for Three.js objects (Vector3, Vector2, Euler)
- Comprehensive Object3D stub implementation
- Proper inheritance hierarchy (EventDispatcher → Object3D → Group/Scene)
- MathUtils helper to generate UUIDs and prevent circular references
- Try/catch blocks with functional fallbacks across all components

## Project Structure

- `/app` - Next.js application components and pages
  - `/components` - Shared components
    - `/shared` - Layout and common UI components
    - `/visualization` - 3D visualization components
  - `/utils` - Utility functions
- `/lib` - Core libraries
  - `/state` - State management
  - `/three` - Three.js implementation and initialization
  - `/websocket` - WebSocket communication
  - `/workers` - Web Worker implementations
- `/public` - Static assets

## Memory Bank

This project utilizes a structured Memory Bank system that maintains context across development sessions through specialized files:

- `projectbrief.md` - Core requirements and goals
- `productContext.md` - Why this project exists and problems it solves
- `activeContext.md` - Current work focus and next steps
- `systemPatterns.md` - System architecture and design patterns
- `techContext.md` - Technologies used and technical constraints
- `progress.md` - Current status and known issues

## License

MIT License

Copyright (c) 2025 James Rosing (@jamesrosing)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
