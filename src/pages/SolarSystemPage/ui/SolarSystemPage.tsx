import { Link, useParams } from 'react-router-dom';

import { CELESTIAL_BODIES } from '@/entities/celestialBody';
import { SolarSystemScene } from '@/widgets/SolarSystemScene';

import styles from './SolarSystemPage.module.scss';

export function SolarSystemPage() {
  const { bodyId } = useParams();
  const selectedBody = CELESTIAL_BODIES.find((body) => body.id === bodyId);

  return (
    <main className={styles.page}>
      <SolarSystemScene selectedBodyId={selectedBody?.id} />

      <header className={styles.header}>
        <Link className={styles.brand} to='/system'>
          <span className={styles.brandMark} />
          Solar Atlas
        </Link>

        <nav className={styles.navigation} aria-label='Основная навигация'>
          <button type='button'>Поиск</button>
          <button type='button'>Фото дня</button>
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
        <Link to='/system'>Reset view</Link>
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
