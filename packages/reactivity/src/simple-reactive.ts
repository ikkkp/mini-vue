import { createDep } from "./dep";
/**
* @Description:实现一个简单的reactive响应式系统
* @Version:1.0
* @Author:Huangzl
* @Date:2023/11/02 09:22:18
*/

// 1. 通过 Proxy 对象来实现响应式
// 2. 通过 WeakMap 来实现缓存
//const reactiveMap = new WeakMap();
export const reactiveMap = new WeakMap();
export const targetMap = new WeakMap();
let activeEffect = void 0;
let shouldTrack = false;

export function reactive(target) {
    // 创建响应式对象
    return createReactiveObject(target, mutableHandlers);
}

function createReactiveObject(target, baseHandlers) {
    // 如果不是对象的话，那么就直接返回
    if (!isObject(target)) {
        return target;
    }

    // 如果已经是响应式对象的话，那么就直接返回
    if (reactiveMap.has(target)) {
        return reactiveMap.get(target);
    }

    // 创建响应式对象
    const observed = new Proxy(target, baseHandlers);
    // 把响应式对象缓存起来
    //缓存使用另一个weekmap() reactiveMap，而不是直接使用targetMap;
    reactiveMap.set(target, observed);
    return observed;

}

function isObject(target) {
    return target !== null && typeof target === 'object';
}

const mutableHandlers = {
    get(target, key) {
        // 收集依赖
        track(target, key);
        return Reflect.get(target, key);
    },
    set(target, key, value) {
        // 触发依赖
        trigger(target, key);
        return Reflect.set(target, key, value);
    }
}

function track(target: Object, key: any) {

    // 获取 target 对应的 depsMap
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        // 初始化 depsMap 的逻辑
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    // 获取 target 对应的 dep
    let dep = depsMap.get(key);
    if (!dep) {
        // 如果没有的话，那么就创建一个
        dep = createDep();
        depsMap.set(key, dep);
    }
    /** 收集依赖
    * @TODO:这边有一个优化点，就是如果已经收集过了，那么就不需要再次收集了
    */
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        (activeEffect as any).deps.push(dep);
    }
}



function trigger(target: any, key: any) {
    let deps: Array<any> = [];
    // 获取 target 对应的 depsMap
    const depsMap: Map<any, any> = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    // 获取 target 对应的 dep
    const dep = depsMap.get(key);
    const effects: Array<any> = [];
    // 最后收集到 deps 内
    deps.push(...dep);
    deps.forEach((dep) => {
        // 这里解构 dep 得到的是 dep 内部存储的 effect
        effects.push(...deps);
    });
    triggerEffects(effects);
}
export function triggerEffects(dep) {
    for (const effect of dep) {
        effect.run();
    }
}
export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}



export class ReactiveEffect {
    active = true;
    shouldTrack = false;
    deps = [];
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
    stop() {
        if (this.active) {
          this.active = false;
        }
      }
}

export function effect(fn) {
    const effect = createReactiveEffect(fn);
    effect();
    return effect;
}

function createReactiveEffect(fn) {
    const _effect = new ReactiveEffect(fn);
    activeEffect = _effect as any;
    return _effect.run.bind(_effect);
}




