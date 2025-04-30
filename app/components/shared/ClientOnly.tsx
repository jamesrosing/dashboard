import { useEffect, useLayoutEffect, useState, ReactNode } from 'react';

// Use useLayoutEffect on client side for earlier execution, fallback to useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly component for handling client-side only rendering
 * 
 * This component prevents hydration errors by only rendering its children
 * after the component has mounted on the client. During SSR and initial
 * hydration, it renders an optional fallback (or null).
 * 
 * Enhanced with useIsomorphicLayoutEffect for better initialization timing,
 * which is crucial for Three.js components in production.
 * 
 * Use this component to wrap any components that:
 * - Use browser-only APIs (window, document, etc.)
 * - Rely on client-side initialization (Three.js, canvas, etc.)
 * - Depend on dynamic values that cannot be predicted during SSR
 * 
 * @example
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <ThreeJSComponent />
 * </ClientOnly>
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Use isomorphic layout effect for earlier detection of client environment
  useIsomorphicLayoutEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export default ClientOnly; 