import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

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

@CreateDateColumn()
createdAt: Date;
}