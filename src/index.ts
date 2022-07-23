import { Parser, Plugin, Printer, SupportLanguage } from 'prettier';

interface AstNode {
    type: string;
    value: string;
    children?: AstNode[];
}

const mmLanguage: SupportLanguage = {
    extensions: ['.mm'],
    name: 'Metamath',
    parsers: ['mm-parse'],
};

const mmParser: Parser<AstNode> = {
    parse: (text) => {
        console.log(text);
        return { type: 'comment', value: 'hello' };
    },
    astFormat: 'mm-ast',
    locStart: () => 0,
    locEnd: () => 0,
};

const mmPrinter: Printer<AstNode> = { print: () => 'hello world' };

const plugin: Plugin<AstNode> = {
    languages: [mmLanguage],
    parsers: { 'mm-parse': mmParser },
    printers: { 'mm-ast': mmPrinter },
};

module.exports = plugin;
