import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { store } from '@/app/store';
import { getRouterBaseName } from '@/shared/config';

export function AppProviders({ children }: PropsWithChildren) {
  const routerBaseName = getRouterBaseName(import.meta.env.BASE_URL);

  return (
    <Provider store={store}>
      <BrowserRouter basename={routerBaseName}>{children}</BrowserRouter>
    </Provider>
  );
}
