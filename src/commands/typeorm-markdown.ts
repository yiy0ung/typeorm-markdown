#!/usr/bin/env node

import commander from 'commander';
import ts from 'typescript';
import path from 'path';
import pkg from '../../package.json';
import { TypeormMarkdownApplication } from '../TypeormMarkdownApplication';

type ProgramOptions = {
  project: string;
  input: string;
  output: string;
};

async function main(options: ProgramOptions) {
  console.log(options);

  const tsconfigStr = ts.findConfigFile(
    path.join(process.cwd(), options.project),
    ts.sys.fileExists,
    // 'tsconfig.json',
  );

  await TypeormMarkdownApplication.generate({
    input: options.input,
    output: options.output,
    compileOptions: tsconfigStr
      ? ts.readConfigFile(tsconfigStr, ts.sys.readFile).config?.compileOptions
      : undefined,
  });
}

const program = new commander.Command();

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .requiredOption('-i, --input <input_regex>', '')
  .requiredOption('-o, --output <dir_path>', '')
  .option(
    '--project <project_path>',
    'Use --project to explicitly specify the path to a tsconfig.json',
    'tsconfig.json',
  );

program.parse(process.argv);

main(program.opts<ProgramOptions>());
