import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { ApodPage } from '@/pages/ApodPage';
import { SolarSystemPage } from '@/pages/SolarSystemPage';

function LegacySatelliteRoute() {
  const { moonId } = useParams();

  return <Navigate to={moonId ? `/body/${moonId}` : '/system'} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path='/system' element={<SolarSystemPage />} />
      <Route path='/body/:bodyId' element={<SolarSystemPage />} />
      <Route path='/body/:bodyId/moon/:moonId' element={<LegacySatelliteRoute />} />
      <Route path='/apod' element={<ApodPage />} />
      <Route path='/' element={<Navigate to='/system' replace />} />
      <Route path='*' element={<Navigate to='/system' replace />} />
    </Routes>
  );
}
