import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum JobStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

@Entity('job_logs')
export class JobLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobName: string;

  @Column({ type: 'simple-enum', enum: JobStatus })
  status: JobStatus;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'int', nullable: true })
  durationMs: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
