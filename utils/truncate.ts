import fs from 'fs/promises';
import path from 'path';

const filename = path.normalize(path.join(__dirname, '..', '..', 'set.mm', 'set.mm'));
const truncatedSize = 5 * 1024 * 1024;
console.log({truncatedSize});

const main = async () => {
    const data = await fs.readFile(filename, { encoding: 'utf8' });
    const truncatedData = data.slice(0, truncatedSize);
    await fs.writeFile(filename, truncatedData);
    console.log('done');
};

main();
