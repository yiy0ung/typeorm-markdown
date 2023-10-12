import path from 'path';
import { MetadataArgsStorage } from 'typeorm/metadata-args/MetadataArgsStorage';
import { RelationTypeInFunction } from 'typeorm/metadata/types/RelationTypeInFunction';
import { ITable } from '@src/structures/ITable';
import { normalizeArray } from '@src/utils/method.utils';
import { snakeCase } from '@src/utils/string.utils';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';

interface IModule {
  [key: string]: any;
}

interface IModuleFile {
  key: string;
  file: string;
  module: any;
}

export namespace MetadataAnalyzer {
  export async function analyze(files: string[]): Promise<ITable[]> {
    // Load module files
    const moduleFiles: IModuleFile[] = [];
    for (const file of files) {
      const filePath: string = path.join(process.cwd(), file);
      const modules: IModule = await import(filePath);
      Object.entries(modules).map(([key, module]) => {
        moduleFiles.push({
          key: key,
          file: filePath,
          module,
        });
      });
    }

    // Explore metadata
    const metadataArgsStorage: MetadataArgsStorage = (global as any)?.typeormMetadataArgsStorage;
    const tables: ITable[] = analyzeTables(moduleFiles, metadataArgsStorage);

    return tables;
  }

  function getEntityName(target: Function | string): string {
    return target instanceof Function ? target.name : target;
  }

  function getEntityClass(target: Function | string): Function | undefined {
    return target instanceof Function ? target : undefined;
  }

  function analyzeTables(
    moduleFiles: IModuleFile[],
    metadataArgsStorage: MetadataArgsStorage,
  ): ITable[] {
    const { tables: tableMetadataArgs } = metadataArgsStorage;
    const tables: ITable[] = [];

    // EXPLORE TABLES
    tableMetadataArgs.forEach(tableMetadata => {
      const entity: Function | undefined = getEntityClass(tableMetadata.target);
      const moduleFile = moduleFiles.find(moduleFile => moduleFile.module === entity);
      if (!moduleFile) return;
      const entityName = getEntityName(tableMetadata.target);

      tables.push({
        file: moduleFile.file,
        name: tableMetadata.name ?? snakeCase(entityName),
        entityName,
        database: tableMetadata.database ?? null,
        description: '',
        jsdocArgs: [],
        columns: [],
        relations: [],
      });
    });

    // MAPPING COLUMNS / RELATIONS
    const tableMap = normalizeArray(tables, table => table.entityName);
    analyzeColumns(metadataArgsStorage, tableMap);
    analyzeRelations(metadataArgsStorage, tableMap);

    return tables;
  }

  function analyzeColumns(
    metadataArgsStorage: MetadataArgsStorage,
    tableMap: { [entityClassName: string]: ITable | undefined },
  ): void {
    const {
      columns: columnMetadataArgs,
      joinColumns: joinColumnMetadataArgs,
      relations: relationMetadataArgs,
    } = metadataArgsStorage;

    // NORMALIZE
    const getJoinColumn = (() => {
      const joinColumnMap = normalizeArray(
        joinColumnMetadataArgs,
        joinColumn => `${getEntityName(joinColumn.target)}-${joinColumn.name}`,
      );
      return (entityName: string, columnName: string) =>
        joinColumnMap[`${entityName}-${columnName}`];
    })();
    const getRelation = (() => {
      const relationMap = normalizeArray(
        relationMetadataArgs,
        relation => `${getEntityName(relation.target)}-${relation.propertyName}`,
      );
      return (entityName: string, propertyName: string) =>
        relationMap[`${entityName}-${propertyName}`];
    })();

    // EXPLORE COLUMNS
    columnMetadataArgs.forEach(columnMetadata => {
      const entity: Function | undefined = getEntityClass(columnMetadata.target);
      if (!entity) return;

      const table = tableMap[entity.name];
      if (!table) return;

      const joinColumn = getJoinColumn(entity.name, columnMetadata.propertyName);
      const relation = joinColumn ? getRelation(entity.name, joinColumn.propertyName) : undefined;
      const relatedTable =
        relation && isTypeFunction(relation.type)
          ? tableMap[getEntityName(relation.type())]
          : undefined;

      table.columns.push({
        name: columnMetadata.propertyName,
        type: generalizeColumnType(columnMetadata),
        primaryKey: columnMetadata.options.primary ?? false,
        foreignKey: !!relatedTable,
        foreignKeyTargetTableName: relatedTable?.name ?? null,
        nullable: columnMetadata.options.nullable ?? false,
        description: '',
      });
    });
  }

  function analyzeRelations(
    metadataArgsStorage: MetadataArgsStorage,
    tableMap: { [entityClassName: string]: ITable | undefined },
  ) {
    const { relations: relationMetadataArgs, joinColumns: joinColumnMetadataArgs } =
      metadataArgsStorage;

    // NORMALIZE
    const getJoinColumn = (() => {
      const joinColumnMap = normalizeArray(
        joinColumnMetadataArgs,
        joinColumn => `${getEntityName(joinColumn.target)}-${joinColumn.propertyName}`,
      );
      return (entityName: string, propertyName: string) =>
        joinColumnMap[`${entityName}-${propertyName}`];
    })();

    // EXPLORE RELATIONS
    relationMetadataArgs.forEach(relationMetadata => {
      const entity: Function | undefined = getEntityClass(relationMetadata.target);
      if (!entity) return;

      const table = tableMap[entity.name];
      if (!table) return;

      const joinColumn = getJoinColumn(entity.name, relationMetadata.propertyName);
      const relationEntityName = isTypeFunction(relationMetadata.type)
        ? relationMetadata.type().name
        : undefined;

      if (
        relationEntityName &&
        joinColumn &&
        (relationMetadata.relationType === 'one-to-one' ||
          relationMetadata.relationType === 'many-to-one')
      ) {
        table.relations.push({
          relationTableName: tableMap[relationEntityName]?.name ?? relationEntityName,
          relationType: relationMetadata.relationType,
          description: relationMetadata.propertyName,
        });
      }
    });
  }

  function generalizeColumnType(columnMetadata: ColumnMetadataArgs): string {
    const {
      options: { type },
      mode,
    } = columnMetadata;
    const unknownType = '_unknown_';

    if (typeof type === 'string') {
      return type;
    }
    if (typeof type === 'function') {
      const primitive = new type();
      const columnType = typeof primitive.valueOf();
      return columnType === 'object' ? unknownType : columnType;
    }
    if (mode === 'createDate' || mode === 'updateDate' || mode === 'deleteDate') {
      return 'timestamp';
    }

    return unknownType;
  }

  function isTypeFunction(r: RelationTypeInFunction): r is (types?: any) => Function {
    return typeof r === 'function';
  }
}
