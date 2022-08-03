import { Parser, Plugin, Printer, SupportLanguage } from 'prettier';
import checkmm from 'checkmm';

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

export const parse = (text: string) => {
    const parseTree: string[] = [];
    const tokenpop = checkmm.tokens.pop;
    checkmm.tokens.pop = () => {
        const token = tokenpop();
        if (token) {
            parseTree.push(token);
        }
        return token;
    };
    checkmm.data = text;
    while (checkmm.readtokenstofileinclusion()) {}
    checkmm.processtokens();

    return parseTree;
};

export const mmParser: Parser<any> = {
    parse,
    astFormat: 'mm-ast',
    locStart: () => 0,
    locEnd: () => 0,
};

const mmPrinter: Printer<AstNode> = { print: ast => JSON.stringify(ast, null, 2) };

const plugin: Plugin<AstNode> = {
    languages: [mmLanguage],
    parsers: { 'mm-parse': mmParser },
    printers: { 'mm-ast': mmPrinter },
};

module.exports = plugin;
