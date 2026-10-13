import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './button.css';

export type ButtonVariant = 'solid' | 'outline';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/** The only button in the project — hover, focus, active and disabled all covered. */
export const Button = ({
  variant = 'outline',
  size = 'md',
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={['btn', `btn--${variant}`, `btn--${size}`, className ?? ''].filter(Boolean).join(' ')}
    {...rest}
  >
    <span className="btn__label">{children}</span>
  </button>
);
