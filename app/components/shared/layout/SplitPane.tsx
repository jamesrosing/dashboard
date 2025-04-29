import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  minSizes?: [number, number]; // Minimum sizes for left/top and right/bottom
  defaultSizes?: [number, number]; // Default sizes in percentage
  children: [ReactNode, ReactNode]; // Exactly two children
  className?: string;
  id?: string;
}

/**
 * SplitPane component for creating resizable split layouts
 * 
 * This component creates a resizable split between two children components,
 * supporting both horizontal and vertical splits with minimum sizes and
 * customizable default sizing.
 * 
 * @example
 * <SplitPane direction="horizontal" minSizes={[200, 300]} defaultSizes={[30, 70]}>
 *   <LeftPanel />
 *   <RightPanel />
 * </SplitPane>
 */
export function SplitPane({
  direction = 'horizontal',
  minSizes = [0, 0],
  defaultSizes = [50, 50],
  children,
  className = '',
  id,
}: SplitPaneProps) {
  if (React.Children.count(children) !== 2) {
    throw new Error('SplitPane requires exactly two children');
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<[number, number]>(defaultSizes);
  const [dragging, setDragging] = useState(false);
  const [initialPos, setInitialPos] = useState(0);
  const [initialSizes, setInitialSizes] = useState<[number, number]>([0, 0]);
  
  // Drag overlay for capturing mouse events during drag
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // Setup portal container for overlay
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.zIndex = '9999';
      el.style.display = 'none';
      el.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.appendChild(el);
      setPortalContainer(el);
      
      return () => {
        document.body.removeChild(el);
      };
    }
    return undefined;
  }, [direction]);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    setDragging(true);
    
    // Show overlay
    if (portalContainer) {
      portalContainer.style.display = 'block';
    }
    
    // Record initial positions
    setInitialPos(direction === 'horizontal' ? e.clientX : e.clientY);
    setInitialSizes([...sizes] as [number, number]);
  };
  
  const onDrag = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerSize = direction === 'horizontal'
      ? container.clientWidth
      : container.clientHeight;
    
    // Calculate distance moved
    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const deltaPos = currentPos - initialPos;
    
    // Calculate new sizes based on delta movement
    const deltaPercentage = (deltaPos / containerSize) * 100;
    const newSizes: [number, number] = [
      initialSizes[0] + deltaPercentage,
      initialSizes[1] - deltaPercentage,
    ];
    
    // Apply minimum size constraints
    if (containerSize) {
      const minSizePercent1 = (minSizes[0] / containerSize) * 100;
      const minSizePercent2 = (minSizes[1] / containerSize) * 100;
      
      if (newSizes[0] < minSizePercent1) {
        newSizes[0] = minSizePercent1;
        newSizes[1] = 100 - minSizePercent1;
      } else if (newSizes[1] < minSizePercent2) {
        newSizes[1] = minSizePercent2;
        newSizes[0] = 100 - minSizePercent2;
      }
    }
    
    setSizes(newSizes);
  };
  
  const endDrag = () => {
    setDragging(false);
    
    // Hide overlay
    if (portalContainer) {
      portalContainer.style.display = 'none';
    }
    
    // Save sizes to localStorage for persistence
    if (id) {
      try {
        localStorage.setItem(`splitPane:${id}`, JSON.stringify(sizes));
      } catch (error) {
        console.error('Failed to save split pane sizes to localStorage', error);
      }
    }
  };
  
  // Load saved sizes from localStorage
  useEffect(() => {
    if (id) {
      try {
        const savedSizes = localStorage.getItem(`splitPane:${id}`);
        if (savedSizes) {
          setSizes(JSON.parse(savedSizes));
        }
      } catch (error) {
        console.error('Failed to load split pane sizes from localStorage', error);
      }
    }
  }, [id]);
  
  // Add and remove event listeners for dragging
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', endDrag);
    }
    
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', endDrag);
    };
  }, [dragging, onDrag]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  };
  
  const paneStyle1: React.CSSProperties = {
    flex: `0 0 ${sizes[0]}%`,
    overflow: 'auto',
    minHeight: direction === 'vertical' ? minSizes[0] : 0,
    minWidth: direction === 'horizontal' ? minSizes[0] : 0,
  };
  
  const paneStyle2: React.CSSProperties = {
    flex: `0 0 ${sizes[1]}%`,
    overflow: 'auto',
    minHeight: direction === 'vertical' ? minSizes[1] : 0,
    minWidth: direction === 'horizontal' ? minSizes[1] : 0,
  };
  
  const dividerStyle: React.CSSProperties = {
    flex: '0 0 6px',
    background: '#2a2a2a',
    cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
    position: 'relative',
  };

  return (
    <div 
      ref={containerRef} 
      className={`split-pane ${className}`} 
      style={containerStyle}
    >
      <div className="split-pane-panel" style={paneStyle1}>
        {children[0]}
      </div>
      
      <div 
        ref={dividerRef}
        className="split-pane-divider"
        style={dividerStyle}
        onMouseDown={startDrag}
      >
        <div 
          className="split-pane-divider-hitbox"
          style={{
            position: 'absolute',
            top: direction === 'horizontal' ? '-5px' : 0,
            left: direction === 'horizontal' ? 0 : '-5px',
            right: direction === 'horizontal' ? 0 : '-5px',
            bottom: direction === 'horizontal' ? '-5px' : 0,
            zIndex: 1,
          }}
        />
      </div>
      
      <div className="split-pane-panel" style={paneStyle2}>
        {children[1]}
      </div>
      
      {portalContainer && dragging && createPortal(
        <div />,
        portalContainer
      )}
    </div>
  );
}

export default SplitPane; 