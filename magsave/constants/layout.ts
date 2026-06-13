// Métricas de la navbar flotante. Centralizadas para que la barra y el
// espacio que deben dejar las pantallas al final se mantengan en sincronía.
export const NAV_HEIGHT = 66;
export const NAV_SIDE_MARGIN = 20; // margen izq/der respecto a los bordes
export const NAV_BOTTOM_GAP = 16; // separación sobre el área segura inferior

/**
 * Espacio inferior que debe reservar un ScrollView/lista para que su último
 * elemento no quede tapado por la navbar flotante al hacer scroll hasta abajo.
 */
export function tabBarClearance(insetBottom: number): number {
  return insetBottom + NAV_BOTTOM_GAP + NAV_HEIGHT + 28;
}
