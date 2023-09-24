import * as glob from 'glob';
import * as tsNode from 'ts-node';
import ts from 'typescript';
import { MetadataAnalyzer } from './analyzers/metadata.analyzer';
import { ITable } from './structures/ITable';

function registerTsNode(compileOptions?: ts.CompilerOptions) {
  tsNode.register({
    emit: false,
    compiler: 'typescript',
    require: ['tsconfig-paths/register'],
  });
}

export namespace TypeormMarkdownApplication {
  export interface IConfig {
    title: string;
    input: string;
    output: string;
    compileOptions?: ts.CompilerOptions;
  }

  export async function generate(config: IConfig) {
    registerTsNode(config.compileOptions);

    const files: string[] = glob.sync(config.input, { nodir: true });
    console.log(files);

    const tables: ITable[] = await MetadataAnalyzer.analyze(files);

    // const program = ts.createProgram({ options: {}, rootNames: [''] });
    // const checker = program.getTypeChecker();
  }
}
