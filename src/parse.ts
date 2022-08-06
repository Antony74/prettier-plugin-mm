import checkmm from 'checkmm';
import { TokenArray } from 'checkmm/dist/tokens';

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

export const parse = (text: string) => {
    const parseTree: string[] = [];
    const comments: string[] = [];

    const readcomment = checkmm.readcomment;

    checkmm.readcomment = () => {
        const comment = readcomment();
        comments.push(comment);
        checkmm.tokens.push('$(');
        return comment;
    };

    checkmm.tokens = new MonitoredTokenArray({
        onToken: token => token !== '$(',
        onPop: token => parseTree.push(token),
    });

    checkmm.data = text;

    while (checkmm.readtokenstofileinclusion()) {}
    checkmm.processtokens();

    return parseTree;
};
