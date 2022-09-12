// Runs the plugin without going via Prettier, which is convenient for debugging

import fs from 'fs/promises';
import { parse } from './parse';
import { print } from './print';
import prettier from 'prettier';

if (process.argv.length !== 3) {
    console.error('Usage: ts-node debug.ts <filename>.mm');
    process.exit(1);
}

const filename = process.argv[2];

const main = async () => {
    const configFile = await prettier.resolveConfigFile();

    if (configFile === null) {
        throw new Error('No config file');
    }

    const options = await prettier.resolveConfig(configFile!);

    if (options === null) {
        throw new Error('No options');
    }

    options.printWidth = 80;

    const text = await fs.readFile(filename, { encoding: 'utf-8' });

    const parseTree = parse(text);
    const output = print({ getValue: () => parseTree } as prettier.AstPath, options as prettier.ParserOptions);
    fs.writeFile(filename, output);
    console.log(output);
};

main();
