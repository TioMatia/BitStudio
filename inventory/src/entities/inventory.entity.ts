import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';

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

@Column({ nullable: true })
providerId: number;

  @ManyToMany(() => Category, (category) => category.inventories, { cascade: true })
  @JoinTable()
  categories: Category[];
  
}