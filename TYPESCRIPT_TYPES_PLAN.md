# Plan: Automated TypeScript Type Generation for verb-nurbs

## Current State

- Hand-crafted `build/js/verb-nurbs.d.ts` (1503 lines) covers all `@:expose`d classes plus
  some non-exposed types needed for completeness (`MinimizationResult`, `SurfacePoint`,
  `IBoundingBoxTree`, `ISerializable`).
- Type tests using `tsd` verify the hand-crafted types compile correctly (`npm run test:types`).
- The Haxe source uses `@:expose("namespace.ClassName")` on ~60 classes to make them
  available in the JS output under `verb.core.*`, `verb.eval.*`, `verb.geom.*`, `verb.exe.*`.

## Generator Comparison: hxtsdgen vs codegen

### [hxtsdgen](https://github.com/elsassph/hxtsdgen) (v0.3.0)

**How it works:** Compiler plugin (`-lib hxtsdgen`) that generates a `.d.ts` alongside the JS
output. It looks at `@:expose` metadata to decide what to export.

**Pros:**
- Zero config - just add `-lib hxtsdgen` to build args
- Understands Haxe type system natively (generics, typedefs, interfaces)
- `-D hxtsdgen_namespaced` preserves the `core.*`, `eval.*`, `geom.*` package hierarchy
- Can split types/enums into separate files

**Cons / Gaps for verb-nurbs:**
- Only exports types with `@:expose` - types used by exposed functions are NOT
  auto-exported. This means `MinimizationResult`, `SurfacePoint`, `IBoundingBoxTree`,
  `ISerializable`, and the typedefs (`Point`, `Vector`, `Matrix`, `KnotArray`, `Tri`, `UV`)
  would be missing unless we add `@:expose` to them.
- Marked "WIP with limitations" - abstract enums, native properties not fully supported
- Properties become `get_prop/set_prop` methods instead of TS properties
- No module wrapper (`declare module 'verb-nurbs'`) - generates bare declarations
- Doesn't understand the `verb` default export pattern (the JS wraps everything into
  a `verb` object via `verb.js`/`footer.js`)

### [codegen](https://github.com/yar3333/haxe-codegen) (v2.1.2)

**How it works:** Haxe macro (`--macro CodeGen.typescriptExtern(...)`) that generates TS
from Haxe source at compile time.

**Pros:**
- More configurable - filter files (`+`/`-` rules), mapper files (`Type => OtherType`)
- `@:noapi` annotation to explicitly exclude items
- `CodeGen.exposeToRoot('package')` can auto-tag entire packages
- `CodeGen.include/exclude('spec')` for fine-grained control
- Can remap packages/classes via `CodeGen.map('source','target')`

**Cons / Gaps for verb-nurbs:**
- Also defaults to only `@:expose`d types
- Less documentation on TypeScript output format
- May need significant mapper/filter config to match the desired output
- Same module wrapper problem as hxtsdgen

### Verdict

**codegen is the better choice** because:
1. Its `exposeToRoot` and `include`/`exclude` macros let us include types like
   `MinimizationResult` and `SurfacePoint` without modifying the upstream Haxe source
2. The mapper/filter system can handle the `Point = number[]` typedefs
3. `@:noapi` gives us a clean way to exclude internal-only classes

However, **neither generator will produce a drop-in replacement** for the hand-crafted types.
A post-processing step (codemod) will be needed to:
- Wrap output in `declare module 'verb-nurbs' { ... }`
- Add the `Verb` interface and `export default verb` pattern
- Fix any property getter/setter issues
- Ensure the `promhx` namespace types are correct

## Implementation Plan

### Phase 1: Type Testing (DONE)
- [x] Add `tsd` + `typescript` as devDependencies
- [x] Add `"types"` field to `package.json`
- [x] Create `test-d/verb-nurbs.test-d.ts` with comprehensive type assertions
- [x] Add `npm run test:types` script

### Phase 2: Try Generators (needs network/haxe environment)
- [ ] Install `hxtsdgen` via haxelib, run `haxe buildjs-hxtsdgen.hxml`
- [ ] Install `codegen` via haxelib, run `haxe buildjs-codegen.hxml`
- [ ] Compare both outputs against `verb-nurbs.d.ts` - identify specific gaps
- [ ] Choose the generator that gets closest to the hand-crafted types

### Phase 3: Add Missing `@:expose` / `@:noapi` Annotations
These types are in the hand-crafted `.d.ts` but lack `@:expose`:

| Type | File | Action |
|------|------|--------|
| `MinimizationResult` | `src/verb/core/Minimizer.hx:147` | Add `@:expose("core.MinimizationResult")` |
| `SurfacePoint` | `src/verb/core/Intersections.hx:138` | Add `@:expose("eval.SurfacePoint")` |
| `IBoundingBoxTree<T>` | `src/verb/eval/Intersect.hx:1196` | Add `@:expose("eval.IBoundingBoxTree")` |
| `ISerializable` | `src/verb/core/Serialization.hx:12` | Add `@:expose("geom.ISerializable")` |

These types are in Haxe but intentionally NOT in the `.d.ts` (internal-only):

| Type | File | Reason |
|------|------|--------|
| `ArrayExtensions` | `src/verb/core/ArrayExtensions.hx` | Compile-time `using` extensions |
| `BinaryHeap<T>` | `src/verb/core/KdTree.hx:152` | Internal to KdTree |
| `Binomial` | `src/verb/core/Binomial.hx` | Internal math |
| `*BoundingBoxTree` (6 classes) | `src/verb/core/*.hx` | Internal BBTree implementations |
| `ThreadPool` | `src/verb/exe/ThreadPool.hx` | Internal threading |
| `Verb` | `src/verb/Verb.hx` | Entry point, not a public API |

If using codegen, these can be excluded via `@:noapi` or filter rules rather than
modifying Haxe source.

### Phase 4: Post-Processing Codemod
Create a script (`scripts/fix-dts.ts` or `scripts/fix-dts.js`) that transforms the
generator output into the final `verb-nurbs.d.ts`:

1. **Module wrapper**: Wrap in `declare module 'verb-nurbs' { ... }`
2. **Typedefs**: Ensure `Point`, `Vector`, `Matrix`, `KnotArray`, `Tri`, `UV` are
   declared both at top level and in `core` namespace
3. **Default export**: Add the `Verb` interface + `export default verb` pattern
4. **Namespace exports**: Add `export type { promhx, core, eval, exe, geom }`
5. **Property fixups**: If generator emits `get_X()/set_X()`, convert to TS properties
6. **promhx types**: The promhx library types may not generate well - may need a
   static `promhx.d.ts` section that gets prepended

### Phase 5: CI Integration
- [ ] Add build script: `npm run build:types` that runs generator + codemod
- [ ] Add to CI: run `npm run build:types && npm run test:types`
- [ ] Ensure types are regenerated on every Haxe source change

## Build Files Created

- `buildjs-hxtsdgen.hxml` - Haxe build with hxtsdgen plugin
- `buildjs-codegen.hxml` - Haxe build with codegen macro
- `test-d/verb-nurbs.test-d.ts` - Type tests
- `tsconfig.json` - TypeScript config for type tests

## Open Questions

1. **Should we contribute `@:expose` additions upstream?** Adding expose to
   `MinimizationResult`, `SurfacePoint`, etc. changes the JS output (adds them to the
   global scope). This may be unwanted upstream. Alternative: use codegen's include
   macros to generate types without modifying source.

2. **promhx types**: The promhx library is old and unmaintained. Should the generated
   types include the full promhx API, or just the subset used by verb-nurbs async methods?
   The hand-crafted types include a fairly complete promhx namespace.

3. **genes as alternative?** The [genes](https://github.com/benmerckx/genes) library
   generates both ES6 modules AND TypeScript defs. It's more modern but would require
   restructuring the build to use ES6 module output, which is a bigger change.
