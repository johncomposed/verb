# Plan: Automated TypeScript Type Generation for verb-nurbs

## Current State

- Hand-crafted `build/js/verb-nurbs.d.ts` (1503 lines) covers all `@:expose`d classes plus
  some non-exposed types needed for completeness (`MinimizationResult`, `SurfacePoint`,
  `IBoundingBoxTree`, `ISerializable`).
- Type tests using `tsd` verify the hand-crafted types compile correctly (`npm run test:types`).
- The Haxe source uses `@:expose("namespace.ClassName")` on ~60 classes to make them
  available in the JS output under `verb.core.*`, `verb.eval.*`, `verb.geom.*`, `verb.exe.*`.

## Generator Results

### hxtsdgen - DOES NOT WORK

hxtsdgen fails on verb-nurbs with two critical bugs:
1. **Null abstract implementation** - crashes on `ab.impl.get()` when encountering
   abstracts without implementations (Selector.hx:88)
2. **Infinite recursion** - stack overflow in TypeRenderer.hx:51 on recursive types
   like `KdNode<T>` (which has `left: KdNode<T>`)
3. **Field-level `@:expose`** - Haxe 4.3+ rejects `@:expose` on static vars
   (used in `Constants.hx` for TOLERANCE/EPSILON/VERSION)

**Verdict: Not viable** without significant patches to hxtsdgen itself.

### codegen - WORKS WELL (812 lines generated)

codegen successfully generates `build/js/verb-nurbs.generated.d.ts` with 812 lines
covering all `@:expose`d types. Build command:
```
haxe buildjs-codegen.hxml
```

## Concrete Comparison: codegen output vs hand-crafted .d.ts

### What codegen gets RIGHT (no changes needed):
- All class structures, inheritance, and `implements` relationships
- Generic type parameters (`Pair<T1,T2>`, `Interval<T>`, `KdTree<T>`, etc.)
- Constructor signatures and static methods
- Optional parameters (`?` syntax)
- JSDoc comments preserved from Haxe source
- Correct namespace hierarchy (`core.*`, `eval.*`, `geom.*`, `exe.*`)
- promhx types (Deferred, Promise, Stream, PublicStream)
- All method signatures match the hand-crafted types

### What codegen gets WRONG (codemod fixes needed):

| Issue | codegen output | Hand-crafted | Fix |
|-------|---------------|--------------|-----|
| **Typedef references** | `verb.core.Data.Point` | `Point` or `number[]` | Resolve typedef refs to simple types |
| **Nested class refs** | `eval.Divide.CurveLengthSample` | `eval.CurveLengthSample` | Flatten inner class paths |
| **Nested class refs** | `eval.Tess.AdaptiveRefinementOptions` | `eval.AdaptiveRefinementOptions` | Flatten inner class paths |
| **Nested class refs** | `eval.Tess.AdaptiveRefinementNode` | `eval.AdaptiveRefinementNode` | Flatten inner class paths |
| **Nested class refs** | `eval.Analyze.KnotMultiplicity` | `eval.KnotMultiplicity` | Flatten inner class paths |
| **Nested class refs** | `eval.Intersect.IBoundingBoxTree` | `eval.IBoundingBoxTree` | Flatten inner class paths |
| **Nested class refs** | `core.KdTree.KdPoint` | `core.KdPoint` | Flatten inner class paths |
| **Nested class refs** | `core.KdTree.KdNode` | `core.KdNode` | Flatten inner class paths |
| **Nested class refs** | `core.Minimizer.MinimizationResult` | `core.MinimizationResult` | Flatten inner class paths |
| **Nested class refs** | `verb.core.Intersections.SurfacePoint` | `eval.SurfacePoint` | Flatten + remap namespace |
| **Interface refs** | `verb.geom.ICurve` | `geom.ICurve` | Strip `verb.` prefix |
| **Interface refs** | `verb.geom.ISurface` | `geom.ISurface` | Strip `verb.` prefix |
| **AsyncBase ref** | `promhx.base.AsyncBase<T>` | `AsyncBase<T>` (stub) | Add AsyncBase stub, strip `.base.` |
| **No module wrapper** | bare `export namespace` | `declare module 'verb-nurbs' { ... }` | Wrap entire output |
| **No typedefs** | (not emitted) | `type Point = number[]` etc. | Prepend typedef declarations |
| **No default export** | (not emitted) | `Verb` interface + `export default verb` | Append module export |
| **No type re-export** | (not emitted) | `export type { promhx, core, eval, exe, geom }` | Append type exports |
| **Missing interfaces** | `ICurve`/`ISurface`/`ISerializable` not declared | Full interface declarations | Add interface declarations |

### What's MISSING from codegen output:
- `ISerializable` interface (no body, just referenced via `implements`)
- `ICurve` interface (full method signatures)
- `ISurface` interface (full method signatures)
- `IBoundingBoxTree<T>` interface (referenced in params but not declared as standalone)
- `SurfacePoint` class (referenced by `AdaptiveRefinementNode` but not declared standalone)
- `MinimizationResult` class (referenced but declared nested under `core.Minimizer.`)
- Typedef declarations (`Point`, `Vector`, `Matrix`, `KnotArray`, `Tri`, `UV`)

Note: codegen DOES include `SurfacePoint`, `MinimizationResult`, `KnotMultiplicity`,
`CurveLengthSample`, `AdaptiveRefinementNode`, `AdaptiveRefinementOptions`, `KdPoint`,
`KdNode`, and `IBoundingBoxTree` in the output - they're just nested under their
parent class's namespace (e.g., `core.Minimizer.MinimizationResult`). The interfaces
`ICurve`/`ISurface`/`ISerializable` are truly absent.

## Revised Implementation Plan

### Phase 1: Type Testing (DONE)
- [x] `tsd` + `typescript` devDependencies
- [x] `"types"` field in `package.json`
- [x] `test-d/verb-nurbs.test-d.ts` with comprehensive type assertions
- [x] `npm run test:types` script

### Phase 2: Generator Evaluation (DONE)
- [x] hxtsdgen: crashes with null access + stack overflow -- **not viable**
- [x] codegen: works, produces 812 lines, good foundation -- **chosen approach**

### Phase 3: Post-Processing Script (`scripts/fix-dts.js`)

A Node.js script that transforms codegen output into the final `.d.ts`. These are
primarily **string replacements**, not AST transforms:

1. **Resolve typedef references** (regex replacements):
   ```
   verb.core.Data.Point    → Point  (or number[])
   verb.core.Data.Vector   → Vector (or number[])
   verb.core.Data.Matrix   → Matrix (or number[][])
   verb.core.Data.KnotArray → KnotArray (or number[])
   verb.core.Data.Tri      → Tri    (or number[])
   verb.core.Data.UV       → UV     (or number[])
   ```

2. **Flatten nested class references** (regex replacements):
   ```
   eval.Divide.CurveLengthSample     → eval.CurveLengthSample
   eval.Tess.AdaptiveRefinementOptions → eval.AdaptiveRefinementOptions
   eval.Tess.AdaptiveRefinementNode   → eval.AdaptiveRefinementNode
   eval.Analyze.KnotMultiplicity      → eval.KnotMultiplicity
   eval.Intersect.IBoundingBoxTree    → eval.IBoundingBoxTree
   core.KdTree.KdPoint               → core.KdPoint
   core.KdTree.KdNode                → core.KdNode
   core.Minimizer.MinimizationResult  → core.MinimizationResult
   verb.core.Intersections.SurfacePoint → eval.SurfacePoint
   ```

3. **Strip `verb.` prefix from interface refs**:
   ```
   verb.geom.ICurve    → geom.ICurve
   verb.geom.ISurface  → geom.ISurface
   ```

4. **Fix promhx base ref**:
   ```
   promhx.base.AsyncBase → AsyncBase
   ```

5. **Prepend** typedef declarations + `AsyncBase` stub
6. **Append** interface declarations (`ICurve`, `ISurface`, `ISerializable`)
7. **Wrap** in `declare module 'verb-nurbs' { ... }`
8. **Append** `Verb` interface + default export + type re-exports

### Phase 4: Haxe Source Changes (optional, for upstream)

To improve codegen output quality, these `@:expose` additions would help:

| Type | File | Proposed annotation |
|------|------|---------------------|
| `MinimizationResult` | `core/Minimizer.hx:147` | `@:expose("core.MinimizationResult")` |
| `SurfacePoint` | `core/Intersections.hx:138` | `@:expose("eval.SurfacePoint")` |

Field-level `@:expose` in `Constants.hx` should be removed (incompatible with
Haxe 4.3+). The class-level `@:expose("core.Constants")` already makes
`TOLERANCE`/`EPSILON`/`VERSION` accessible via `verb.core.Constants.X`.

### Phase 5: CI Integration
- [ ] `npm run build:types` = `haxe buildjs-codegen.hxml && node scripts/fix-dts.js`
- [ ] `npm run test:types` validates the output
- [ ] CI runs both on every Haxe source change

## Build Files

- `buildjs-hxtsdgen.hxml` - hxtsdgen build (broken, kept for reference)
- `buildjs-codegen.hxml` - codegen build (working)
- `build/js/verb-nurbs.generated.d.ts` - raw codegen output (812 lines)
- `build/js/verb-nurbs.d.ts` - hand-crafted types (1503 lines, the gold standard)
- `test-d/verb-nurbs.test-d.ts` - type tests
- `tsconfig.json` - TypeScript config for type tests

## Open Questions

1. **Typedef resolution strategy**: Should the codemod resolve to simple types
   (`number[]`) or keep named aliases (`Point`)? Named aliases are more readable
   but require declaring the types. Current hand-crafted approach uses named aliases.

2. **Interface generation**: codegen doesn't emit interfaces at all. We need to
   either: (a) hardcode them in the codemod, (b) extract them from Haxe source
   with a separate tool, or (c) add `@:expose` to them upstream.

3. **promhx types**: Since promhx is unmaintained and verb-nurbs is the only
   consumer, consider replacing the full promhx namespace with just the subset
   used (Promise, Deferred, Stream, PublicStream).
