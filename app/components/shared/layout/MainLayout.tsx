import React from 'react';
import SplitPane from 'react-split-pane';
import EntityPanel from '../../visualization/EntityPanel';
import EntityWorld from '../../visualization/EntityWorld';
import Header from './Header';
import { useAppSelector } from '../../../lib/state/hooks';
import styles from './MainLayout.module.css';

const MainLayout: React.FC = () => {
  const { entities } = useAppSelector((state) => state.entities);
  
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <SplitPane
          split="vertical"
          minSize={300}
          defaultSize={350}
          maxSize={500}
          style={{ position: 'relative' }}
          paneStyle={{ overflow: 'auto' }}
          className={styles.splitPane}
        >
          <EntityPanel entities={entities} />
          <div className={styles.visualizationContainer}>
            <EntityWorld />
          </div>
        </SplitPane>
      </div>
    </div>
  );
};

export default MainLayout; 