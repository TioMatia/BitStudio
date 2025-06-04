import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
@PrimaryGeneratedColumn()
id: number;

@Column()
storeName: string;

@Column()
storeId: number;

@Column()
storeAddress: string;

@Column()
userAddress: string; 

@Column('json')
items: { name: string; price: number; quantity: number }[];

@Column('decimal', { precision: 10, scale: 2 })
total: number;

@Column()
status: string;

@CreateDateColumn()
createdAt: Date;

@Column()
deliveryMethod: 'delivery' | 'pickup';

@Column({ nullable: true })
deliveryName?: string;
}