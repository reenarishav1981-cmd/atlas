export interface DomainEvent<TPayload = any> {
  eventId: string;
  eventName: string;
  eventVersion: number;
  timestamp: Date;
  correlationId: string;
  payload: TPayload;
  sourceModule: string;
}

// Strong type definitions for specific events
export interface OrderPlacedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  total: number;
  paymentMethod: string;
}

export interface ProductUpdatedPayload {
  productId: string;
  slug: string;
  changedFields: string[];
}

export interface CustomerRegisteredPayload {
  customerId: string;
  email: string;
  name: string;
}

export type OrderPlacedEvent = DomainEvent<OrderPlacedPayload>;
export type ProductUpdatedEvent = DomainEvent<ProductUpdatedPayload>;
export type CustomerRegisteredEvent = DomainEvent<CustomerRegisteredPayload>;
