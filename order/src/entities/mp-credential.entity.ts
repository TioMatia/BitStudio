import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class MpCredential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  mpUserId: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  publicKey: string;

  @Column()
  expiresIn: number;

  @CreateDateColumn()
  createdAt: Date;
}
