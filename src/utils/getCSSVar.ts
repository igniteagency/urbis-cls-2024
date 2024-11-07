/**
 * @param variableName CSS variable name without `var()`
 * @returns variable value
 */
export function getCSSVar(variableName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName);
}
