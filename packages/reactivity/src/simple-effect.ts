
export class ReactiveEffect {
    active = true;
    deps = [];
    shouldTrack = false;

    constructor(public fn, public scheduler?) {
        console.log("创建 ReactiveEffect 对象");
    }

    run() {
        if (!this.active) {
            return this.fn();
        }
        this.shouldTrack = true;
        this.active = true;
        this.fn();
    }
}

export function effect(fn) {
    const effect = createReactiveEffect(fn);
    effect();
    return effect;
}

function createReactiveEffect(fn) {
    const _effect = new ReactiveEffect(fn);
    return _effect.run.bind(_effect);
}


