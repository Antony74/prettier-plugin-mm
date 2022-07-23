import { Parser, SupportLanguage } from 'prettier';

const mmLanguage: SupportLanguage = {
    extensions: ['.mm'],
    name: 'Metamath',
    parsers: ['mm-parse'],
};

const mmParser: Parser = {
    parse: () => undefined,
    astFormat: 'mm-ast',
    locStart: () => 0,
    locEnd: () => 0,
};

export const languages = [mmLanguage];
export const parsers = { 'mm-parse': mmParser };
