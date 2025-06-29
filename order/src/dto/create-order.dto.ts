export class OrderItemDto {
  inventoryId: number;
  quantity: number;
}

export class CreateOrderDto {
  storeName: string;
  storeAddress: string;
  userAddress: string;
  items: OrderItemDto[];
  total: number;
  status: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryFee?: number;
}