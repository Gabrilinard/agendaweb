const AVATAR_COLORS = [
  { bg: '#D4EDE1', color: '#1A5C3C' },
  { bg: '#FDE8CC', color: '#8B4A00' },
  { bg: '#D6E8F5', color: '#1A4A7A' },
  { bg: '#F5D6E8', color: '#7A1A5A' },
  { bg: '#E8E0F5', color: '#4A1A7A' },
  { bg: '#F5E8D6', color: '#7A4A1A' },
];

export const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
