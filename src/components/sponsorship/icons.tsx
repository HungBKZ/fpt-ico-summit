interface IconProps {
  size?: number;
  color?: string;
}

export function CheckIcon({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function MinusIcon({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ flexShrink: 0 }}
    >
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}
