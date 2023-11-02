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
export const targetMap = new WeakMap();
export const effectStack: any = [];
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
    if (targetMap.has(target)) {
        return targetMap.get(target);
    }

    // 创建响应式对象
    const observed = new Proxy(target, baseHandlers);
    // 把响应式对象缓存起来
    /**
    * @Description:
    * @Version:1.0
    * @Author:Huangzl
    * @Date:2023/11/02 11:12:49
    * @TODO:缓存使用另一个weekmap()，而不是直接使用targetMap;
    */
   
    // targetMap.set(target, observed);
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
    if (!isTracking()) {
        return;
    }
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
    // 收集依赖
    /**
    * @Description:
    * @Version:1.0
    * @Author:Huangzl
    * @Date:2023/11/02 20:32:00
    * @TODO:这边有一个优化点，就是如果已经收集过了，那么就不需要再次收集了
    */
    if(!dep.has(activeEffect)){
        dep.add(activeEffect);
    }
}



function trigger(target: any, key: any) {
    let deps: Array<any> = [];
    // 获取 target 对应的 depsMap
    const depsMap:Map<any,any> = targetMap.get(target);
    console.log('depsMap', typeof depsMap);
    if (!depsMap) {
        return;
    }
    // 获取 target 对应的 dep
    const dep = depsMap.get(key);
    const effects: Array<any> = [];
    // 最后收集到 deps 内
    deps.push(dep);
    deps.forEach((dep) => {
      // 这里解构 dep 得到的是 dep 内部存储的 effect
      effects.push(...dep);
    });
    // 触发依赖
    effects.forEach((effect) => {
      effect();
    });
}

/**
* @Description:这个effect还未实现响应式跟踪
* @Version:1.0
* @Author:Huangzl
* @Date:2023/11/02 21:07:10
*/
export function effect(fn) {
    // 把 fn 做成响应式的
    const effect = createReactiveEffect(fn);
    // 立即执行一次
    effect();
}

export function createReactiveEffect(fn) {
    const effect = function () {
        return run(effect, fn);
    }
    return effect;
}

function run(effect, fn) {
    try {
        effectStack.push(effect);
        fn();
    } finally {
        effectStack.pop();
    }
}

export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}