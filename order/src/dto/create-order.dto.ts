export class CreateOrderDto {
storeName: string;
storeAddress: string;
userAddress: string;
items: { name: string; price: number; quantity: number }[];
total: number;
status: string;
deliveryMethod: 'delivery' | 'pickup';
deliveryName?: string;
}