import React from 'react';
import { Text, Hr } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { Card, CardHeading, CardContent } from '../components/Card';
import { Button } from '../components/Button';

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  orderTotal: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const styles = {
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '8px 0',
  },
  total: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginTop: '16px',
    textAlign: 'right' as const,
  },
  address: {
    margin: '8px 0',
    lineHeight: '1.5',
  },
};

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderNumber,
  customerName,
  orderTotal,
  shippingAddress,
  items,
}) => {
  return (
    <BaseLayout preview="Your VowSwap order confirmation">
      <Card>
        <CardHeading>Order Confirmation</CardHeading>
        <CardContent>
          <Text>Dear {customerName},</Text>
          <Text>Thank you for your order! We&apos;re excited to help make your special day even more memorable.</Text>
          <Text>Order Number: {orderNumber}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeading>Order Details</CardHeading>
        <CardContent>
          {items.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          <Hr />
          <div style={styles.total}>
            Total: ${orderTotal.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeading>Shipping Address</CardHeading>
        <CardContent>
          <div style={styles.address}>
            {shippingAddress.line1}<br />
            {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
            {shippingAddress.country}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Text>You can track your order status by clicking the button below:</Text>
          <Button href="{{orderTrackingUrl}}">Track Order</Button>
        </CardContent>
      </Card>

      <Card border={false}>
        <CardContent>
          <Text>
            If you have any questions about your order, please don&apos;t hesitate to contact our support team.
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
