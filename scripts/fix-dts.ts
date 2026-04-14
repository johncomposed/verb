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


// These are top-level type aliases that codegen cannot generate. 
// Up here because they also need to go in the core namespace.
// Note: we could also add in strict versions that are branded if that ends up being actually helpful.
const typedefs = [
  ['Point', 'number[]'],
  ['Vector', 'number[]'],
  ['Matrix', 'number[][]'],
  ['KnotArray', 'number[]'],
  ['Tri', 'number[]'],
  ['UV', 'number[]'],
];

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
// Log the replacements for sanity checking
console.log([...new Set(replacements.map(r => `${r.node.getText()} -> ${r.text}`))].join('\n'));
// Replace in reverse order so earlier positions stay valid
for (const { node, text } of replacements.reverse()) {
  node.replaceWithText(text);
}

// ---------------------------------------------------------------------------
// 2. Remove 'export' from top-level namespaces (they'll live inside declare module)
// ---------------------------------------------------------------------------
for (const ns of src.getModules()) {
  if (ns.hasExportKeyword()) {
    ns.setIsExported(false);
  }
}

// ---------------------------------------------------------------------------
// 3. Inject stub types that codegen cannot generate
// ---------------------------------------------------------------------------

// These stubs exist because codegen can't emit them (AsyncBase is from an
// unexposed external lib; IBoundingBoxTree's module name conflicts with a class).
// If codegen ever learns to emit them, these injections should be removed.
const stubs: { ns: string; name: string; body: string }[] = [
  {
    ns: 'promhx',
    name: 'AsyncBase',
    body: `export class AsyncBase<T> {}`,
  },
  {
    ns: 'eval',
    name: 'IBoundingBoxTree',
    body: [
      `export interface IBoundingBoxTree<T> {`,
      `\tboundingBox(): core.BoundingBox;`,
      `\tsplit(): [IBoundingBoxTree<T>, IBoundingBoxTree<T>];`,
      `\tyield(): T;`,
      `\tindivisible(tolerance: number): boolean;`,
      `\tempty(): boolean;`,
      `}`,
    ].join('\n'),
  },
  {
    ns: 'core',
    name: 'CoreExports',
    body: `export { ${typedefs.map(([name, type]) => name).join(', ')} };`,
  }
];

for (const stub of stubs) {
  const ns = src.getModules().find(m => m.getName() === stub.ns);
  if (!ns) continue;
  const existing = ns.getInterface(stub.name) || ns.getClass(stub.name);
  if (existing) {
    console.warn(`Warning: codegen now emits ${stub.ns}.${stub.name} — remove its stub from fix-dts.ts`);
    continue;
  }
  ns.insertStatements(0, stub.body);
}

// ---------------------------------------------------------------------------
// 4. Write the final .d.ts wrapped in declare module 'verb-nurbs'
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

for (const [name, type] of typedefs) {
  mod.addTypeAlias({ name, type });
}

// Insert the codegen output (namespaces with all classes) into the module
mod.addStatements(src.getFullText());

// Re-export all namespaces as types seperate from the verbs interface
// e.g.   export type { promhx, core, eval, exe, geom };
mod.addStatements(`export type { ${[...topLevelNamespaces].join(', ')} };`);

// Add the Verb interface and default export
mod.addInterface({
  name: 'Verb',
  properties: [
    { name: 'EPSILON', type: 'number' },
    { name: 'TOLERANCE', type: 'number' },
    { name: 'VERSION', type: 'string' },
    ...[...topLevelNamespaces].map(ns => ({ name: ns, type: `typeof ${ns}` })),
  ],
});

mod.addStatements(`const verb: Verb;`);
mod.addStatements(`export default verb;`);

// Write
outFile.saveSync();
const output = outFile.getFullText();
require('fs').writeFileSync(OUTPUT, output);
console.log(`${OUTPUT}: ${output.split('\n').length} lines`);
