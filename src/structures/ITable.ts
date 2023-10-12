import { RelationType } from 'typeorm/metadata/types/RelationTypes';

export interface IJSDoc {
  tag: string;

  name: string;
}

export interface ITable {
  file: string;

  /** table name in the database */
  name: string;

  /** entity name to define in the class or a json schema */
  entityName: string;

  database: string | null;

  description: string;

  jsdocArgs: IJSDoc[];

  columns: ITable.IColumn[];

  relations: ITable.IRelation[];
}

export namespace ITable {
  export interface IColumn {
    name: string;

    type: string;

    primaryKey: boolean;

    foreignKey: boolean;

    foreignKeyTargetTableName: ITable['name'] | null;

    nullable: boolean;

    description: string;
  }

  export interface IRelation {
    relationType: RelationType;

    relationTableName: string;

    description: string;
  }
}
