export type GraphicsQuality = 'low' | 'medium' | 'high';

export const GRAPHICS_QUALITY = {
  low: {
    dpr: 1,
    effects: false,
    galacticStars: 700,
    primaryStars: 1400,
    secondaryStars: 300,
    textures: false,
  },
  medium: {
    dpr: [1, 1.35] as [number, number],
    effects: false,
    galacticStars: 1100,
    primaryStars: 2100,
    secondaryStars: 500,
    textures: true,
  },
  high: {
    dpr: [1, 1.75] as [number, number],
    effects: true,
    galacticStars: 1500,
    primaryStars: 2600,
    secondaryStars: 700,
    textures: true,
  },
} satisfies Record<
  GraphicsQuality,
  {
    dpr: number | [number, number];
    effects: boolean;
    galacticStars: number;
    primaryStars: number;
    secondaryStars: number;
    textures: boolean;
  }
>;
