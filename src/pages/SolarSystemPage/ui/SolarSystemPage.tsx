import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { usePrefetchApod } from '@/entities/apod';
import {
  getCelestialBodyById,
  getChildBodies,
  type CelestialBodyKind,
} from '@/entities/celestialBody';
import { SolarSystemScene, type GraphicsQuality } from '@/widgets/SolarSystemScene';

import styles from './SolarSystemPage.module.scss';

const TIME_SCALES = [0.5, 1, 2] as const;
const GRAPHICS_QUALITIES: Array<{ label: string; value: GraphicsQuality }> = [
  { label: 'Low', value: 'low' },
  { label: 'Med', value: 'medium' },
  { label: 'High', value: 'high' },
];

const KIND_LABELS: Record<CelestialBodyKind, string> = {
  star: 'Звезда',
  planet: 'Планета',
  dwarfPlanet: 'Карликовая планета',
  satellite: 'Спутник',
  comet: 'Комета',
  asteroid: 'Астероид',
};

export function SolarSystemPage() {
  const navigate = useNavigate();
  const { bodyId } = useParams();
  const prefetchApod = usePrefetchApod();
  const [isTimePaused, setIsTimePaused] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high');
  const [resetViewSignal, setResetViewSignal] = useState(0);
  const [timeScale, setTimeScale] = useState<number>(1);
  const selectedBody = getCelestialBodyById(bodyId);
  const parentBody = getCelestialBodyById(selectedBody?.parentId ?? undefined);
  const childBodies = selectedBody ? getChildBodies(selectedBody.id) : [];

  useEffect(() => {
    prefetchApod(undefined, { ifOlderThan: 300 });
  }, [prefetchApod]);

  useEffect(() => {
    if (bodyId && !selectedBody) {
      navigate('/system', { replace: true });
    }
  }, [bodyId, navigate, selectedBody]);

  const resetView = () => {
    navigate('/system');
    setResetViewSignal((signal) => signal + 1);
  };

  return (
    <main className={styles.page}>
      <SolarSystemScene
        graphicsQuality={graphicsQuality}
        isTimePaused={isTimePaused}
        resetViewSignal={resetViewSignal}
        selectedBodyId={selectedBody?.id}
        timeScale={timeScale}
      />

      <header className={styles.header}>
        <Link className={styles.brand} to='/system'>
          <span className={styles.brandMark} />
          Solar Atlas
        </Link>

        <nav className={styles.navigation} aria-label='Основная навигация'>
          <Link to='/apod'>Фото дня</Link>
        </nav>
      </header>

      {!selectedBody && (
        <section className={styles.intro}>
          <span>MVP / Solar system</span>
          <h1>Солнечная система</h1>
          <p>
            Наведите курсор на объект, чтобы подсветить его орбиту. Нажмите, чтобы перейти к
            объекту.
          </p>
        </section>
      )}

      <div className={styles.controls}>
        <span>ЛКМ: вращение</span>
        <span>Колесо: масштаб</span>
        <button type='button' onClick={resetView}>
          Reset view
        </button>
      </div>

      <div className={styles.timeControls} aria-label='Управление временем'>
        <button
          className={isTimePaused ? styles.activeControl : ''}
          type='button'
          onClick={() => setIsTimePaused((isPaused) => !isPaused)}
          aria-pressed={isTimePaused}
        >
          {isTimePaused ? 'Продолжить' : 'Пауза'}
        </button>
        <span className={styles.controlDivider} />
        {TIME_SCALES.map((scale) => (
          <button
            className={timeScale === scale ? styles.activeControl : ''}
            key={scale}
            type='button'
            onClick={() => {
              setTimeScale(scale);
              setIsTimePaused(false);
            }}
            aria-pressed={timeScale === scale && !isTimePaused}
          >
            {scale}×
          </button>
        ))}
      </div>

      <div className={styles.qualityControls} aria-label='Качество графики'>
        <span>Quality</span>
        {GRAPHICS_QUALITIES.map((quality) => (
          <button
            className={graphicsQuality === quality.value ? styles.activeControl : ''}
            key={quality.value}
            type='button'
            onClick={() => setGraphicsQuality(quality.value)}
            aria-pressed={graphicsQuality === quality.value}
          >
            {quality.label}
          </button>
        ))}
      </div>

      {selectedBody && (
        <aside className={styles.selection}>
          <span className={styles.eyebrow}>
            {selectedBody.kind === 'satellite' && parentBody
              ? `Спутник планеты ${parentBody.name}`
              : KIND_LABELS[selectedBody.kind]}
          </span>
          <h1>{selectedBody.name}</h1>
          <p className={styles.description}>{selectedBody.description}</p>

          <dl className={styles.facts}>
            <div>
              <dt>Расстояние</dt>
              <dd>{selectedBody.distanceLabel}</dd>
            </div>
            <div>
              <dt>Период обращения</dt>
              <dd>{selectedBody.orbitalPeriodLabel}</dd>
            </div>
            <div>
              <dt>Вращение вокруг оси</dt>
              <dd>{selectedBody.rotationPeriodLabel}</dd>
            </div>
            {(selectedBody.kind === 'planet' || childBodies.length > 0) && (
              <div>
                <dt>Дочерние объекты в сцене</dt>
                <dd>{childBodies.length}</dd>
              </div>
            )}
            {parentBody && (
              <div>
                <dt>Родительский объект</dt>
                <dd>{parentBody.name}</dd>
              </div>
            )}
          </dl>

          {selectedBody.kind === 'planet' && childBodies.length === 0 && (
            <p className={styles.note}>У этой планеты нет естественных спутников.</p>
          )}

          <Link
            className={styles.backLink}
            to={parentBody?.kind === 'planet' ? `/body/${parentBody.id}` : '/system'}
          >
            {parentBody?.kind === 'planet' ? 'Вернуться к планете' : 'Вернуться к системе'}
          </Link>
        </aside>
      )}
    </main>
  );
}
