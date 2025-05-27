import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user')
export class User {
@PrimaryGeneratedColumn()
id: number;

@Column()
firstName: string;

@Column()
lastName: string;

@Column({ unique: true })
email: string;

@Column()
password: string;

@Column({ default: 'comprador' })
role: string;

@Column({ nullable: true })
mpAccessToken?: string;

@Column({ nullable: true })
mpUserId?: number;
}