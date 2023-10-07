import path from 'path';
import { JoinColumnMetadataArgs } from 'typeorm/metadata-args/JoinColumnMetadataArgs';
import { MetadataArgsStorage } from 'typeorm/metadata-args/MetadataArgsStorage';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';
import { RelationTypeInFunction } from 'typeorm/metadata/types/RelationTypeInFunction';
import { ITable } from '@src/structures/ITable';
import { normalizeArray } from '@src/utils/method.utils';
import { snakeCase } from '@src/utils/string.utils';

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

  function getEntityFromTarget(target: string | Function): Function | undefined {
    return target instanceof Function ? target : undefined;
  }

  function analyzeTables(
    moduleFiles: IModuleFile[],
    metadataArgsStorage: MetadataArgsStorage,
  ): ITable[] {
    const { tables: tableMetadataArgs } = metadataArgsStorage;
    const tables: ITable[] = [];

    // Explore tables
    tableMetadataArgs.forEach(tableMetadata => {
      const entity: Function | undefined = getEntityFromTarget(tableMetadata.target);
      if (!entity) return;
      const moduleFile = moduleFiles.find(moduleFile => moduleFile.module === entity);
      if (!moduleFile) return;

      tables.push({
        name: tableMetadata.name ?? snakeCase(entity.name),
        entity,
        file: moduleFile.file,
        database: tableMetadata.database ?? null,
        description: '',
        columns: [],
        relations: [],
        hidden: false,
      });
    });

    // Mapping table columns
    analyzeColumns(metadataArgsStorage, tables);

    return tables;
  }

  function analyzeColumns(metadataArgsStorage: MetadataArgsStorage, tables: ITable[]): void {
    const {
      columns: columnMetadataArgs,
      joinColumns: joinColumnMetadataArgs,
      relations: relationMetadataArgs,
    } = metadataArgsStorage;

    // Find entity and Filter
    const joinColumns = joinColumnMetadataArgs.reduce<
      { entity: Function; metadata: JoinColumnMetadataArgs }[]
    >((args, metadata) => {
      const entity = getEntityFromTarget(metadata.target);
      if (entity) args.push({ entity, metadata });
      return args;
    }, []);
    const relations = relationMetadataArgs.reduce<
      { entity: Function; metadata: RelationMetadataArgs }[]
    >((args, metadata) => {
      const entity = getEntityFromTarget(metadata.target);
      if (entity) args.push({ entity, metadata });
      return args;
    }, []);

    // Normalize
    const tableMap = normalizeArray(tables, table => table.entity.name);
    const getJoinColumn = (() => {
      const joinColumnMap = normalizeArray(
        joinColumns,
        joinColumn => `${joinColumn.entity.name}-${joinColumn.metadata.name}`,
      );
      return (entityName: string, columnName: string) =>
        joinColumnMap[`${entityName}-${columnName}`];
    })();
    const getRelation = (() => {
      const relationMap = normalizeArray(
        relations,
        relation => `${relation.entity.name}-${relation.metadata.propertyName}`,
      );
      return (entityName: string, propertyName: string) =>
        relationMap[`${entityName}-${propertyName}`];
    })();

    // Explore table columns
    columnMetadataArgs.forEach(columnMetadata => {
      const entity: Function | undefined = getEntityFromTarget(columnMetadata.target);
      if (!entity) return;

      const table = tableMap[entity.name];
      if (!table) return;

      const joinColumn = getJoinColumn(entity.name, columnMetadata.propertyName);
      const relation = joinColumn
        ? getRelation(entity.name, joinColumn.metadata.propertyName)
        : undefined;

      table.columns.push({
        name: columnMetadata.propertyName,
        type: (() => {
          if (typeof columnMetadata.options.type === 'string') {
            return columnMetadata.options.type;
          }
          if (typeof columnMetadata.options.type === 'function') {
            const primitive = new columnMetadata.options.type();
            const columnType = typeof primitive.valueOf();
            return columnType === 'object' ? 'unknown' : columnType;
          }
          if (
            columnMetadata.mode === 'createDate' ||
            columnMetadata.mode === 'updateDate' ||
            columnMetadata.mode === 'deleteDate'
          ) {
            return 'timestamp';
          }
          return 'unknown';
        })(),
        primaryKey: columnMetadata.options.primary ?? false,
        foreignKey: !!(joinColumn && relation),
        nullable: columnMetadata.options.nullable ?? false,
        description: '',
      });

      const relationEntityName =
        relation && isTypeFunction(relation.metadata.type)
          ? relation.metadata.type().name
          : undefined;
      if (relation && relationEntityName) {
        table.relations.push({
          relationTableName: tableMap[relationEntityName]?.name ?? relationEntityName,
          relationType: relation.metadata.relationType,
          description: relation.metadata.propertyName,
        });
      }
    });
  }

  export function isTypeFunction(r: RelationTypeInFunction): r is (types?: any) => Function {
    return typeof r === 'function';
  }
}
