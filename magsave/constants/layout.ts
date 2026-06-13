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

/**
 * Posición `bottom` de un FAB para que quede HOLGADAMENTE por encima de la
 * navbar flotante. El borde superior de la barra está en
 * `insetBottom + NAV_BOTTOM_GAP + NAV_HEIGHT`; sumamos un colchón para que el
 * botón (y su sombra) nunca lo pise. Antes los FABs usaban
 * `tabBarClearance - 24`, que los dejaba a solo ~4px de la barra y la navbar
 * custom (absolute, elevation 8) terminaba tapándolos.
 */
export const FAB_NAV_CLEARANCE = 18;
export function fabBottom(insetBottom: number): number {
  return insetBottom + NAV_BOTTOM_GAP + NAV_HEIGHT + FAB_NAV_CLEARANCE;
}
