import { generate } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformExpression } from "./transforms/transformExpression";
import { transformElement } from "./transforms/transformElement";
import { transformText } from "./transforms/transformText";

/**
* @Description:template模板编译
* @Version:1.0
* @Author:Huangzl
* @Date:2023/10/09 16:42:45
*/

export function baseCompile(template, options) {
  // 1. 先把 template 也就是字符串 parse 成 ast
  const ast = baseParse(template);
  // 2. 给 ast 加点料（- -#）
  transform(
    ast,
    Object.assign(options, {
      nodeTransforms: [transformElement, transformText, transformExpression],
    })
  );

  // 3. 生成 render 函数代码
  return generate(ast);
}
