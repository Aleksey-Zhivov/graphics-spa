export type ApodMediaType = 'image' | 'video';

export type ApodData = {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: ApodMediaType;
  service_version: string;
  title: string;
  url: string;
};
