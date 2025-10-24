import { useWindowDimensions } from 'react-native';

/**
 * Returns responsive layout flags based on screen size and orientation.
 *
 * - isLandscape: true when width > height
 * - isTablet: true when the smaller dimension >= 768
 * - isVertical: true for tablet in landscape (e.g. left-side nav layouts)
 */
export default function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 768;
  const isVertical = isTablet && isLandscape;

  return { width, height, isLandscape, isTablet, isVertical };
}
