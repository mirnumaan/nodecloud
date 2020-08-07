import { expect } from "chai";
import { classBasedTransform } from "../../../transformers/googleCloud/classBasedTransformer";
import { createSourceFile, ScriptTarget, isSourceFile } from "typescript";
import { readJsonData, readSourceFile } from "../lib/helper";

interface TestData {
  AST: any;
  data: any;
}

describe("Google Cloud transformer classBasedTransform", () => {
  context("Valid source code and valid data", () => {
    const testData: TestData = { AST: null, data: null };
    before(async () => {
      testData.AST = await readSourceFile(
        "classBasedTransformer/validDataset",
        "googleCloud"
      );
      testData.data = await readJsonData(
        "classBasedTransformer/validDataset",
        "googleCloud"
      );
    });

    it("Should return a String", async () => {
      const result = classBasedTransform(testData.AST, testData.data);
      expect(result).to.be.string;
    });

    it("Should return a Javascript code in String format", async () => {
      const result = classBasedTransform(testData.AST, testData.data);
      try {
        const sourceCode = createSourceFile(
          "someClass.js",
          result,
          ScriptTarget.Latest
        );
        expect(isSourceFile(sourceCode)).to.be.true;
      } catch (error) {
        console.log(error);
      }
    });
  });

  context("Invalid source code and valid data", () => {
    const testData: TestData = { AST: null, data: null };
    before(async () => {
      testData.AST = await readSourceFile(
        "classBasedTransformer/invalidDataset_1",
        "googleCloud"
      );
      testData.data = await readJsonData(
        "classBasedTransformer/invalidDataset_1",
        "googleCloud"
      );
    });

    it("Should return a validation Error", () => {
      try {
        classBasedTransform(testData.AST, testData.data);
      } catch (error) {
        expect(error.message).to.eql("Code is invalid");
      }
    });
  });

  context("Valid source code and invalid data", () => {
    const testData: TestData = { AST: null, data: null };
    before(async () => {
      testData.AST = await readSourceFile(
        "classBasedTransformer/invalidDataset_2",
        "googleCloud"
      );
      testData.data = await readJsonData(
        "classBasedTransformer/invalidDataset_2",
        "googleCloud"
      );
    });

    it("Should return a validation Error", () => {
      try {
        classBasedTransform(testData.AST, testData.data);
      } catch (error) {
        expect(error.message).to.eql("Input is invalid");
      }
    });
  });
});
