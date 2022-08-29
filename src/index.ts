import { Parser, Plugin, Printer, SupportLanguage } from 'prettier';
import { parse } from './parse';
import { MMNodeMM } from './parseTreeFormat';
import { print } from './print';

const mmLanguage: SupportLanguage = {
    extensions: ['.mm'],
    name: 'Metamath',
    parsers: ['mm-parse'],
};

export const mmParser: Parser<any> = {
    parse,
    astFormat: 'mm-ast',
    locStart: () => 0,
    locEnd: () => 0,
};

const mmPrinter: Printer<MMNodeMM> = { print };

const plugin: Plugin<MMNodeMM> = {
    languages: [mmLanguage],
    parsers: { 'mm-parse': mmParser },
    printers: { 'mm-ast': mmPrinter },
};

module.exports = plugin;
