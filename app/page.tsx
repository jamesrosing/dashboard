'use client';

import { Canvas3D } from './components/visualization';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/state/store';

export default function Home() {
  return (
    <Provider store={store}>
      <div className="grid grid-rows-[60px_1fr_30px] h-screen w-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="flex items-center justify-between px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Real-time Multi-Entity Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded bg-blue-600 text-sm">Connected</div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Entities: 0</span>
              <span className="text-sm">|</span>
              <span className="text-sm">FPS: 60</span>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-64 border-r border-gray-800 p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Entities</h2>
            <div className="flex-1 overflow-y-auto">
              {/* Entity list will go here */}
              <div className="text-sm text-gray-400">No entities found</div>
            </div>
          </div>
          
          {/* 3D Visualization area */}
          <div className="flex-1 relative">
            <Canvas3D />
          </div>
          
          {/* Right sidebar */}
          <div className="w-80 border-l border-gray-800 p-4">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="text-sm text-gray-400">No entity selected</div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="flex items-center justify-between px-6 border-t border-gray-800 text-sm text-gray-400">
          <div>Latency: 0ms</div>
          <div>Proof of Concept - Troika-based Implementation</div>
        </footer>
      </div>
    </Provider>
  );
}
