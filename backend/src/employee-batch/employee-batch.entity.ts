import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../companies/company.entity';

export type BatchRowStatus = 'valid' | 'invalid';

export interface BatchRow {
  rowNumber: number;
  data: Record<string, any>;
  status: BatchRowStatus;
  errors: string[];
}

@Entity()
export class EmployeeBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company, (company) => company.id, { onDelete: 'CASCADE' })
  company: Company;

  @Column('jsonb')
  rows: BatchRow[];

  @Column({ length: 50 })
  status: 'validated' | 'error' | 'generated';

  @Column()
  uploadedBy: string; // userId

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
