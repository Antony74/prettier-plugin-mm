"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoredTokenArray = void 0;
const checkmm_1 = require("checkmm");
class MonitoredTokenArray extends checkmm_1.TokenArray {
    constructor(events) {
        super();
        this.events = events;
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
    empty() {
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
exports.MonitoredTokenArray = MonitoredTokenArray;
