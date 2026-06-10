import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useGetApodQuery } from '@/entities/apod';

import styles from './ApodPage.module.scss';

const ERROR_DELAY_MS = 10_000;

function OrbitalLoader() {
  return (
    <div className={styles.loader} role='status' aria-label='Загрузка фото дня'>
      <div className={styles.earth}>
        <div className={styles.orbit}>
          <span className={styles.moon} />
        </div>
      </div>
      <span className={styles.loaderLabel}>NASA / APOD</span>
    </div>
  );
}

export function ApodPage() {
  const { data, refetch } = useGetApodQuery();
  const [requestCycle, setRequestCycle] = useState(0);
  const [showError, setShowError] = useState(false);
  const [loadedMediaUrl, setLoadedMediaUrl] = useState<string | null>(null);
  const isMediaLoaded = Boolean(data?.url && loadedMediaUrl === data.url);

  useEffect(() => {
    if (data) {
      return;
    }

    const timeout = window.setTimeout(() => setShowError(true), ERROR_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [data, requestCycle]);

  const retryRequest = () => {
    setShowError(false);
    setRequestCycle((cycle) => cycle + 1);
    void refetch();
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} to='/system'>
          <span className={styles.brandMark} />
          Solar Atlas
        </Link>

        <Link className={styles.backLink} to='/system'>
          Вернуться к системе
        </Link>
      </header>

      {!data && !showError && (
        <section className={styles.loadingScreen} aria-live='polite'>
          <OrbitalLoader />
          <p>Ищем сегодняшнюю публикацию в архиве NASA</p>
        </section>
      )}

      {!data && showError && (
        <section className={styles.status} aria-live='assertive'>
          <span>NASA / APOD</span>
          <h1>NASA отвечает дольше обычного</h1>
          <p>
            Мы несколько раз попробовали получить публикацию. Можно повторить запрос или вернуться к
            системе.
          </p>
          <button type='button' onClick={retryRequest}>
            Повторить
          </button>
        </section>
      )}

      {data && (
        <article className={styles.apod}>
          <div className={styles.media}>
            {!isMediaLoaded && (
              <div className={styles.mediaLoader}>
                <OrbitalLoader />
              </div>
            )}
            {data.media_type === 'video' ? (
              <iframe
                className={isMediaLoaded ? styles.mediaVisible : ''}
                src={data.url}
                title={data.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                onLoad={() => setLoadedMediaUrl(data.url)}
              />
            ) : (
              <a
                href={data.hdurl || data.url}
                target='_blank'
                rel='noreferrer'
                aria-label='Открыть изображение в полном размере'
              >
                <img
                  className={isMediaLoaded ? styles.mediaVisible : ''}
                  src={data.url}
                  alt={data.title}
                  onLoad={() => setLoadedMediaUrl(data.url)}
                />
              </a>
            )}
          </div>

          <section className={styles.content}>
            <span className={styles.eyebrow}>NASA / Astronomy Picture of the Day</span>
            <time dateTime={data.date}>{data.date}</time>
            <h1>{data.title}</h1>
            <p>{data.explanation}</p>
            {data.copyright && <small>Автор: {data.copyright}</small>}
          </section>
        </article>
      )}
    </main>
  );
}
