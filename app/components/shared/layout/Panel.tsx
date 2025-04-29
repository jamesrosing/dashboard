import React, { useState, useEffect, ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  id?: string;
  className?: string;
  minHeight?: number;
  onToggle?: (collapsed: boolean) => void;
}

/**
 * Collapsible/expandable panel component for the layout system
 * 
 * This component provides a panel with a header that can be used to collapse/expand
 * the panel content. The collapsed state is persisted in localStorage.
 * 
 * @example
 * <Panel title="Entity Details" id="entity-details">
 *   <EntityDetailsContent />
 * </Panel>
 */
export function Panel({
  title,
  children,
  defaultCollapsed = false,
  id,
  className = '',
  minHeight = 100,
  onToggle,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    if (id) {
      try {
        const savedState = localStorage.getItem(`panel:${id}:collapsed`);
        if (savedState !== null) {
          const parsedState = JSON.parse(savedState);
          setCollapsed(parsedState);
        }
      } catch (error) {
        console.error('Failed to load panel state from localStorage', error);
      }
    }
  }, [id]);

  // Handle panel toggle
  const togglePanel = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    
    // Save state to localStorage
    if (id) {
      try {
        localStorage.setItem(`panel:${id}:collapsed`, JSON.stringify(newState));
      } catch (error) {
        console.error('Failed to save panel state to localStorage', error);
      }
    }
    
    // Call onToggle callback if provided
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div className={`panel ${className} ${collapsed ? 'panel-collapsed' : ''}`}>
      <div 
        className="panel-header"
        onClick={togglePanel}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: '#2a2a2a',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <h3 className="panel-title" style={{ margin: 0, fontSize: '14px' }}>
          {title}
        </h3>
        
        <button 
          type="button"
          className="panel-toggle-button"
          aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            color: '#fff',
            fontSize: '16px',
          }}
        >
          {collapsed ? '▶' : '▼'}
        </button>
      </div>
      
      <div 
        className="panel-content"
        style={{
          display: collapsed ? 'none' : 'block',
          padding: collapsed ? 0 : '8px',
          height: collapsed ? 0 : 'auto',
          minHeight: collapsed ? 0 : minHeight,
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Panel; 