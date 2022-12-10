"use strict";
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
const path_1 = __importDefault(require("path"));
const filename = path_1.default.normalize(path_1.default.join(__dirname, '..', '..', 'set.mm', 'set.mm'));
const truncatedSize = 5 * 1024 * 1024;
console.log({ truncatedSize });
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield promises_1.default.readFile(filename, { encoding: 'utf8' });
    const truncatedData = data.slice(0, truncatedSize);
    yield promises_1.default.writeFile(filename, truncatedData);
    console.log('done');
});
main();
