import { Link } from 'react-router-dom';

import { useGetApodQuery } from '@/entities/apod';

import styles from './ApodPage.module.scss';

export function ApodPage() {
  const { data, isError, isLoading, refetch } = useGetApodQuery();

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

      {isLoading && (
        <section className={styles.status} aria-live='polite'>
          <span>NASA / APOD</span>
          <h1>Загружаем фото дня</h1>
          <p>Получаем сегодняшнюю публикацию из архива NASA.</p>
        </section>
      )}

      {isError && (
        <section className={styles.status} aria-live='assertive'>
          <span>NASA / APOD</span>
          <h1>Не удалось загрузить публикацию</h1>
          <p>
            Проверьте соединение или настройте <code>VITE_NASA_API_KEY</code>, если лимит
            демонстрационного ключа исчерпан.
          </p>
          <button type='button' onClick={() => void refetch()}>
            Повторить
          </button>
        </section>
      )}

      {data && (
        <article className={styles.apod}>
          <div className={styles.media}>
            {data.media_type === 'video' ? (
              <iframe
                src={data.url}
                title={data.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            ) : (
              <a
                href={data.hdurl || data.url}
                target='_blank'
                rel='noreferrer'
                aria-label='Открыть изображение в полном размере'
              >
                <img src={data.url} alt={data.title} />
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
