#!/usr/bin/env node

import commander from 'commander';

type ProgramOptions = {};

async function main(options: ProgramOptions) {
  console.log(options);
}

const program = new commander.Command();

program.option('-d, --debug', 'output extra debugging');

program.parse(process.argv);

main(program.opts<ProgramOptions>());
