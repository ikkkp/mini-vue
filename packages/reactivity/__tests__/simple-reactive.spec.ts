
import { effect } from "../src/simple-reactive";
import { reactive } from "../src/simple-reactive";

describe("reactive", () => {
    it("should be reactive", () => {
        const original = {name: "xiaohong",age: 17,info: {height: 170}};
        var test = reactive(original);
        effect(() => {
            console.log(test.name);
            console.log(test.age);
            console.log(test.info.height);
        });
        expect(test.name).toBe("xiaohong");
        test.name = "xiaoming";
        expect(test.name).toBe("xiaoming");
        test.age = 18;
        expect(test.age).toBe(18);
        test.name = "xiaoxiao";
        expect(test.info.height).toBe(170);
        test.info.height = 180;
        expect(test.info.height).toBe(180);
        test.name = "xiaoxiao";
    })
})