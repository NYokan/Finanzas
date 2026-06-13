import {
  BookOpen,
  Briefcase,
  Bus,
  FilmSlate,
  Gift,
  House,
  PawPrint,
  Pill,
  Pizza,
  TShirt,
  type Icon,
} from 'phosphor-react-native';
import { View } from 'react-native';

import { colors } from '@/constants/colors';

// Registro de íconos phosphor usados por las categorías (ver db/seed.ts)
const ICONS: Record<string, Icon> = {
  Pizza,
  Bus,
  House,
  Pill,
  FilmSlate,
  TShirt,
  PawPrint,
  BookOpen,
  Briefcase,
  Gift,
};

/** Componente phosphor de una categoría, para usar fuera del círculo. */
export function categoryIconComponent(icon: string): Icon {
  return ICONS[icon] ?? Gift;
}

interface Props {
  /** nombre PascalCase guardado en categories.icon */
  icon: string;
  /** color de la categoría (hex) */
  color: string;
  size?: number;
  /** fondo del círculo; por defecto gris claro neutro */
  bgColor?: string;
}

/** Ícono de categoría dentro de un círculo. */
export function CategoryIcon({ icon, color, size = 40, bgColor }: Props) {
  const IconComponent = ICONS[icon] ?? Gift;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor ?? colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <IconComponent size={size * 0.5} color={color} weight="duotone" />
    </View>
  );
}
