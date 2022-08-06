import { Parser, Plugin, Printer, SupportLanguage } from 'prettier';
import checkmm from 'checkmm';
import { TokenArray } from 'checkmm/dist/tokens';

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

class MonitoredTokenArray extends TokenArray {
    constructor(private onPop: (token: string) => void) {
        super();
    }
    pop() {
        const token = super.pop();
        if (token !== undefined) {
            this.onPop(token);
        }
        return token;
    }
}

export const parse = (text: string) => {
    const parseTree: string[] = [];

    checkmm.createTokenArray = () => {
        return new MonitoredTokenArray(token => parseTree.push(token));
    };

    checkmm.tokens = checkmm.createTokenArray();

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
