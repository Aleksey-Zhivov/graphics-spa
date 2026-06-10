import { Navigate, Route, Routes } from 'react-router-dom';

import { SolarSystemPage } from '@/pages/SolarSystemPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path='/system' element={<SolarSystemPage />} />
      <Route path='/body/:bodyId' element={<SolarSystemPage />} />
      <Route path='/' element={<Navigate to='/system' replace />} />
      <Route path='*' element={<Navigate to='/system' replace />} />
    </Routes>
  );
}
