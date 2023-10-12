import { Entity, PrimaryColumn } from 'typeorm';

/**
 * Empty Entity.
 *
 * @deprecated
 */
@Entity()
export class EmptyEntity {
  @PrimaryColumn('uuid')
  id!: string;
}
