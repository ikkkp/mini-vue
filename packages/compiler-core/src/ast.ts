import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

/**
* @description 
* @version 1.0
* @author Huangzl
* @fileName ast.ts
* @date 2023/11/09 15:06:15
*/

export const enum NodeTypes {
  TEXT,
  ROOT,
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  COMPOUND_EXPRESSION
}

export const enum ElementTypes {
  ELEMENT,
}

export function createSimpleExpression(content) {
  return {
    type: NodeTypes.SIMPLE_EXPRESSION,
    content,
  };
}
  
export function createInterpolation(content) {
  return {
    type: NodeTypes.INTERPOLATION,
    content: content,
  };
}

export function createVNodeCall(context, tag, props?, children?) {
  if (context) {
    context.helper(CREATE_ELEMENT_VNODE);
  }

  return {
    /**
    * @author Huangzl
    * @date 2023/11/09 15:08:25
    * @TODO VUE3.0 源码中的 type 是一个 Symbol 类型，这里暂时用 NodeTypes.ELEMENT 代替
    */
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
