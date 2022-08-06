import checkmm from 'checkmm';
import { TokenArray } from 'checkmm/dist/tokens';

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

    checkmm.tokens = new MonitoredTokenArray(token => parseTree.push(token));
    checkmm.data = text;

    while (checkmm.readtokenstofileinclusion()) {}
    checkmm.processtokens();

    return parseTree;
};
