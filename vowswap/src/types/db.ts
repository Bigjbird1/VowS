export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  hashedPassword: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  addresses: Address[];
  orders: Order[];
}
