"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mmParser = void 0;
const parse_1 = require("./parse");
const print_1 = require("./print");
const mmLanguage = {
    extensions: ['.mm'],
    name: 'Metamath',
    parsers: ['mm-parse'],
};
exports.mmParser = {
    parse: parse_1.parse,
    astFormat: 'mm-ast',
    locStart: () => 0,
    locEnd: () => 0,
};
const mmPrinter = { print: print_1.print };
const plugin = {
    languages: [mmLanguage],
    parsers: { 'mm-parse': exports.mmParser },
    printers: { 'mm-ast': mmPrinter },
    defaultOptions: { printWidth: 80 },
};
module.exports = plugin;
