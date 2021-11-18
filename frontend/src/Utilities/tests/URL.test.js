import { GetParam, SetParam } from "../URL"

describe("GetParam", () => {
    describe("finds parameter when it is presented", () => {
        test("and is first", () => {
            expect(GetParam("sghsdgr/dsgse/?key1=value1&key2=value2", "key1")).toBe("value1");
        })

        test("and is not first", () => {
            expect(GetParam("sghsdgr/dsgse/?key1=value1&key2=value2&key3=value3", "key2")).toBe("value2");
        })
    })

    test("doesn't find parameter when it is absent", () => {
        expect(GetParam("sghsdgr/dsgse/?key1=value1&key2=value2&key3=value3", "key4")).toBeUndefined();
    })
})


describe("SetParam", () => {
    describe("sets parameter", () => {
        test("when it is first", () => {
            expect(GetParam(SetParam("sghsdgr/dsgse/", "key3", "value3"), "key3")).toBe("value3");
            expect(GetParam(SetParam("sghsdgr/dsgse", "key3", "value3"), "key3")).toBe("value3");
        })
        
        describe("when there already are some parameters", () => 
        {
            test("and added value is a string", () => {
                expect(GetParam(SetParam("sghsdgr/dsgse?key1=value1&key2=value2", "key3", "value3"), "key3")).toBe("value3");
            })

            test("and added value is not string", () => {
                expect(GetParam(SetParam("sghsdgr/dsgse?key1=value1&key2=value2", "key3", {value: 3}), "key3")).toBe("{\"value\":3}");
            })
        });
    })
})