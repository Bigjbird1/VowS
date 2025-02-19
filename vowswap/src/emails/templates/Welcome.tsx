import React from 'react';
import { Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { Card, CardHeading, CardContent } from '../components/Card';
import { Button } from '../components/Button';

interface WelcomeEmailProps {
  name: string;
  verificationUrl?: string;
}

export const Welcome: React.FC<WelcomeEmailProps> = ({
  name,
  verificationUrl,
}) => {
  return (
    <BaseLayout preview="Welcome to VowSwap - Let's make your wedding dreams come true">
      <Card>
        <CardHeading>Welcome to VowSwap!</CardHeading>
        <CardContent>
          <Text>Dear {name},</Text>
          <Text>
            Welcome to VowSwap! We're thrilled to have you join our community of couples and wedding enthusiasts. 
            Your journey to creating the perfect wedding experience starts here.
          </Text>
        </CardContent>
      </Card>

      {verificationUrl && (
        <Card>
          <CardContent>
            <Text>Please verify your email address to get started:</Text>
            <Button href={verificationUrl}>Verify Email</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeading>Getting Started</CardHeading>
        <CardContent>
          <Text>Here's what you can do on VowSwap:</Text>
          <ul style={{ paddingLeft: '20px', lineHeight: '24px' }}>
            <li>Create your wedding registry</li>
            <li>Browse unique wedding items</li>
            <li>Share your registry with friends and family</li>
            <li>Track gifts and contributions</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeading>Create Your Registry</CardHeading>
        <CardContent>
          <Text>
            Ready to start building your dream registry? Click below to create your first registry and begin adding items:
          </Text>
          <Button href="{{createRegistryUrl}}">Create Registry</Button>
        </CardContent>
      </Card>

      <Card border={false}>
        <CardContent>
          <Text>
            If you have any questions or need assistance, our support team is here to help you every step of the way.
          </Text>
          <Text>
            Best wishes,<br />
            The VowSwap Team
          </Text>
        </CardContent>
      </Card>
    </BaseLayout>
  );
};
