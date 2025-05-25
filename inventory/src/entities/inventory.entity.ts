import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Inventory {
@PrimaryGeneratedColumn()
id: number;

@Column()
name: string;

@Column('text', { nullable: true })
description: string;

@Column('float')
price: number;

@Column()
quantity: number;

@Column()
storeId: number;

@Column({ nullable: true })
image: string; 

@CreateDateColumn()
createdAt: Date;
}