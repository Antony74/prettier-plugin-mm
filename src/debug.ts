import fs from 'fs/promises';
import path from 'path';
import { parse } from './parse';
import { print } from './print';
import prettier from 'prettier';

const main = async () => {
    const configFile = await prettier.resolveConfigFile();

    if (configFile === null) {
        throw new Error('No config file');
    }

    const options: any = await prettier.resolveConfig(configFile!);

    if (options === null) {
        throw new Error('No options');
    }

    const filename = path.normalize(path.join(__dirname, '../examples/demo0.mm'));
    const text = await fs.readFile(filename, { encoding: 'utf-8' });

    const parseTree = parse(text);
    const doc = print(parseTree, options);
    const output = prettier.doc.printer.printDocToString(doc, options).formatted;
    console.log(output);
};

main();
