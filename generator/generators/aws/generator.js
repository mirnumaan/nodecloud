"use strict";
exports.__esModule = true;
exports.generateAWSClass = void 0;
var fs = require("fs");
var typescript_1 = require("typescript");
var parser_1 = require("../../parsers/aws/parser");
var transformer_1 = require("../../transformers/aws/transformer");
var helper_1 = require("../lib/helper");
var dummyFile = process.cwd() + "/dummyClasses/aws.js";
var dummyAst = typescript_1.createSourceFile(
  dummyFile,
  fs.readFileSync(dummyFile).toString(),
  typescript_1.ScriptTarget.Latest,
  true
);
var sdkClassAst;
var sdkFile;
function generateAWSClass(serviceClass) {
  var functions = [];
  var methods = [];
  Object.keys(serviceClass).map(function(key, index) {
    functions.push(serviceClass[key].split(" ")[1]);
    sdkFile = serviceClass[key].split(" ")[0];
  });
  parser_1.getAST(sdkFile).then(function(result) {
    sdkClassAst = result;
    try {
      sdkClassAst.members.map(function(method) {
        if (method.name && functions.includes(method.name.text)) {
          var name_1;
          Object.keys(serviceClass).map(function(key, index) {
            if (serviceClass[key].split(" ")[1] === method.name.text) {
              name_1 = key;
            }
          });
          var parameters_1 = [];
          method.parameters.map(function(param) {
            if (param.name.text !== "callback") {
              var parameter = {
                name: param.name.text,
                optional: param.questionToken ? true : false,
                type: typescript_1.SyntaxKind[param.type.kind],
                typeName: null
              };
              if (parameter.type === "TypeReference" && param.type.typeName) {
                parameter.typeName = param.type.typeName.right.text;
              }
              parameters_1.push(parameter);
            }
          });
          methods.push({
            functionName: name_1.toString(),
            SDKFunctionName: method.name.text.toString(),
            params: parameters_1
          });
        }
      });
      var groupedMethods = helper_1.groupers.aws(methods);
      methods = helper_1.filters.aws(groupedMethods);
      var classData_1 = {
        className: sdkClassAst.name.text,
        functions: methods
      };
      transformer_1.transform(dummyAst, classData_1).then(function(result) {
        helper_1.printFile(
          process.cwd() +
            "/generatedClasses/AWS/" +
            classData_1.className +
            ".js",
          result
        );
      });
    } catch (e) {
      console.error(e);
    }
  });
}
exports.generateAWSClass = generateAWSClass;
