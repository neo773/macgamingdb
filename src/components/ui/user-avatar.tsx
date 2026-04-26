import Avatar from 'boring-avatars';

const PALETTES: readonly (readonly string[])[] = [
  ['#1e3a5f', '#3b82f6', '#7dd3fc', '#cbd5e1', '#f8fafc'],
  ['#1e1b4b', '#6366f1', '#a78bfa', '#c4b5fd', '#e0e7ff'],
  ['#134e4a', '#0d9488', '#5eead4', '#7dd3fc', '#e0f2fe'],
  ['#1e293b', '#475569', '#0ea5e9', '#7dd3fc', '#cbd5e1'],
  ['#312e81', '#3b82f6', '#8b5cf6', '#c4b5fd', '#e0e7ff'],
  ['#0c4a6e', '#0369a1', '#06b6d4', '#67e8f9', '#e0f2fe'],
];

function paletteFor(seed: string): readonly string[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

type UserAvatarProps = {
  name: string;
  size?: number;
  variant?: 'beam' | 'marble' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
};

export function UserAvatar({ name, size = 32, variant = 'beam' }: UserAvatarProps) {
  return (
    <Avatar
      size={size}
      name={name}
      variant={variant}
      colors={paletteFor(name) as string[]}
    />
  );
}
