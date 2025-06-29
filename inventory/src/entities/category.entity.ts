import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from 'typeorm';
import { Inventory } from './inventory.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Inventory, (inventory) => inventory.categories)
  inventories: Inventory[];

  @Column()
  storeId: number;
  
}