import React from 'react';
import { cn } from '@/lib/utils';

type EdgemakersLogoProps = React.SVGProps<SVGSVGElement>;

export function EdgemakersLogo({ className, ...props }: EdgemakersLogoProps) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="698.000000pt"
      height="395.000000pt"
      viewBox="0 0 698.000000 395.000000"
      preserveAspectRatio="xMidYMid meet"
      className={cn(className)}
      {...props}
    >
      <g
        transform="translate(0.000000,395.000000) scale(0.100000,-0.100000)"
        fill="hsl(var(--primary))"
        stroke="none"
      >
        <path d="M605 3478 c-3 -7 -4 -686 -3 -1508 l3 -1495 1150 0 1150 0 0 280 0 280 -865 5 -865 5 -3 929 c-1 512 2 934 6 938 11 11 4223 11 4234 0 4 -4 9 -554 10 -1222 l3 -1215 280 0 280 0 0 1505 0 1505 -2688 3 c-2145 2 -2689 0 -2692 -10z" />
        <path d="M1625 2267 c-3 -7 -4 -134 -3 -282 l3 -270 632 -3 633 -2 5 22 c3 13 4 140 3 283 l-3 260 -633 3 c-505 2 -634 0 -637 -11z" />
        <path d="M3377 2243 c-9 -66 -6 -1727 3 -1750 l9 -23 269 0 c206 0 272 3 280 13 7 8 10 290 9 902 l-2 890 -281 3 -282 2 -5 -37z" />
        <path d="M4402 1378 l3 -903 280 0 280 0 0 900 0 900 -283 3 -282 2 2 -902z" />
      </g>
    </svg>
  );
}
