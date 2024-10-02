"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Sugar = require("sugar");
const fs = require("fs");
const path = require("path");
const data_forge_1 = require("data-forge");
require("data-forge-fs");
const moment = require("moment");
function writeDataFrame(filePath, dataFrame) {
    const serializedDataFrame = dataFrame.serialize();
    const json = JSON.stringify(serializedDataFrame, null, 4);
    fs.writeFileSync(filePath, json);
}
exports.writeDataFrame = writeDataFrame;
function readDataFrame(filePath) {
    const json = fs.readFileSync(filePath, "utf8");
    const serializedDataFrame = JSON.parse(json);
    return data_forge_1.DataFrame.deserialize(serializedDataFrame);
}
exports.readDataFrame = readDataFrame;
function checkArrayExpectations(array, test) {
    const filePath = path.join(__dirname, "output", test.fullTitle() + ".json");
    if (!fs.existsSync(filePath)) {
        console.log(`Generated: ${filePath}`);
        fs.writeFileSync(filePath, JSON.stringify(array, null, 4));
    }
    // console.log("Actual:");
    // console.log(array);
    // console.log("Loaded: " + filePath);
    const expectedArray = JSON.parse(fs.readFileSync(filePath, "utf8"));
    ;
    // console.log("Expected:");
    // console.log(expectedArray);
    checkArray(array, expectedArray);
}
exports.checkArrayExpectations = checkArrayExpectations;
function checkObjectExpectations(obj, test) {
    const filePath = path.join(__dirname, "output", test.fullTitle() + ".json");
    if (!fs.existsSync(filePath)) {
        console.log(`Generated: ${filePath}`);
        fs.writeFileSync(filePath, JSON.stringify(obj, null, 4));
    }
    // console.log("Actual:");
    // console.log(obj);
    // console.log("Loaded: " + filePath);
    const expectedObj = JSON.parse(fs.readFileSync(filePath, "utf8"));
    ;
    // console.log("Expected:");
    // console.log(expectedObj);
    checkObject(obj, expectedObj);
}
exports.checkObjectExpectations = checkObjectExpectations;
//
// Check an array to ensure that each element matches the specification.
//
function checkArray(array, spec, fieldPath = "") {
    // console.log(`Checking array "${fieldPath}"`);
    chai_1.expect(array.length).to.equal(spec.length);
    for (let i = 0; i < array.length; ++i) {
        const el = array[i];
        const expected = spec[i];
        const elPath = fieldPath + "[" + i + "]";
        if (Sugar.Object.isObject(el)) {
            checkObject(el, expected, elPath);
        }
        else {
            chai_1.expect(el, elPath).to.eql(expected);
        }
    }
}
exports.checkArray = checkArray;
;
//
// Check an object to ensure that matches a specification.
// It must contain at least the subset of elements in 'spec'.
//
function checkObject(obj, spec, fieldPath = "") {
    // console.log(`Checking object "${fieldPath}"`);
    const keysToCheck = Object.keys(spec);
    for (let i = 0; i < keysToCheck.length; ++i) {
        const key = keysToCheck[i];
        let val = obj[key];
        const expected = spec[key];
        if (val === undefined) {
            throw new Error(`Missing key in object at ${fieldPath}.${key}`);
        }
        const valuePath = fieldPath + "." + key;
        if (Sugar.Object.isArray(val)) {
            checkArray(val, expected, valuePath);
        }
        else if (Sugar.Object.isObject(val)) {
            checkObject(val, expected, valuePath);
        }
        else {
            if (Sugar.Object.isDate(val)) {
                // Check dates by string.
                val = moment(val).toISOString();
            }
            // console.log(`Checking value "${valuePath}"`);
            // This would be good, but the following expectation is more useful.
            // expect(typeof(val), `Type of ${valuePath}`).to.eql(typeof(expected));
            chai_1.expect(val, valuePath).to.eql(expected);
        }
    }
}
exports.checkObject = checkObject;
;
//# sourceMappingURL=check-object.js.map