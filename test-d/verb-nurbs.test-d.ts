import { expectType, expectAssignable } from 'tsd';
import verb from 'verb-nurbs';
import type { core, eval as verbEval, geom, promhx } from 'verb-nurbs';

// =============================================================================
// Top-level module shape
// =============================================================================
expectType<number>(verb.EPSILON);
expectType<number>(verb.TOLERANCE);
expectType<string>(verb.VERSION);

// =============================================================================
// core namespace - Data classes
// =============================================================================

// Constants
expectType<number>(verb.core.Constants.TOLERANCE);
expectType<number>(verb.core.Constants.EPSILON);
expectType<string>(verb.core.Constants.VERSION);

// NurbsCurveData
const curveData = new verb.core.NurbsCurveData(3, [0, 0, 0, 0, 1, 1, 1, 1], [
  [0, 0, 0],
  [1, 1, 0],
  [2, 0, 0],
  [3, 1, 0],
]);
expectType<number>(curveData.degree);
expectType<number[]>(curveData.knots);
expectType<number[][]>(curveData.controlPoints);
expectType<string>(curveData.serialize());

// NurbsSurfaceData
const surfaceData = new verb.core.NurbsSurfaceData(
  1, 1,
  [0, 0, 1, 1],
  [0, 0, 1, 1],
  [
    [[0, 0, 0], [10, 0, 0]],
    [[0, 10, 0], [10, 10, 0]],
  ]
);
expectType<number>(surfaceData.degreeU);
expectType<number>(surfaceData.degreeV);
expectType<number[]>(surfaceData.knotsU);
expectType<number[]>(surfaceData.knotsV);
expectType<number[][][]>(surfaceData.controlPoints);

// Plane and Ray
const plane = new verb.core.Plane([0, 0, 0], [0, 0, 1]);
expectType<number[]>(plane.origin);
expectType<number[]>(plane.normal);

const ray = new verb.core.Ray([0, 0, 0], [1, 0, 0]);
expectType<number[]>(ray.origin);
expectType<number[]>(ray.dir);

// BoundingBox
const bb = new verb.core.BoundingBox([[0, 0, 0], [1, 1, 1]]);
expectType<number[]>(bb.min);
expectType<number[]>(bb.max);
expectType<boolean>(bb.contains([0.5, 0.5, 0.5]));
expectType<boolean>(bb.intersects(bb));
expectType<number>(bb.getLongestAxis());
expectType<number>(bb.getAxisLength(0));

// MeshData
const meshData = new verb.core.MeshData(
  [[0, 1, 2]],
  [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
  [[0, 0, 1], [0, 0, 1], [0, 0, 1]],
  [[0, 0], [1, 0], [0, 1]]
);
expectType<number[][]>(meshData.faces);
expectType<number[][]>(meshData.points);
expectType<number[][]>(meshData.normals);
expectType<number[][]>(meshData.uvs);
expectType<core.MeshData>(verb.core.MeshData.empty());

// PolylineData
const polyData = new verb.core.PolylineData([[0, 0, 0], [1, 1, 1]], [0, 1]);
expectType<number[][]>(polyData.points);
expectType<number[]>(polyData.params);

// VolumeData
const volData = new verb.core.VolumeData(1, 1, 1, [0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1], [[[[0, 0, 0]]]]);
expectType<number>(volData.degreeU);
expectType<number>(volData.degreeW);

// Pair and Interval
const pair = new verb.core.Pair<string, number>('hello', 42);
expectType<string>(pair.item0);
expectType<number>(pair.item1);

const interval = new verb.core.Interval<number>(0, 1);
expectType<number>(interval.min);
expectType<number>(interval.max);

// Intersection data classes
const cci = new verb.core.CurveCurveIntersection([0, 0, 0], [0, 0, 0], 0.5, 0.5);
expectType<number[]>(cci.point0);
expectType<number[]>(cci.point1);
expectType<number>(cci.u0);
expectType<number>(cci.u1);

const csi = new verb.core.CurveSurfaceIntersection(0.5, [0.5, 0.5], [0, 0, 0], [0, 0, 0]);
expectType<number>(csi.u);
expectType<number[]>(csi.uv);

// =============================================================================
// core namespace - Utility classes
// =============================================================================

// Vec
expectType<number>(verb.core.Vec.dot([1, 0, 0], [0, 1, 0]));
expectType<number[]>(verb.core.Vec.add([1, 0], [0, 1]));
expectType<number[]>(verb.core.Vec.sub([1, 0], [0, 1]));
expectType<number[]>(verb.core.Vec.mul(2, [1, 2, 3]));
expectType<number[]>(verb.core.Vec.cross([1, 0, 0], [0, 1, 0]));
expectType<number>(verb.core.Vec.dist([0, 0], [1, 1]));
expectType<number[]>(verb.core.Vec.normalized([1, 1, 1]));
expectType<number>(verb.core.Vec.norm([1, 2, 3]));
expectType<number[]>(verb.core.Vec.range(5));
expectType<number[]>(verb.core.Vec.zeros1d(3));
expectType<number[][]>(verb.core.Vec.zeros2d(3, 3));
expectType<boolean>(verb.core.Vec.isZero([0, 0, 0]));

// Mat
expectType<number[][]>(verb.core.Mat.identity(3));
expectType<number[][]>(verb.core.Mat.mult([[1]], [[1]]));
expectType<number[]>(verb.core.Mat.dot([[1, 0], [0, 1]], [1, 2]));
expectType<number[]>(verb.core.Mat.solve([[1, 0], [0, 1]], [1, 2]));

// Trig
expectType<boolean>(verb.core.Trig.isPointInPlane([0, 0, 0], plane, 0.001));
expectType<number>(verb.core.Trig.distToSegment([0, 0, 0], [1, 0, 0], [0.5, 0.5, 0]));

// Mesh utility
expectType<number[]>(verb.core.Mesh.getTriangleNorm([[0, 0, 0], [1, 0, 0], [0, 1, 0]], [0, 1, 2]));

// Minimizer
const minResult = verb.core.Minimizer.uncmin((x: number[]) => x[0] * x[0], [1]);
expectType<core.MinimizationResult>(minResult);
expectType<number[]>(minResult.solution);
expectType<number>(minResult.value);

// Deserializer
const deserialized = verb.core.Deserializer.deserialize<core.NurbsCurveData>('{}');
expectType<core.NurbsCurveData>(deserialized);

// KdTree
const kdTree = new verb.core.KdTree<string>(
  [new verb.core.KdPoint<string>([0, 0, 0], 'a')],
  (a: number[], b: number[]) => verb.core.Vec.dist(a, b)
);
const nearest = kdTree.nearest([0, 0, 0], 1, 10);
expectType<core.Pair<core.KdPoint<string>, number>[]>(nearest);

// =============================================================================
// eval namespace
// =============================================================================

// Eval
expectType<number[]>(verb.eval.Eval.rationalCurvePoint(curveData, 0.5));
expectType<number[][]>(verb.eval.Eval.rationalCurveDerivatives(curveData, 0.5));
expectType<number[]>(verb.eval.Eval.rationalSurfacePoint(surfaceData, 0.5, 0.5));
expectType<number[]>(verb.eval.Eval.rationalCurveTangent(curveData, 0.5));
expectType<number[]>(verb.eval.Eval.rationalSurfaceNormal(surfaceData, 0.5, 0.5));
expectType<number[]>(verb.eval.Eval.curvePoint(curveData, 0.5));
expectType<number[]>(verb.eval.Eval.surfacePoint(surfaceData, 0.5, 0.5));
expectType<number[]>(verb.eval.Eval.dehomogenize([1, 2, 3, 1]));
expectType<number[][]>(verb.eval.Eval.homogenize1d([[0, 0, 0], [1, 1, 1]]));
expectType<number>(verb.eval.Eval.knotSpan(3, 0.5, [0, 0, 0, 0, 1, 1, 1, 1]));
expectType<number[]>(verb.eval.Eval.basisFunctions(0.5, 3, [0, 0, 0, 0, 1, 1, 1, 1]));
expectType<boolean>(verb.eval.Eval.areValidRelations(3, 4, 8));

// Check
expectType<boolean>(verb.eval.Check.isValidKnotVector([0, 0, 1, 1], 1));
expectType<boolean>(verb.eval.Check.isNonDecreasing([0, 1, 2]));
expectType<core.NurbsCurveData>(verb.eval.Check.isValidNurbsCurveData(curveData));
expectType<core.NurbsSurfaceData>(verb.eval.Check.isValidNurbsSurfaceData(surfaceData));

// Make
expectType<core.NurbsCurveData>(verb.eval.Make.polyline([[0, 0, 0], [1, 1, 1]]));
expectType<core.NurbsCurveData>(verb.eval.Make.arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 1, 0, Math.PI));
expectType<core.NurbsCurveData>(verb.eval.Make.ellipseArc([0, 0, 0], [1, 0, 0], [0, 1, 0], 0, Math.PI));
expectType<core.NurbsSurfaceData>(verb.eval.Make.extrudedSurface([0, 0, 1], 1, curveData));
expectType<core.NurbsSurfaceData>(verb.eval.Make.revolvedSurface(curveData, [0, 0, 0], [0, 0, 1], Math.PI));
expectType<core.NurbsSurfaceData>(verb.eval.Make.sphericalSurface([0, 0, 0], [0, 0, 1], [1, 0, 0], 1));
expectType<core.NurbsSurfaceData>(verb.eval.Make.cylindricalSurface([0, 0, 1], [1, 0, 0], [0, 0, 0], 1, 1));
expectType<core.NurbsSurfaceData>(verb.eval.Make.conicalSurface([0, 0, 1], [1, 0, 0], [0, 0, 0], 1, 1));
expectType<core.NurbsSurfaceData>(verb.eval.Make.fourPointSurface([0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]));
expectType<core.NurbsSurfaceData>(verb.eval.Make.loftedSurface([curveData, curveData]));
expectType<core.NurbsCurveData>(verb.eval.Make.rationalInterpCurve([[0, 0, 0], [1, 1, 0], [2, 0, 0]]));
expectType<core.NurbsCurveData>(verb.eval.Make.rationalBezierCurve([[0, 0, 0], [1, 1, 0], [2, 0, 0]]));
expectType<core.NurbsCurveData>(verb.eval.Make.clonedCurve(curveData));
expectType<core.NurbsSurfaceData>(verb.eval.Make.rationalTranslationalSurface(curveData, curveData));
expectType<core.NurbsCurveData[]>(verb.eval.Make.surfaceBoundaryCurves(surfaceData));
expectType<core.NurbsCurveData>(verb.eval.Make.surfaceIsocurve(surfaceData, 0.5));

// Modify
expectType<core.NurbsCurveData>(verb.eval.Modify.curveReverse(curveData));
expectType<core.NurbsSurfaceData>(verb.eval.Modify.surfaceReverse(surfaceData));
expectType<number[]>(verb.eval.Modify.knotsReverse([0, 0, 1, 1]));
expectType<core.NurbsCurveData[]>(verb.eval.Modify.unifyCurveKnotVectors([curveData, curveData]));
expectType<core.NurbsCurveData>(verb.eval.Modify.curveElevateDegree(curveData, 4));
expectType<core.NurbsSurfaceData>(verb.eval.Modify.rationalSurfaceTransform(surfaceData, verb.core.Mat.identity(4)));
expectType<core.NurbsCurveData>(verb.eval.Modify.rationalCurveTransform(curveData, verb.core.Mat.identity(4)));
expectType<core.NurbsCurveData[]>(verb.eval.Modify.decomposeCurveIntoBeziers(curveData));
expectType<core.NurbsCurveData>(verb.eval.Modify.curveKnotInsert(curveData, 0.5, 1));

// Divide
expectType<core.NurbsSurfaceData[]>(verb.eval.Divide.surfaceSplit(surfaceData, 0.5));
expectType<core.NurbsCurveData[]>(verb.eval.Divide.curveSplit(curveData, 0.5));
const arcLenSamples = verb.eval.Divide.rationalCurveByEqualArcLength(curveData, 5);
expectType<verbEval.CurveLengthSample[]>(arcLenSamples);
expectType<number>(arcLenSamples[0].u);
expectType<number>(arcLenSamples[0].len);

// Analyze
expectType<number[]>(verb.eval.Analyze.rationalCurveClosestPoint(curveData, [0, 0, 0]));
expectType<number>(verb.eval.Analyze.rationalCurveClosestParam(curveData, [0, 0, 0]));
expectType<number[]>(verb.eval.Analyze.rationalSurfaceClosestPoint(surfaceData, [0, 0, 0]));
expectType<number[]>(verb.eval.Analyze.rationalSurfaceClosestParam(surfaceData, [0, 0, 0]));
expectType<number>(verb.eval.Analyze.rationalCurveArcLength(curveData));
expectType<number>(verb.eval.Analyze.rationalCurveParamAtArcLength(curveData, 1.0));

// Tess
expectType<number[][]>(verb.eval.Tess.rationalCurveRegularSample(curveData, 10, false));
expectType<number[][]>(verb.eval.Tess.rationalCurveAdaptiveSample(curveData));
expectType<core.MeshData>(verb.eval.Tess.rationalSurfaceNaive(surfaceData, 10, 10));
expectType<core.MeshData>(verb.eval.Tess.rationalSurfaceAdaptive(surfaceData));

// AdaptiveRefinementOptions
const opts = new verb.eval.AdaptiveRefinementOptions();
expectType<number>(opts.normTol);
expectType<number>(opts.minDepth);
expectType<number>(opts.maxDepth);
expectType<boolean>(opts.refine);

// Intersect (eval)
expectType<core.CurveCurveIntersection[]>(verb.eval.Intersect.curves(curveData, curveData, 0.001));
expectType<core.NurbsCurveData[]>(verb.eval.Intersect.surfaces(surfaceData, surfaceData, 0.001));
expectType<core.CurveSurfaceIntersection[]>(verb.eval.Intersect.curveAndSurface(curveData, surfaceData));
expectType<core.Ray>(verb.eval.Intersect.planes([0, 0, 0], [0, 0, 1], [0, 0, 0], [0, 1, 0]));

// =============================================================================
// geom namespace
// =============================================================================

// NurbsCurve
const curve = new verb.geom.NurbsCurve(curveData);
expectType<number>(curve.degree());
expectType<number[]>(curve.knots());
expectType<number[][]>(curve.controlPoints());
expectType<number[]>(curve.weights());
expectType<core.NurbsCurveData>(curve.asNurbs());
expectType<geom.NurbsCurve>(curve.clone());
expectType<core.Interval<number>>(curve.domain());
expectType<number[]>(curve.point(0.5));
expectType<number[]>(curve.tangent(0.5));
expectType<number[][]>(curve.derivatives(0.5));
expectType<number[]>(curve.closestPoint([0, 0, 0]));
expectType<number>(curve.closestParam([0, 0, 0]));
expectType<number>(curve.length());
expectType<number>(curve.lengthAtParam(0.5));
expectType<number>(curve.paramAtLength(1.0));
expectType<geom.NurbsCurve[]>(curve.split(0.5));
expectType<geom.NurbsCurve>(curve.reverse());
expectType<number[][]>(curve.tessellate());
expectType<geom.NurbsCurve>(curve.transform(verb.core.Mat.identity(4)));
expectType<string>(curve.serialize());

// NurbsCurve static methods
const curveFromPts = verb.geom.NurbsCurve.byPoints([[0, 0, 0], [1, 1, 0], [2, 0, 0]]);
expectType<geom.NurbsCurve>(curveFromPts);
const curveFromKnots = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
  3, [0, 0, 0, 0, 1, 1, 1, 1], [[0, 0, 0], [1, 1, 0], [2, 0, 0], [3, 1, 0]]
);
expectType<geom.NurbsCurve>(curveFromKnots);

// NurbsCurve async methods
expectType<promhx.Promise<number[]>>(curve.pointAsync(0.5));
expectType<promhx.Promise<number[]>>(curve.tangentAsync(0.5));
expectType<promhx.Promise<number[][]>>(curve.derivativesAsync(0.5));
expectType<promhx.Promise<number[]>>(curve.closestPointAsync([0, 0, 0]));
expectType<promhx.Promise<number>>(curve.lengthAsync());
expectType<promhx.Promise<geom.NurbsCurve[]>>(curve.splitAsync(0.5));
expectType<promhx.Promise<geom.NurbsCurve>>(curve.reverseAsync());
expectType<promhx.Promise<number[][]>>(curve.tessellateAsync());
expectType<promhx.Promise<geom.NurbsCurve>>(curve.transformAsync(verb.core.Mat.identity(4)));

// ICurve interface conformance
const iCurve: geom.ICurve = curve;
expectType<core.NurbsCurveData>(iCurve.asNurbs());
expectType<core.Interval<number>>(iCurve.domain());
expectType<number[]>(iCurve.point(0.5));
expectType<number[][]>(iCurve.derivatives(0.5));

// NurbsSurface
const surface = new verb.geom.NurbsSurface(surfaceData);
expectType<number>(surface.degreeU());
expectType<number>(surface.degreeV());
expectType<number[]>(surface.knotsU());
expectType<number[]>(surface.knotsV());
expectType<number[][][]>(surface.controlPoints());
expectType<core.NurbsSurfaceData>(surface.asNurbs());
expectType<geom.NurbsSurface>(surface.clone());
expectType<core.Interval<number>>(surface.domainU());
expectType<core.Interval<number>>(surface.domainV());
expectType<number[]>(surface.point(0.5, 0.5));
expectType<number[]>(surface.normal(0.5, 0.5));
expectType<number[][][]>(surface.derivatives(0.5, 0.5));
expectType<number[]>(surface.closestParam([0, 0, 0]));
expectType<number[]>(surface.closestPoint([0, 0, 0]));
expectType<geom.NurbsSurface[]>(surface.split(0.5));
expectType<geom.NurbsSurface>(surface.reverse());
expectType<geom.NurbsCurve>(surface.isocurve(0.5));
expectType<geom.NurbsCurve[]>(surface.boundaries());
expectType<core.MeshData>(surface.tessellate());
expectType<geom.NurbsSurface>(surface.transform(verb.core.Mat.identity(4)));
expectType<string>(surface.serialize());

// NurbsSurface static methods
expectType<geom.NurbsSurface>(verb.geom.NurbsSurface.byCorners([0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]));
expectType<geom.NurbsSurface>(verb.geom.NurbsSurface.byLoftingCurves([curve, curve]));

// ISurface interface conformance
const iSurface: geom.ISurface = surface;
expectType<core.NurbsSurfaceData>(iSurface.asNurbs());
expectType<core.Interval<number>>(iSurface.domainU());
expectType<core.Interval<number>>(iSurface.domainV());
expectType<number[]>(iSurface.point(0.5, 0.5));

// Specialized curves
const line = new verb.geom.Line([0, 0, 0], [1, 1, 1]);
expectType<number[]>(line.start());
expectType<number[]>(line.end());
expectAssignable<geom.NurbsCurve>(line);
expectAssignable<geom.ICurve>(line);

const arc = new verb.geom.Arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 1, 0, Math.PI);
expectType<number[]>(arc.center());
expectType<number[]>(arc.xaxis());
expectType<number[]>(arc.yaxis());
expectType<number>(arc.radius());
expectType<number>(arc.minAngle());
expectType<number>(arc.maxAngle());

const circle = new verb.geom.Circle([0, 0, 0], [1, 0, 0], [0, 1, 0], 1);
expectAssignable<geom.Arc>(circle);

const bezier = new verb.geom.BezierCurve([[0, 0, 0], [1, 1, 0], [2, 0, 0]]);
expectAssignable<geom.NurbsCurve>(bezier);

const ellipseArc = new verb.geom.EllipseArc([0, 0, 0], [1, 0, 0], [0, 1, 0], 0, Math.PI);
expectType<number[]>(ellipseArc.center());
expectType<number[]>(ellipseArc.xaxis());
expectType<number[]>(ellipseArc.yaxis());

const ellipse = new verb.geom.Ellipse([0, 0, 0], [1, 0, 0], [0, 1, 0]);
expectAssignable<geom.EllipseArc>(ellipse);

// Specialized surfaces
const spherical = new verb.geom.SphericalSurface([0, 0, 0], 1);
expectType<number[]>(spherical.center());
expectType<number>(spherical.radius());
expectAssignable<geom.NurbsSurface>(spherical);

const revolved = new verb.geom.RevolvedSurface(curve, [0, 0, 0], [0, 0, 1], Math.PI);
expectType<geom.ICurve>(revolved.profile());
expectType<number[]>(revolved.center());
expectType<number[]>(revolved.axis());
expectType<number>(revolved.angle());

const extruded = new verb.geom.ExtrudedSurface(curve, [0, 0, 1]);
expectType<geom.ICurve>(extruded.profile());
expectType<number[]>(extruded.direction());

const cylindrical = new verb.geom.CylindricalSurface([0, 0, 1], [1, 0, 0], [0, 0, 0], 1, 1);
expectType<number[]>(cylindrical.axis());
expectType<number[]>(cylindrical.xaxis());
expectType<number[]>(cylindrical.base());
expectType<number>(cylindrical.height());
expectType<number>(cylindrical.radius());

const conical = new verb.geom.ConicalSurface([0, 0, 1], [1, 0, 0], [0, 0, 0], 1, 1);
expectType<number[]>(conical.axis());
expectType<number>(conical.height());
expectType<number>(conical.radius());

const swept = new verb.geom.SweptSurface(curve, curve);
expectType<geom.ICurve>(swept.profile());
expectType<geom.ICurve>(swept.rail());

// geom.Intersect
expectType<core.CurveCurveIntersection[]>(verb.geom.Intersect.curves(curve, curve));
expectType<core.CurveSurfaceIntersection[]>(verb.geom.Intersect.curveAndSurface(curve, surface));
expectType<geom.NurbsCurve[]>(verb.geom.Intersect.surfaces(surface, surface));

// geom.Intersect async
expectType<promhx.Promise<core.CurveCurveIntersection[]>>(verb.geom.Intersect.curvesAsync(curve, curve));
expectType<promhx.Promise<core.CurveSurfaceIntersection[]>>(verb.geom.Intersect.curveAndSurfaceAsync(curve, surface));
expectType<promhx.Promise<geom.NurbsCurve[]>>(verb.geom.Intersect.surfacesAsync(surface, surface));

// =============================================================================
// exe namespace
// =============================================================================
expectType<number>(verb.exe.Dispatcher.THREADS);

// =============================================================================
// promhx namespace
// =============================================================================
const deferred = new verb.promhx.Deferred<number>();
deferred.resolve(42);
const promise = deferred.promise();
expectType<promhx.Promise<number>>(promise);
const mapped = promise.then((x: number) => x.toString());
expectType<promhx.Promise<string>>(mapped);
