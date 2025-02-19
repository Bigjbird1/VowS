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

// Template name literals
const TEMPLATE_NAMES = {
  ORDER_CONFIRMATION: "order_confirmation",
  WELCOME_EMAIL: "welcome_email",
  REGISTRY_CONTRIBUTION: "registry_contribution",
} as const;

type TemplateName = typeof TEMPLATE_NAMES[keyof typeof TEMPLATE_NAMES];

// Template configuration type
type TemplateConfig = {
  OrderConfirmation: {
    name: typeof TEMPLATE_NAMES.ORDER_CONFIRMATION;
    subject: string;
    component: typeof OrderConfirmation;
    sampleData: OrderConfirmationProps;
    variables: string[];
  };
  Welcome: {
    name: typeof TEMPLATE_NAMES.WELCOME_EMAIL;
    subject: string;
    component: typeof Welcome;
    sampleData: WelcomeProps;
    variables: string[];
  };
  RegistryContribution: {
    name: typeof TEMPLATE_NAMES.REGISTRY_CONTRIBUTION;
    subject: string;
    component: typeof RegistryContribution;
    sampleData: RegistryContributionProps;
    variables: string[];
  };
};

type TemplateType = TemplateConfig[keyof TemplateConfig];

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
    name: TEMPLATE_NAMES.ORDER_CONFIRMATION,
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
    name: TEMPLATE_NAMES.WELCOME_EMAIL,
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
    name: TEMPLATE_NAMES.REGISTRY_CONTRIBUTION,
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

function isTemplateName(name: string): name is TemplateName {
  return Object.values(TEMPLATE_NAMES).includes(name as TemplateName);
}

function isTemplateType(value: any): value is TemplateType {
  return (
    value &&
    typeof value === 'object' &&
    'name' in value &&
    'subject' in value &&
    'component' in value &&
    'sampleData' in value &&
    'variables' in value &&
    isTemplateName(value.name) &&
    typeof value.subject === 'string' &&
    Array.isArray(value.variables)
  );
}

async function renderTemplate<K extends keyof TemplateConfig>(
  template: TemplateConfig[K]
): Promise<{ html: string; text: string }> {
  if (!isTemplateName(template.name)) {
    throw new Error(`Invalid template name: ${template.name}`);
  }

  // Create a type-safe element based on the template type
  const element = (() => {
    switch (template.name) {
      case TEMPLATE_NAMES.ORDER_CONFIRMATION:
        return React.createElement(OrderConfirmation, template.sampleData);
      case TEMPLATE_NAMES.WELCOME_EMAIL:
        return React.createElement(Welcome, template.sampleData);
      case TEMPLATE_NAMES.REGISTRY_CONTRIBUTION:
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

  const templateEntries = (Object.entries(templates) as Array<[keyof TemplateConfig, TemplateType]>);
  
  for (const [componentName, template] of templateEntries) {
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
): boolean {
  if (!isTemplateName(templateName)) {
    throw new Error(`Invalid template name: ${templateName}`);
  }

  const template = Object.values(templates).find(t => isTemplateType(t) && t.name === templateName);

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
