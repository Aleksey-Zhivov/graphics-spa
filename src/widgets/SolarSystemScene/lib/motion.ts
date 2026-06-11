import type { RotationDirection } from '@/entities/celestialBody';

export function getThreeRotationDirection(direction: RotationDirection): number {
  return direction === 'prograde' ? -1 : 1;
}
