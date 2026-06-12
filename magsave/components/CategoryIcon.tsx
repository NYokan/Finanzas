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

// Registro de íconos lucide usados por las categorías (ver db/seed.ts)
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

interface Props {
  /** nombre PascalCase guardado en categories.icon */
  icon: string;
  /** color de la categoría (hex) */
  color: string;
  size?: number;
}

/** Ícono de categoría dentro de un círculo con el color de la categoría. */
export function CategoryIcon({ icon, color, size = 40 }: Props) {
  const Icon = ICONS[icon] ?? Gift;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}22`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon size={size * 0.52} color={color} weight="duotone" />
    </View>
  );
}
