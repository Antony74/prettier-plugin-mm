"use strict";
// Runs the plugin without going via Prettier, which is convenient for debugging
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const parse_1 = require("./parse");
const print_1 = require("./print");
const prettier_1 = __importDefault(require("prettier"));
if (process.argv.length !== 3) {
    console.error('Usage: ts-node debug.ts <filename>.mm');
    process.exit(1);
}
const filename = process.argv[2];
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const configFile = yield prettier_1.default.resolveConfigFile();
    if (configFile === null) {
        throw new Error('No config file');
    }
    const options = yield prettier_1.default.resolveConfig(configFile);
    if (options === null) {
        throw new Error('No options');
    }
    options.printWidth = 80;
    const text = yield promises_1.default.readFile(filename, { encoding: 'utf-8' });
    const parseTree = (0, parse_1.parse)(text);
    const output = (0, print_1.print)({ getValue: () => parseTree }, options);
    promises_1.default.writeFile(filename, output);
    console.log(output);
});
main();
