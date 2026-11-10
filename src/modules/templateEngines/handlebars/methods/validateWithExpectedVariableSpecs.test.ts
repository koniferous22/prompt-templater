import { describe, it } from "bun:test";
import assert from "node:assert";

import Handlebars from "handlebars";

import { AbsolutePathSchema } from "../../../../validation/path/customTypes/index.js";
import type { TemplateVariableSpecs } from "../../../templateVariableSpecs/factories/factory.js";
import { handlebarsTemplateValidateWithExpectedVariableSpecs } from "./validateWithExpectedVariableSpecs.js";

const testCasesForValidateWithExpectedVariableSpecs = [
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(`Template without expression`) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {},
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "static template without path expressoins",
    },
    testOutcome: {
      testBehaviourDescription: "return an empty constraints array",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(`Hello {{name}}!`) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            name: {
              specType: "primitive",
              variableType: "string",
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with simple top-level mustache path expression",
    },
    testOutcome: {
      testBehaviourDescription: "infer a primitive constraint for the path",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(`{{#with person}}{{/with}}`) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            person: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                name: {
                  specType: "primitive",
                  variableType: "string",
                  modifier: {
                    modifierType: "none",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with path that is the subject of a #with block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an object constraint for the with subject",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(`{{#each items}}{{/each}}`) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            items: {
              specType: "composite",
              variableType: "array",
              arrayElementType: {
                specType: "primitive",
                variableType: "string",
                modifier: {
                  modifierType: "none",
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with path that is the subject of a #each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an array constraint for the each subject",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(
          `{{#each items}}{{@index}}{{/each}}`,
        ) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            items: {
              specType: "composite",
              variableType: "array",
              arrayElementType: {
                specType: "primitive",
                variableType: "string",
                modifier: {
                  modifierType: "none",
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with @index data variable inside an each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an array constraint on the nearest each subject",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(
          `{{#each people}}{{@key}}{{/each}}`,
        ) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            people: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                person1: {
                  specType: "primitive",
                  variableType: "string",
                  modifier: {
                    modifierType: "none",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with @key data variable inside an each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an object constraint on the nearest each subject",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(
          `{{#each items}}{{this}}{{/each}}`,
        ) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            items: {
              specType: "composite",
              variableType: "array",
              arrayElementType: {
                specType: "primitive",
                variableType: "string",
                modifier: {
                  modifierType: "none",
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with pure this reference inside an each block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an array constraint on the current each context",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(
          `{{#with person}}{{this.name}}{{/with}}`,
        ) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            person: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                name: {
                  specType: "primitive",
                  variableType: "string",
                  modifier: {
                    modifierType: "none",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with pure this reference inside a with block",
    },
    testOutcome: {
      testBehaviourDescription: "infer an object constraint on the current with context",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(`{{a.b.c}}`) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            a: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                b: {
                  specType: "composite",
                  variableType: "object",
                  objectShapeType: {
                    c: {
                      specType: "primitive",
                      variableType: "string",
                      modifier: {
                        modifierType: "none",
                      },
                    },
                  },
                  modifier: {
                    modifierType: "none",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with deep path expression with intermediate segments",
    },
    testOutcome: {
      testBehaviourDescription:
        "infer primitive for the full path and object constraints for all intermediate prefixes",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(
          `{{#each items}}{{../name}}{{/each}}`,
        ) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            name: {
              specType: "primitive",
              variableType: "string",
              modifier: {
                modifierType: "none",
              },
            },
            items: {
              specType: "composite",
              variableType: "array",
              arrayElementType: {
                specType: "primitive",
                variableType: "string",
                modifier: {
                  modifierType: "none",
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with relative path with depth 1 resolving against block chain",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve the path to the parent context and infer a primitive constraint",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(
          `{{#with person}}{{firstName}}{{/with}}`,
        ) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            person: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                firstName: {
                  specType: "primitive",
                  variableType: "string",
                  modifier: {
                    modifierType: "none",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with mustache path nested inside a with block",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve the path relative to the with context and infer a primitive constraint",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(`
  {{#each items}}
    {{title}}
    {{#with details}}
      {{color}}
    {{/with}}
  {{/each}}
  `) as unknown as hbs.AST.Program,

        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            items: {
              specType: "composite",
              variableType: "array",
              arrayElementType: {
                specType: "composite",
                variableType: "object",
                objectShapeType: {
                  title: {
                    specType: "primitive",
                    variableType: "string",
                    modifier: {
                      modifierType: "none",
                    },
                  },
                  details: {
                    specType: "composite",
                    variableType: "object",
                    objectShapeType: {
                      color: {
                        specType: "primitive",
                        variableType: "string",
                        modifier: {
                          modifierType: "none",
                        },
                      },
                    },
                    modifier: {
                      modifierType: "none",
                    },
                  },
                },
                modifier: {
                  modifierType: "none",
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with nested each + with blocks with relative mustache paths",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve nested contexts and emit primitive + intermediate object constraints",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(`
Hello {{name}}!

{{#with person}}
  {{firstName}} {{lastName}}
  lives in {{city}}
{{/with}}

{{#each items}}
  - {{this.title}} ({{../name}})
  {{#with details}}
    {{color}}
  {{/with}}
{{else}}
  No items for {{name}}
{{/each}}
  `) as unknown as hbs.AST.Program,

        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            name: {
              specType: "primitive",
              variableType: "string",
              modifier: {
                modifierType: "none",
              },
            },
            person: {
              specType: "composite",
              variableType: "object",
              objectShapeType: {
                firstName: {
                  specType: "primitive",
                  variableType: "string",
                  modifier: {
                    modifierType: "none",
                  },
                },
                lastName: {
                  specType: "primitive",
                  variableType: "string",
                  modifier: {
                    modifierType: "none",
                  },
                },
                city: {
                  specType: "primitive",
                  variableType: "string",
                  modifier: {
                    modifierType: "none",
                  },
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
            items: {
              specType: "composite",
              variableType: "array",
              arrayElementType: {
                specType: "composite",
                variableType: "object",
                objectShapeType: {
                  title: {
                    specType: "primitive",
                    variableType: "string",
                    modifier: {
                      modifierType: "none",
                    },
                  },
                  details: {
                    specType: "composite",
                    variableType: "object",
                    objectShapeType: {
                      color: {
                        specType: "primitive",
                        variableType: "string",
                        modifier: {
                          modifierType: "none",
                        },
                      },
                    },
                    modifier: {
                      modifierType: "none",
                    },
                  },
                },
                modifier: {
                  modifierType: "none",
                },
              },
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with nested each + with blocks with relative mustache paths",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve nested contexts and emit primitive + intermediate object constraints",
    },
  },
  {
    testInput: {
      data: {
        templateAst: Handlebars.parse(
          `
Template:
handlebars{{#if (eq status "pending")}}
  <span class="badge warning">Pending</span>
{{else if (eq status "approved")}}
  <span class="badge success">Approved</span>
{{else if (eq status "rejected")}}
  <span class="badge danger">Rejected</span>
{{else}}
  <span class="badge">Unknown</span>
{{/if}}
`,
        ) as unknown as hbs.AST.Program,
        specs: {
          specType: "composite",
          variableType: "object",
          objectShapeType: {
            status: {
              specType: "primitive",
              variableType: "string",
              modifier: {
                modifierType: "none",
              },
            },
          },
          modifier: {
            modifierType: "none",
          },
        },
      },
      testCaseDescription: "template with if statement referencing variable",
    },
    testOutcome: {
      testBehaviourDescription:
        "resolve the path relative to the with context and infer a primitive constraint",
    },
  },
] satisfies {
  testInput: {
    data: {
      templateAst: hbs.AST.Program;
      specs: TemplateVariableSpecs;
    };
    testCaseDescription: string;
  };
  testOutcome: {
    testBehaviourDescription: string;
  };
}[];

describe("validateWithExpectedVariableSpecs", () => {
  for (const { testInput, testOutcome } of testCasesForValidateWithExpectedVariableSpecs) {
    it(`for ${testInput.testCaseDescription} parsing should ${testOutcome.testBehaviourDescription}`, async () => {
      const result = handlebarsTemplateValidateWithExpectedVariableSpecs(
        testInput.data.templateAst,
        testInput.data.specs,
        {
          templateFile: AbsolutePathSchema.parse("/example/absolute/path/to/template"),
          sourceWorkflowFile: AbsolutePathSchema.parse("/example/absolute/path/to/workflow"),
        },
      );
      // Validate that template matches the expected spec
      assert.ok(result.isOk());
    });
  }
});
