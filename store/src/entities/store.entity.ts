import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Provider } from './provider.entity';  // Ajusta la ruta

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

  @Column({ type: 'varchar', length: 10, default: 'pickup' })
  shippingMethod: 'delivery' | 'pickup' | 'both';

  @Column({ type: 'float', default: 0 })
  deliveryFee: number;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ nullable: true })
  estimatedTime: string;

  @Column({ type: 'float', default: 0 })
  score: number; number;

  @Column({ type: 'int', default: 0 })
  numRatings: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: number; 

  @Column({ default: 0 })
  totalSales: number;
  
  @OneToMany(() => Provider, (provider) => provider.store)
  providers: Provider[];
}
