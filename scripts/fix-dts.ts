#!/usr/bin/env npx ts-node
/**
 * Post-processes codegen's TypeScript output into the final verb-nurbs.d.ts
 *
 * Uses ts-morph for AST-level manipulation instead of string replacements.
 * Run: npx ts-node scripts/fix-dts.ts
 */

import { Project, ModuleDeclarationKind, StructureKind, SyntaxKind, type QualifiedName } from 'ts-morph';
import * as path from 'path';

const INPUT = path.join(__dirname, '..', 'build', 'js', 'verb-nurbs.generated.d.ts');
const OUTPUT = path.join(__dirname, '..', 'build', 'js', 'verb-nurbs.d.ts');

const project = new Project({ useInMemoryFileSystem: true });

// Load the codegen output as a source file
const raw = require('fs').readFileSync(INPUT, 'utf-8');
const src = project.createSourceFile('input.d.ts', raw);

// ---------------------------------------------------------------------------
// 1. Flatten 3-part qualified names (e.g. eval.Divide.CurveLengthSample -> eval.CurveLengthSample)
// ---------------------------------------------------------------------------
// Codegen produces nested paths like ns.Module.Type due to Haxe's module system.
// The middle segment is the Haxe module name and should be dropped.
// We discover these automatically by collecting the top-level namespace names
// and finding all 3-part qualified name nodes that start with one.
const topLevelNamespaces = new Set(src.getModules().map(m => m.getName()));

const replacements: { node: QualifiedName; text: string }[] = [];
for (const qn of src.getDescendantsOfKind(SyntaxKind.QualifiedName)) {
  const text = qn.getText();
  const parts = text.split('.');
  if (parts.length === 3 && topLevelNamespaces.has(parts[0])) {
    replacements.push({ node: qn, text: `${parts[0]}.${parts[2]}` });
  }
}
console.log([...new Set(replacements.map(r => `${r.node.getText()} -> ${r.text}`))].join('\n'));
// Replace in reverse order so earlier positions stay valid
for (const { node, text } of replacements.reverse()) {
  node.replaceWithText(text);
}

// ---------------------------------------------------------------------------
// 2. Inject stub types that codegen cannot generate
// ---------------------------------------------------------------------------

// AsyncBase: promhx's internal base class, not @:expose'd
const promhxNs = src.getModules().find(m => m.getName() === 'promhx');
if (promhxNs) {
  promhxNs.insertStatements(0, `export class AsyncBase<T> {}`);
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
