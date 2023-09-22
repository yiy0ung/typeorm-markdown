import path from 'path';
import { IEntity } from 'structures/IEntity';
import { MetadataArgsStorage } from 'typeorm/metadata-args/MetadataArgsStorage';

export namespace MetadataAnalyzer {
  export async function analyze(files: string[]): Promise<IEntity[]> {
    // Load entity files
    for (const file of files) {
      await import(path.join(process.cwd(), file));
    }

    const metadataArgsStorage: MetadataArgsStorage = (global as any)?.typeormMetadataArgsStorage;
    console.log(metadataArgsStorage);
    const entities = analyzeEntity(metadataArgsStorage);
    console.log(entities);

    return entities;
  }

  function analyzeEntity(metadataArgsStorage: MetadataArgsStorage): IEntity[] {
    const entities: IEntity[] = [];

    metadataArgsStorage.tables;
    metadataArgsStorage.columns;

    return entities;
  }

  async function analyzeColumn(entity: IEntity) {}
}
