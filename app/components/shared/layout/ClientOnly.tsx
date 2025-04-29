import { useEffect, useLayoutEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Use useLayoutEffect on client, useEffect during SSR
const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Component that ensures children are only rendered on the client side
 * Prevents hydration errors with components using browser-only APIs (like Three.js)
 */
const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [isClient, setIsClient] = useState(false);
  
  useIsomorphicLayoutEffect(() => {
    // Set isClient to true when component mounts on the client
    setIsClient(true);
  }, []);
  
  // Return fallback on server, children on client
  return isClient ? <>{children}</> : <>{fallback}</>;
};

export default ClientOnly; 