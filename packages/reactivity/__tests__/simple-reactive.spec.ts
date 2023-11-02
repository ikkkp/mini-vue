import { reactive } from "../src/simple-reactive";

describe("reactive", () => {
    it("should be reactive", () => {
        const original = {name: "xiaohong"};
        var test = reactive(original);
        expect(test.name).toBe("xiaohong");
        test.name = "xiaoming";
        expect(test.name).toBe("xiaoming");
    })
})