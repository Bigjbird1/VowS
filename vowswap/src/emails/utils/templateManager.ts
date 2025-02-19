import { render } from '@react-email/render';
import { prisma } from '../../lib/prisma';
import { OrderConfirmation } from '../templates/OrderConfirmation';
import { Welcome } from '../templates/Welcome';
import { RegistryContribution } from '../templates/RegistryContribution';
import React from 'react';

// Define prop types for each template
type OrderConfirmationProps = React.ComponentProps<typeof OrderConfirmation>;
type WelcomeProps = React.ComponentProps<typeof Welcome>;
type RegistryContributionProps = React.ComponentProps<typeof RegistryContribution>;

// Template configuration type
type TemplateConfig = {
  OrderConfirmation: {
    name: "order_confirmation";
    subject: string;
    component: typeof OrderConfirmation;
    sampleData: OrderConfirmationProps;
    variables: string[];
  };
  Welcome: {
    name: "welcome_email";
    subject: string;
    component: typeof Welcome;
    sampleData: WelcomeProps;
    variables: string[];
  };
  RegistryContribution: {
    name: "registry_contribution";
    subject: string;
    component: typeof RegistryContribution;
    sampleData: RegistryContributionProps;
    variables: string[];
  };
};

// Sample data for rendering templates
const sampleData = {
  orderConfirmation: {
    orderNumber: "ORDER123",
    customerName: "John Doe",
    orderTotal: 299.99,
    shippingAddress: {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA"
    },
    items: [
      {
        name: "Crystal Wine Glasses",
        quantity: 2,
        price: 149.99
      }
    ]
  } as OrderConfirmationProps,
  welcome: {
    name: "John",
    verificationUrl: "{{verificationUrl}}"
  } as WelcomeProps,
  registryContribution: {
    isOwner: true,
    registryTitle: "John & Jane's Wedding Registry",
    contributorName: "Alice Smith",
    itemName: "KitchenAid Mixer",
    contributionAmount: 100,
    message: "Congratulations on your wedding!",
    totalReceived: 300,
    itemGoal: 500,
    registryUrl: "{{registryUrl}}",
    ownerName: "John & Jane"
  } as RegistryContributionProps
};

const templates: TemplateConfig = {
  OrderConfirmation: {
    name: "order_confirmation",
    subject: "Your VowSwap Order Confirmation - Order #{{orderNumber}}",
    component: OrderConfirmation,
    sampleData: sampleData.orderConfirmation,
    variables: [
      "orderNumber",
      "customerName",
      "orderTotal",
      "orderTrackingUrl"
    ]
  },
  Welcome: {
    name: "welcome_email",
    subject: "Welcome to VowSwap! Let's get started",
    component: Welcome,
    sampleData: sampleData.welcome,
    variables: [
      "name",
      "verificationUrl",
      "createRegistryUrl"
    ]
  },
  RegistryContribution: {
    name: "registry_contribution",
    subject: "{{isOwner ? 'New contribution to your registry!' : 'Thank you for your registry contribution'}}",
    component: RegistryContribution,
    sampleData: sampleData.registryContribution,
    variables: [
      "registryTitle",
      "contributorName",
      "itemName",
      "contributionAmount",
      "message",
      "totalReceived",
      "itemGoal",
      "registryUrl",
      "ownerName"
    ]
  }
};

async function renderTemplate<K extends keyof TemplateConfig>(
  template: TemplateConfig[K]
): Promise<{ html: string; text: string }> {
  // Create a type-safe element based on the template type
  const element = (() => {
    switch (template.name) {
      case "order_confirmation":
        return React.createElement(OrderConfirmation, template.sampleData);
      case "welcome_email":
        return React.createElement(Welcome, template.sampleData);
      case "registry_contribution":
        return React.createElement(RegistryContribution, template.sampleData);
      default:
        throw new Error(`Unknown template: ${template.name}`);
    }
  })();

  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true })
  ]);
  return { html, text };
}

export async function generateAndSaveTemplates() {
  console.log('Generating email templates...');

  for (const [componentName, template] of Object.entries(templates)) {
    console.log(`Processing template: ${template.name}`);

    try {
      // Render the template with sample data
      const { html: htmlContent, text: textContent } = await renderTemplate(template);

      // Update or create the template in the database
      await prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: {
          subject: template.subject,
          htmlContent,
          textContent,
          variables: template.variables,
          updatedAt: new Date()
        },
        create: {
          name: template.name,
          subject: template.subject,
          htmlContent,
          textContent,
          variables: template.variables,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✓ Template ${template.name} saved successfully`);
    } catch (error) {
      console.error(`✗ Error saving template ${template.name}:`, error);
      throw error;
    }
  }

  console.log('All templates generated and saved successfully');
}

// Function to validate template variables
export function validateTemplateVariables(
  templateName: string,
  variables: Record<string, any>
) {
  const template = Object.values(templates).find(t => t.name === templateName);
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }

  const missingVariables = template.variables.filter(
    variable => !(variable in variables)
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required variables for template '${templateName}': ${missingVariables.join(
        ', '
      )}`
    );
  }

  return true;
}
