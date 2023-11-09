/**
 * @file 该文件包含使用 Proxy 和 WeakMap 实现简单响应式系统的实现。
 * @version 1.0
 * @author Huangzl
 * @date 2023/11/02 09:22:18
 */

import { createDep } from "./dep";

/**
 * 一个 WeakMap，用于存储原始对象和其对应的响应式对象之间的映射关系。
 */
export const reactiveMap = new WeakMap();

/**
 * 一个 WeakMap，用于存储对象和其对应的依赖关系之间的映射关系。
 */
export const targetMap = new WeakMap();

/**
 * 当前活动的 effect。
 */
let activeEffect = void 0;

/**
 * 是否跟踪依赖项。
 */
let shouldTrack = false;

/**
 * 创建一个响应式对象。
 * @param target - 要使其响应式的对象。
 * @returns 响应式对象。
 */
export function reactive(target) {
    return createReactiveObject(target, mutableHandlers);
}

/**
 * 使用 Proxy 和 WeakMap 创建一个响应式对象。
 * @param target - 要使其响应式的对象。
 * @param baseHandlers - Proxy 对象的处理程序。
 * @returns 响应式对象。
 */
function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        return target;
    }

    if (reactiveMap.has(target)) {
        return reactiveMap.get(target);
    }

    const observed = new Proxy(target, baseHandlers);
    reactiveMap.set(target, observed);
    return observed;
}


/**
 * 检查一个值是否为对象。
 * @param target - 要检查的值。
 * @returns 值是否为对象。
 */
function isObject(target) {
    return  typeof target === "object" && target !== null;
}

/**
 * 使一个对象变成响应式对象的 Proxy 处理程序。
 */
const mutableHandlers = {
    get(target, key) {
        track(target, key);
        const result = Reflect.get(target, key);
        if (isObject(result)) {
            return reactive(result);
        }
        return result;
    },
    set(target, key, value) {
        trigger(target, key);
        return Reflect.set(target, key, value);
    }
}

/**
 * 跟踪一个对象的依赖项。
 * @param target - 要跟踪其依赖项的对象。
 * @param key - 正在访问的属性的键。
 */
function track(target: Object, key: any) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
        dep = createDep();
        depsMap.set(key, dep);
    }

    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        (activeEffect as any).deps.push(dep);
    }
}

/**
 * 触发一个对象的效果。
 * @param target - 要触发其效果的对象。
 * @param key - 正在访问的属性的键。
 */
function trigger(target: any, key: any) {
    let deps: Array<any> = [];
    const depsMap: Map<any, any> = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    const dep = depsMap.get(key);
    if (!dep) {
        return;
    }
    const effects: Array<any> = [];
    deps.push(...dep);
    deps.forEach((dep) => {
        effects.push(dep);
    });
    triggerEffects(effects);
}

/**
 * 触发依赖项的效果。
 * @param dep - 要触发其效果的依赖项。
 */
export function triggerEffects(dep) {
    for (const effect of dep) {
        effect.run();
    }
}

/**
 * 检查是否正在跟踪依赖项。
 * @returns 是否正在跟踪依赖项。
 */
export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}

/**
 * 表示响应式效果的类。
 */
export class ReactiveEffect {
    active = true;
    shouldTrack = false;
    deps = [];

    /**
     * 创建一个响应式效果。
     * @param fn - 要执行的函数。
     * @param scheduler - 要使用的调度程序。
     */
    constructor(public fn, public scheduler?) {
        console.log("Creating ReactiveEffect object");
    }

    /**
     * 运行响应式效果。
     */
    run() {
        if (!this.active) {
            return this.fn();
        }
        console.log("Executing ReactiveEffect object");
        this.shouldTrack = true;
        this.active = true;
        this.fn();
    }

    /**
     * 停止响应式效果。
     */
    stop() {
        if (this.active) {
            this.active = false;
        }
    }
}

/**
 * 创建一个响应式效果。
 * @param fn - 要执行的函数。
 * @returns 响应式效果。
 */
export function effect(fn) {
    const effect = createReactiveEffect(fn);
    effect();
    return effect;
}

/**
 * 使用当前活动效果创建一个响应式效果。
 * @param fn - 要执行的函数。
 * @returns 响应式效果。
 */
function createReactiveEffect(fn) {
    const _effect = new ReactiveEffect(fn);
    activeEffect = _effect as any;
    return _effect.run.bind(_effect);
}
