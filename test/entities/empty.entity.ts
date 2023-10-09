import { Entity, PrimaryColumn } from 'typeorm';

/**
 * Empty Entity.
 */
@Entity()
export class EmptyEntity {
  @PrimaryColumn('uuid')
  id!: string;
}
