import colorLightenTool from 'color-lighten-tool';

/**
 * Returns the lightened color by the given opacity
 * @param color the color to process
 * @param opacity the opacity in the range of 0 to 100
 */
export const lighten = (color: string, opacity: number): string => {
  return colorLightenTool(color, (100 - opacity) / 100);
};
