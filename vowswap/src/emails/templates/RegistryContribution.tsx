import React from 'react';
import { Text } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { Card, CardHeading, CardContent } from '../components/Card';
import { Button } from '../components/Button';

interface RegistryContributionProps {
  isOwner: boolean;
  registryTitle: string;
  contributorName: string;
  itemName: string;
  contributionAmount: number;
  message?: string;
  totalReceived: number;
  itemGoal: number;
  registryUrl: string;
  ownerName?: string;
}

export const RegistryContribution: React.FC<RegistryContributionProps> = ({
  isOwner,
  registryTitle,
  contributorName,
  itemName,
  contributionAmount,
  message,
  totalReceived,
  itemGoal,
  registryUrl,
  ownerName,
}) => {
  if (isOwner) {
    return (
      <BaseLayout preview={`New contribution to your registry from ${contributorName}`}>
        <Card>
          <CardHeading>New Registry Contribution!</CardHeading>
          <CardContent>
            <Text>
              Great news! {contributorName} has contributed ${contributionAmount.toFixed(2)} toward {itemName} on your registry &quot;{registryTitle}&quot;.
            </Text>
            {message && (
              <Card border={true}>
                <CardContent>
                  <Text style={{ fontStyle: 'italic' }}>&quot;{message}&quot;</Text>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeading>Contribution Progress</CardHeading>
          <CardContent>
            <Text>
              Total received: ${totalReceived.toFixed(2)} of ${itemGoal.toFixed(2)}
            </Text>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: '#e5e7eb',
              borderRadius: '10px',
              overflow: 'hidden',
              marginTop: '12px'
            }}>
              <div style={{
                width: `${Math.min((totalReceived / itemGoal) * 100, 100)}%`,
                height: '100%',
                backgroundColor: '#4f46e5',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Text>View your registry to see all contributions:</Text>
            <Button href={registryUrl}>View Registry</Button>
          </CardContent>
        </Card>
      </BaseLayout>
    );
  }

  // Contributor version
  return (
    <BaseLayout preview={`Thank you for contributing to ${ownerName}&apos;s registry`}>
      <Card>
        <CardHeading>Thank You for Your Contribution!</CardHeading>
        <CardContent>
          <Text>
            Thank you for contributing ${contributionAmount.toFixed(2)} toward {itemName} on {ownerName}&apos;s registry &quot;{registryTitle}&quot;.
          </Text>
          <Text>
            Your generosity helps make their special day even more memorable.
          </Text>
        </CardContent>
      </Card>

      {message && (
        <Card>
          <CardHeading>Your Message</CardHeading>
          <CardContent>
            <Text style={{ fontStyle: 'italic' }}>&quot;{message}&quot;</Text>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Text>View the registry to see your contribution:</Text>
          <Button href={registryUrl}>View Registry</Button>
        </CardContent>
      </Card>

      <Card border={false}>
        <CardContent>
          <Text>
            Thank you for being part of this special celebration!
          </Text>
          <Text>
            Best regards,<br />
            The VowSwap Team
          </Text>
        </CardContent>
      </Card>
    </BaseLayout>
  );
};
