import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { usePrefetchApod } from '@/entities/apod';
import { CELESTIAL_BODIES } from '@/entities/celestialBody';
import { SolarSystemScene } from '@/widgets/SolarSystemScene';

import styles from './SolarSystemPage.module.scss';

const TIME_SCALES = [0.5, 1, 2] as const;

export function SolarSystemPage() {
  const navigate = useNavigate();
  const { bodyId } = useParams();
  const prefetchApod = usePrefetchApod();
  const [isTimePaused, setIsTimePaused] = useState(false);
  const [resetViewSignal, setResetViewSignal] = useState(0);
  const [timeScale, setTimeScale] = useState<number>(1);
  const selectedBody = CELESTIAL_BODIES.find((body) => body.id === bodyId);

  useEffect(() => {
    prefetchApod(undefined, { ifOlderThan: 300 });
  }, [prefetchApod]);

  const resetView = () => {
    navigate('/system');
    setResetViewSignal((signal) => signal + 1);
  };

  return (
    <main className={styles.page}>
      <SolarSystemScene
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
            Наведите курсор на планету, чтобы подсветить её орбиту. Нажмите, чтобы перейти к
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

      {selectedBody && (
        <aside className={styles.selection}>
          <span className={styles.eyebrow}>Планета земной группы</span>
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
              <dt>Спутники в сцене</dt>
              <dd>{selectedBody.satellites.length}</dd>
            </div>
          </dl>

          {selectedBody.satellites.length === 0 && (
            <p className={styles.note}>У этой планеты нет естественных спутников.</p>
          )}

          <Link className={styles.backLink} to='/system'>
            Вернуться к системе
          </Link>
        </aside>
      )}
    </main>
  );
}
