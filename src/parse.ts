import checkmm from 'checkmm';
import { TokenArray } from 'checkmm/dist/tokens';
import { MMNode, MMNodeMM } from './parseTreeFormat';

interface TokenArrayEvents {
    onToken(token: string): boolean;
    onPop(token: string): void;
}

class MonitoredTokenArray extends TokenArray {
    constructor(private events: TokenArrayEvents) {
        super();
    }
    handleDiscards() {
        for (;;) {
            const token = super.front();
            if (token !== undefined) {
                const useToken = this.events.onToken(token);
                if (!useToken) {
                    super.pop();
                    continue;
                }
            }
            return token;
        }
    }
    front() {
        this.handleDiscards();
        return super.front();
    }
    pop() {
        this.handleDiscards();
        const token = super.pop();
        if (token !== undefined) {
            this.events.onPop(token);
        }
        return token;
    }
}

export const parse = (text: string): MMNodeMM => {
    const comments: string[] = [];
    const stack: MMNode[] = [{ type: 'root', children: [] }];

    const { readcomment, parsec } = checkmm;

    checkmm.readcomment = () => {
        const comment = readcomment();
        comments.push(comment);
        checkmm.tokens.push('$(');
        return comment;
    };

    checkmm.parsec = () => {
        stack.push({type: '$c', children: []})
        parsec();
        const c: any = stack.pop();
        stack[stack.length - 1].children.push(c);
    }

    checkmm.tokens = new MonitoredTokenArray({
        onToken: token => token !== '$(',
        onPop: token => stack[stack.length - 1].children.push(token),
    });

    checkmm.data = text;

    while (checkmm.readtokenstofileinclusion()) {}
    checkmm.processtokens();

    return stack[0] as MMNodeMM;
};
