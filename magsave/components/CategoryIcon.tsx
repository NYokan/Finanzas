import {
  BookOpen,
  Briefcase,
  Bus,
  Clapperboard,
  Gift,
  House,
  PawPrint,
  Pill,
  Pizza,
  Shirt,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

// Registro de íconos lucide usados por las categorías (ver db/seed.ts)
const ICONS: Record<string, LucideIcon> = {
  Pizza,
  Bus,
  House,
  Pill,
  Clapperboard,
  Shirt,
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
      <Icon size={size * 0.52} color={color} strokeWidth={2.2} />
    </View>
  );
}
