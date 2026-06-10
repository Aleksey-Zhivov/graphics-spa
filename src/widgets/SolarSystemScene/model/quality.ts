export type GraphicsQuality = 'low' | 'medium' | 'high';

export const GRAPHICS_QUALITY = {
  low: {
    dpr: 1,
    galacticStars: 700,
    primaryStars: 1400,
    secondaryStars: 300,
  },
  medium: {
    dpr: [1, 1.35] as [number, number],
    galacticStars: 1100,
    primaryStars: 2100,
    secondaryStars: 500,
  },
  high: {
    dpr: [1, 1.75] as [number, number],
    galacticStars: 1500,
    primaryStars: 2600,
    secondaryStars: 700,
  },
} satisfies Record<
  GraphicsQuality,
  {
    dpr: number | [number, number];
    galacticStars: number;
    primaryStars: number;
    secondaryStars: number;
  }
>;
