import { effect } from "../src/simple-reactive";
import { reactive } from "../src/simple-reactive";

describe("reactive", () => {
    it("should be reactive", () => {
        const original = {name: "xiaohong",age: 17};
        var test = reactive(original);
        effect(() => {
            console.log(test.name);
            console.log(test.age);
        });
        expect(test.name).toBe("xiaohong");
        test.name = "xiaoming";
        expect(test.name).toBe("xiaoming");
        test.age = 18;
        expect(test.age).toBe(18);
    })
})