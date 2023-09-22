import { MetadataAnalyzer } from './analyzers/metadata.analyzer';
import * as glob from 'glob';
import * as tsNode from 'ts-node';

function registerTsNode() {
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
  }

  export async function generate(config: IConfig) {
    registerTsNode();

    const files: string[] = glob.sync(config.input, { nodir: true });
    console.log(files);

    await MetadataAnalyzer.analyze(files);
  }
}
