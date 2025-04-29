'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/state/store';
import Dashboard from '@/app/components/Dashboard';

export default function Home() {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
}
