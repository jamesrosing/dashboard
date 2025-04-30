'use client';

import { useEffect, useState } from 'react';

interface DiagnosticsInfo {
  threeGlobal: boolean;
  vectorClassExists: boolean;
  constants: {
    UnsignedByteType?: number;
    LinearEncoding?: number;
    NoToneMapping?: number;
  };
  browserInfo: string;
  errorLog: string[];
}

export const ThreeDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const errorLog: string[] = [];
    
    // Collect diagnostic info
    try {
      const info: DiagnosticsInfo = {
        threeGlobal: !!(window as any).THREE,
        vectorClassExists: !!(window as any).THREE?.Vector3,
        constants: {},
        browserInfo: navigator.userAgent,
        errorLog: errorLog
      };
      
      // Check some constants
      if ((window as any).THREE) {
        info.constants.UnsignedByteType = (window as any).THREE.UnsignedByteType;
        info.constants.LinearEncoding = (window as any).THREE.LinearEncoding;
        info.constants.NoToneMapping = (window as any).THREE.NoToneMapping;
      }
      
      // Try to import Three.js
      import('@/lib/three/three-entry').then(THREE => {
        // Try to create some objects
        try {
          const vector = new THREE.Vector3(1, 2, 3);
          const euler = new THREE.Euler(0, 1, 0);
          const matrix = new THREE.Matrix4();
          
          console.log('Three.js imports working:', { vector, euler, matrix });
        } catch (err) {
          errorLog.push(`Failed to create Three.js objects: ${err instanceof Error ? err.message : String(err)}`);
        }
      }).catch(err => {
        errorLog.push(`Failed to import Three.js: ${err instanceof Error ? err.message : String(err)}`);
      });
      
      setDiagnostics(info);
    } catch (err) {
      errorLog.push(`Diagnostics error: ${err instanceof Error ? err.message : String(err)}`);
      setDiagnostics({
        threeGlobal: false,
        vectorClassExists: false,
        constants: {},
        browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        errorLog: errorLog
      });
    }
  }, []);
  
  if (!diagnostics) return null;
  
  // Only show in development or if there are errors
  const isProduction = process.env.NODE_ENV === 'production';
  const hasErrors = diagnostics.errorLog.length > 0;
  
  if (isProduction && !hasErrors && !showDetails) {
    return (
      <div style={{ 
        position: 'fixed', right: '10px', bottom: '10px', 
        fontSize: '12px', opacity: 0.7, cursor: 'pointer',
        zIndex: 9999
      }}>
        <button onClick={() => setShowDetails(true)} 
          style={{ 
            padding: '3px 8px', 
            background: 'rgba(0,50,100,0.7)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}>
          Diagnostics
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: hasErrors ? 'rgba(50,0,0,0.85)' : 'rgba(0,30,60,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px', 
      fontSize: '12px', 
      fontFamily: 'monospace', 
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '5px', 
        borderBottom: '1px solid rgba(255,255,255,0.3)', 
        paddingBottom: '5px'
      }}>
        <strong>Three.js Diagnostics</strong>
        <span style={{ cursor: 'pointer' }} onClick={() => setShowDetails(false)}>×</span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div><strong>THREE global:</strong> {diagnostics.threeGlobal ? '✅' : '❌'}</div>
        <div><strong>Vector3 class:</strong> {diagnostics.vectorClassExists ? '✅' : '❌'}</div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div><strong>THREE constants:</strong></div>
        <div style={{ paddingLeft: '10px' }}>
          <div>UnsignedByteType: {diagnostics.constants.UnsignedByteType ?? 'undefined'}</div>
          <div>LinearEncoding: {diagnostics.constants.LinearEncoding ?? 'undefined'}</div>
          <div>NoToneMapping: {diagnostics.constants.NoToneMapping ?? 'undefined'}</div>
        </div>
      </div>
      
      {diagnostics.errorLog.length > 0 && (
        <div style={{ 
          marginTop: '8px', 
          color: '#ff8080', 
          borderTop: '1px solid rgba(255,0,0,0.3)', 
          paddingTop: '5px' 
        }}>
          <div><strong>Errors:</strong></div>
          {diagnostics.errorLog.map((err, i) => (
            <div key={i} style={{ marginTop: '4px', wordBreak: 'break-word' }}>• {err}</div>
          ))}
        </div>
      )}
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '10px', 
        opacity: 0.7, 
        borderTop: '1px solid rgba(255,255,255,0.2)', 
        paddingTop: '5px' 
      }}>
        <div>{diagnostics.browserInfo}</div>
      </div>
    </div>
  );
};

export default ThreeDiagnostics; 