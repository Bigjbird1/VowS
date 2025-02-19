import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
} from '@react-email/components';

interface BaseLayoutProps {
  preview?: string;
  children: React.ReactNode;
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
  },
  header: {
    padding: '32px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #e6ebf1',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 'bold' as const,
    color: '#000000',
    textDecoration: 'none',
    textAlign: 'center' as const,
    margin: '0',
  },
  footer: {
    padding: '32px',
    textAlign: 'center' as const,
    borderTop: '1px solid #e6ebf1',
  },
  footerText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0',
  },
  footerLinks: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '8px 0 0',
  },
  link: {
    color: '#6b7280',
    textDecoration: 'underline',
    margin: '0 8px',
  },
  content: {
    padding: '32px',
  },
};

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  preview,
  children,
}) => {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>VowSwap</Text>
          </Section>
          
          <Section style={styles.content}>
            {children}
          </Section>
          
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} VowSwap. All rights reserved.
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="#" style={styles.link}>Privacy Policy</Link>
              <Link href="#" style={styles.link}>Terms of Service</Link>
              <Link href="#" style={styles.link}>Contact Support</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
