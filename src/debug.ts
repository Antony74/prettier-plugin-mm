import * as plugin from '.';
import fs from 'fs/promises';
import path from 'path';

const main = async () => {
    const filename = path.normalize(path.join(__dirname, '../examples/demo0.mm'))
    const text = await fs.readFile(filename, {encoding: 'utf-8'});

    const parse = (plugin as any).parsers['mm-parse'].parse;
    parse(text);
}

main();