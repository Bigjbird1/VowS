import React from 'react';
import { Link } from '@react-email/components';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  color?: 'primary' | 'secondary';
}

const styles = {
  button: {
    display: 'inline-block',
    padding: '12px 20px',
    backgroundColor: '#4f46e5',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    width: 'auto',
  },
  secondary: {
    backgroundColor: '#6b7280',
  },
};

export const Button: React.FC<ButtonProps> = ({
  href,
  children,
  color = 'primary',
}) => {
  return (
    <Link
      href={href}
      style={{
        ...styles.button,
        ...(color === 'secondary' ? styles.secondary : {}),
      }}
    >
      {children}
    </Link>
  );
};
