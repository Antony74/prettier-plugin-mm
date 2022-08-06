import fs from 'fs/promises';
import path from 'path';
import { parse } from './parse';

const main = async () => {
    const filename = path.normalize(path.join(__dirname, '../examples/demo0.mm'));
    const text = await fs.readFile(filename, { encoding: 'utf-8' });

    parse(text);
};

main();
