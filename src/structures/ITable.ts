import { RelationType } from 'typeorm/metadata/types/RelationTypes';

export interface ITable {
  name: string;

  file: string;

  entity: Function;

  database: string | null;

  description: string;

  columns: ITable.IColumn[];

  relations: ITable.IRelation[];

  hidden: boolean;
}

export namespace ITable {
  export interface IColumn {
    name: string;

    type: string;

    primaryKey: boolean;

    foreignKey: boolean;

    nullable: boolean;

    description: string;
  }

  export interface IRelation {
    relationType: RelationType;

    relationTableName: string;

    description: string;
  }
}
