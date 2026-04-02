#!/usr/bin/env npx ts-node
/**
 * Post-processes codegen's TypeScript output into the final verb-nurbs.d.ts
 *
 * Uses ts-morph for AST-level manipulation instead of string replacements.
 * Run: npx ts-node scripts/fix-dts.ts
 */

import { Project, ModuleDeclarationKind, StructureKind, SyntaxKind } from 'ts-morph';
import * as path from 'path';

const INPUT = path.join(__dirname, '..', 'build', 'js', 'verb-nurbs.generated.d.ts');
const OUTPUT = path.join(__dirname, '..', 'build', 'js', 'verb-nurbs.d.ts');

// Nested class paths that codegen produces due to its mapper bug.
// Keys are the wrong 3-part path, values are the correct flattened path.
const FLATTEN_MAP: Record<string, string> = {
  'eval.Divide.CurveLengthSample': 'eval.CurveLengthSample',
  'eval.Tess.AdaptiveRefinementOptions': 'eval.AdaptiveRefinementOptions',
  'eval.Tess.AdaptiveRefinementNode': 'eval.AdaptiveRefinementNode',
  'eval.Analyze.KnotMultiplicity': 'eval.KnotMultiplicity',
  'eval.Intersect.IBoundingBoxTree': 'eval.IBoundingBoxTree',
  'core.KdTree.KdPoint': 'core.KdPoint',
  'core.KdTree.KdNode': 'core.KdNode',
  'core.Minimizer.MinimizationResult': 'core.MinimizationResult',
};

const project = new Project({ useInMemoryFileSystem: true });

// Load the codegen output as a source file
const raw = require('fs').readFileSync(INPUT, 'utf-8');
const src = project.createSourceFile('input.d.ts', raw);

// ---------------------------------------------------------------------------
// 1. Flatten nested type references by walking all type nodes
// ---------------------------------------------------------------------------
// ts-morph's type reference nodes contain qualified names. We find all
// identifiers and qualified names that match our flatten map and rewrite them.
const fullText = src.getFullText();
let patched = fullText;
for (const [from, to] of Object.entries(FLATTEN_MAP)) {
  // Replace as whole-word type references (not inside other words)
  patched = patched.split(from).join(to);
}
src.replaceWithText(patched);

// ---------------------------------------------------------------------------
// 2. Inject stub types that codegen cannot generate
// ---------------------------------------------------------------------------

// AsyncBase: promhx's internal base class, not @:expose'd
const promhxNs = src.getModules().find(m => m.getName() === 'promhx');
if (promhxNs) {
  promhxNs.insertStatements(0, `\texport class AsyncBase<T> {}`);
}

// IBoundingBoxTree: Haxe interface whose module name conflicts with eval.Intersect class
const evalNs = src.getModules().find(m => m.getName() === 'eval');
if (evalNs) {
  evalNs.insertStatements(0, [
    `\texport interface IBoundingBoxTree<T> {`,
    `\t\tboundingBox(): core.BoundingBox;`,
    `\t\tsplit(): [IBoundingBoxTree<T>, IBoundingBoxTree<T>];`,
    `\t\tyield(): T;`,
    `\t\tindivisible(tolerance: number): boolean;`,
    `\t\tempty(): boolean;`,
    `\t}`,
  ].join('\n'));
}

// ---------------------------------------------------------------------------
// 3. Write the final .d.ts wrapped in declare module 'verb-nurbs'
// ---------------------------------------------------------------------------

const outProject = new Project({ useInMemoryFileSystem: true });
const outFile = outProject.createSourceFile('verb-nurbs.d.ts', '');

// Add the module declaration
const mod = outFile.addModule({
  name: `'verb-nurbs'`,
  declarationKind: ModuleDeclarationKind.Module,
  hasDeclareKeyword: true,
});

// Add top-level type aliases
const typedefs = [
  ['Point', 'number[]'],
  ['Vector', 'number[]'],
  ['Matrix', 'number[][]'],
  ['KnotArray', 'number[]'],
  ['Tri', 'number[]'],
  ['UV', 'number[]'],
];
for (const [name, type] of typedefs) {
  mod.addTypeAlias({ name, type });
}

// Insert the codegen output (namespaces with all classes) into the module
mod.addStatements(src.getFullText());

// Add the Verb interface and default export
mod.addInterface({
  name: 'Verb',
  properties: [
    { name: 'EPSILON', type: 'number' },
    { name: 'TOLERANCE', type: 'number' },
    { name: 'VERSION', type: 'string' },
    { name: 'promhx', type: 'typeof promhx' },
    { name: 'core', type: 'typeof core' },
    { name: 'eval', type: 'typeof eval' },
    { name: 'exe', type: 'typeof exe' },
    { name: 'geom', type: 'typeof geom' },
  ],
});

mod.addStatements(`const verb: Verb;`);
mod.addStatements(`export default verb;`);

// Write
outFile.saveSync();
const output = outFile.getFullText();
require('fs').writeFileSync(OUTPUT, output);
console.log(`${OUTPUT}: ${output.split('\n').length} lines`);
