import React from 'react';
import { Section } from '@react-email/components';

interface CardProps {
  children: React.ReactNode;
  noPadding?: boolean;
  border?: boolean;
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '16px',
  },
  noPadding: {
    padding: '0',
  },
  border: {
    border: '1px solid #e6ebf1',
  },
};

export const Card: React.FC<CardProps> = ({
  children,
  noPadding = false,
  border = true,
}) => {
  return (
    <Section
      style={{
        ...styles.card,
        ...(noPadding ? styles.noPadding : {}),
        ...(border ? styles.border : {}),
      }}
    >
      {children}
    </Section>
  );
};

// Heading component for use within cards
interface CardHeadingProps {
  children: React.ReactNode;
}

const headingStyles = {
  heading: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#111827',
    margin: '0 0 16px 0',
  },
};

export const CardHeading: React.FC<CardHeadingProps> = ({ children }) => {
  return <div style={headingStyles.heading}>{children}</div>;
};

// Content component for consistent text styling
interface CardContentProps {
  children: React.ReactNode;
}

const contentStyles = {
  content: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '24px',
    margin: '0',
  },
};

export const CardContent: React.FC<CardContentProps> = ({ children }) => {
  return <div style={contentStyles.content}>{children}</div>;
};
