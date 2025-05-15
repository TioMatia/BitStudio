
import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn, OneToMany} from 'typeorm';

@Entity()
export class Store {
@PrimaryGeneratedColumn()
id: number;

@Column()
name: string;

@Column()
owner: string;

@Column()
location: string;

@Column({ nullable: true })
phone: string;

@Column({ nullable: true })
description: string;

@Column({ nullable: true })
image: string;

@Column({ type: 'float', default: 0 })
deliveryFee: number;

@Column({ type: 'float', default: 4.5 })
rating: number;

@Column({ nullable: true })
estimatedTime: string;

@Column({ default: 0 })
score: number;

@CreateDateColumn()
createdAt: Date;

}
