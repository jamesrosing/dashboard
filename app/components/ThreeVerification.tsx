'use client';

import { useEffect, useState } from 'react';

export const ThreeVerification = () => {
  const [status, setStatus] = useState<string>('Checking Three.js initialization...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Log global THREE object first
      console.log('Global THREE object:', (window as any).THREE);
      
      // Import Three.js from our entry module
      import('@/lib/three/three-entry').then(THREE => {
        // Verify critical objects exist
        try {
          // Test creating Vector3
          const vector = new THREE.Vector3(1, 2, 3);
          console.log('Vector3 created successfully:', vector);
          
          // Test creating Euler
          const euler = new THREE.Euler(0, 1, 0);
          console.log('Euler created successfully:', euler);
          
          // Test creating Matrix4
          const matrix = new THREE.Matrix4();
          console.log('Matrix4 created successfully:', matrix);
          
          // Test accessing constants
          console.log('THREE constants check:', {
            UnsignedByteType: THREE.UnsignedByteType,
            LinearEncoding: THREE.LinearEncoding,
            NoToneMapping: THREE.NoToneMapping
          });
          
          // Log successful initialization
          console.log('Three.js initialized successfully');
          setStatus('Three.js initialized successfully');
        } catch (error) {
          console.error('Three.js object verification error:', error);
          setStatus('Three.js object initialization error');
          setError(error instanceof Error ? error.message : String(error));
        }
      }).catch(err => {
        console.error('Failed to import Three.js:', err);
        setStatus('Three.js import error');
        setError(err instanceof Error ? err.message : String(err));
      });
    } catch (err) {
      console.error('Three.js verification error:', err);
      setStatus('Three.js verification error');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);
  
  // Don't render anything visible in production
  if (process.env.NODE_ENV === 'production' && !error) {
    return null;
  }
  
  // Only show debugging UI in development or if there's an error
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      padding: '8px',
      background: error ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,0,0.5)',
      color: 'white',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      borderRadius: '4px',
      fontFamily: 'monospace'
    }}>
      <div><strong>THREE Status:</strong> {status}</div>
      {error && (
        <div style={{ color: '#ff8080', marginTop: '4px', wordBreak: 'break-word' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default ThreeVerification; 