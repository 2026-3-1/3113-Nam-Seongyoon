import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  /** 중복 결제 방지용 Idempotency Key */
  @Column({ unique: true })
  idempotencyKey: string;

  @Column({ type: 'simple-enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'int' })
  amount: number;

  /** 외부 PG사 거래 ID (테스트/실결제 공통) */
  @Column({ type: 'text', nullable: true })
  pgTransactionId: string | null;

  /** 영수증 URL */
  @Column({ type: 'text', nullable: true })
  receiptUrl: string | null;

  @Column({ type: 'text', nullable: true })
  failReason: string | null;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Order, { nullable: true })
  order: Order | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
