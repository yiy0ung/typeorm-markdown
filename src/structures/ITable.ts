import { ColumnType } from 'typeorm';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

export interface ITable {
  name: string;

  file: string;

  entity: Function;

  database: string | null;

  description: string;

  columns: ITable.IColumn[];

  relations: ITable.IRelation[];

  namespaces: string[];
}

export namespace ITable {
  export interface IColumn {
    name: string;

    type?: ColumnType;

    primaryKey: boolean;

    foreignKey: boolean;

    nullable: boolean;

    description: string;
  }

  export interface IRelation {
    relationEntityName: string;

    relationType: RelationType;

    description: string;
  }
}
