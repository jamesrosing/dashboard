import React from 'react';

export interface EntityWorldSceneProps {
  onFpsChange?: (fps: number) => void;
}

declare const EntityWorldScene: React.FC<EntityWorldSceneProps>;

export default EntityWorldScene; 