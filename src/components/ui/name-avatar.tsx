import { cn } from '@/lib/utils';

const avatarPalettes = [
  { backgroundColor: '#dcf8ee', color: '#006b51' },
  { backgroundColor: '#e3f2ff', color: '#155e9b' },
  { backgroundColor: '#fff1bd', color: '#8a4b00' },
  { backgroundColor: '#fce4ec', color: '#9b3150' },
  { backgroundColor: '#ebe7ff', color: '#5842a2' },
];

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'Remnant';
}

function getPaletteIndex(value: string) {
  return Array.from(value.toLowerCase()).reduce((total, character) => total + character.charCodeAt(0), 0) % avatarPalettes.length;
}

interface NameAvatarProps {
  name: string;
  className?: string;
}

export function NameAvatar({ name, className }: NameAvatarProps) {
  const firstName = getFirstName(name);
  const palette = avatarPalettes[getPaletteIndex(firstName)];

  return (
    <span
      role="img"
      aria-label={`${firstName}'s avatar`}
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold', className)}
      style={palette}
    >
      {firstName.charAt(0).toUpperCase()}
    </span>
  );
}
