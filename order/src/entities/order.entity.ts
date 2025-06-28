import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
@PrimaryGeneratedColumn()
id: number;

@Column({ unique: true })
orderNumber: string;

@Column()
storeName: string;

@Column()
storeId: number;

@Column()
storeAddress: string;

@Column()
userAddress: string; 

@Column()
userId: string;

@Column()
userName: string

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

@Column({ type: 'int', nullable: true })
rating?: number;

@Column({ type: 'text', nullable: true })
comment?: string;

@Column({ default: false })
rated: boolean;

}