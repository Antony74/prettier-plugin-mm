import { TokenArray } from 'checkmm';

export interface TokenArrayEvents {
    onToken(token: string): boolean;
    onPop(token: string): void;
}

export class MonitoredTokenArray extends TokenArray {
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
    empty(): boolean {
        this.handleDiscards();
        return super.empty();
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
