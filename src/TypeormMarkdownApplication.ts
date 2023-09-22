import { MetadataAnalyzer } from './analyzers/metadata.analyzer';
import ts from 'typescript';
import * as glob from 'glob';
import * as tsNode from 'ts-node';

function registerTsNode(compileOptions?: ts.CompilerOptions) {
  tsNode.register({
    emit: false,
    compiler: 'typescript',
    require: ['tsconfig-paths/register'],
  });
}

export namespace TypeormMarkdownApplication {
  export interface IConfig {
    input: string;
    output: string;
    compileOptions?: ts.CompilerOptions;
  }

  export async function generate(config: IConfig) {
    registerTsNode(config.compileOptions);

    const files: string[] = glob.sync(config.input, { nodir: true });
    console.log(files);

    await MetadataAnalyzer.analyze(files);
  }
}
