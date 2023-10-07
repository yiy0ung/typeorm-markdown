import * as glob from 'glob';
import * as tsNode from 'ts-node';
import ts from 'typescript';
import { MetadataAnalyzer } from './analyzers/metadata.analyzer';
import { ITable } from './structures/ITable';
import { EntityAnalyzer } from './analyzers/entity.analyzer';
import { IErdCollection } from './structures/IErdCollection';
import { ErdMarkdownWriter } from './writers/erd-markdown.writer';

function registerTsNode(config: TypeormMarkdownApplication.IConfig) {
  if (!config.compilerOptions) {
    config.compilerOptions = {
      noEmit: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      target: 'ES5' as any as ts.ScriptTarget,
      module: 'CommonJS' as any as ts.ModuleKind,
    };
  }

  tsNode.register({
    emit: false,
    compiler: 'typescript',
    compilerOptions: config.compilerOptions,
    require: ['tsconfig-paths/register'],
  });
}

export namespace TypeormMarkdownApplication {
  export interface IConfig {
    title: string;
    input: string;
    output: string;
    compilerOptions?: ts.CompilerOptions;
  }

  export async function generate(config: IConfig) {
    registerTsNode(config);

    const files: string[] = glob.sync(config.input, { nodir: true });

    // Parse ORM reflect metadata
    const tables: ITable[] = await MetadataAnalyzer.analyze(files);

    // Set typescript compiler
    const program = ts.createProgram({
      rootNames: tables.map(table => table.file),
      options: config.compilerOptions!,
    });
    program.getTypeChecker();

    // Parse ORM comment and collect erd
    const erdCollection: IErdCollection = {};
    tables.forEach(table => {
      EntityAnalyzer.analyze(erdCollection, program, table);
    });

    // Write ERD document
    ErdMarkdownWriter.write(erdCollection, config);
  }
}
