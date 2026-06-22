interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

const colors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-red-100 text-red-700',
  'bg-cyan-100 text-cyan-700',
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

export default function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${colorFor(name ?? '?')} inline-flex flex-shrink-0 items-center justify-center rounded-full font-bold`}
    >
      {initials}
    </div>
  );
}
