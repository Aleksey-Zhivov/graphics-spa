import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { store } from '@/app/store';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <BrowserRouter basename='/graphics-spa'>{children}</BrowserRouter>
    </Provider>
  );
}
