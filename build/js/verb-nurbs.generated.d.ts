export namespace promhx
{
	export class Deferred<T> extends promhx.base.AsyncBase<T>
	{
		constructor();
		/**
		 The public write interface
		 */
		resolve(val:T) : void;
		/**
		 Returns a new promise based on the current deferred instance
		 */
		promise() : promhx.Promise<T>;
		/**
		 Returns a new stream based on the current deferred instance
		 */
		stream() : promhx.Stream<T>;
		/**
		 Returns a stream based on the current deferred instance
		 */
		publicStream() : promhx.PublicStream<T>;
	}
	
	export class Promise<T> extends promhx.base.AsyncBase<T>
	{
		constructor(d?:promhx.Deferred<T>);
		/**
		 Rejects the promise, throwing an error.
		 */
		reject(e:any) : void;
		/**
		 add a wait function directly to the Promise instance.
		 */
		then<A>(f:(arg:T) => A) : promhx.Promise<A>;
		unlink(to:promhx.base.AsyncBase<any>) : void;
		pipe<A>(f:(arg:T) => promhx.Promise<A>) : promhx.Promise<A>;
		/**
		 Pipes an error back into a normal type.
		 */
		errorPipe(f:(arg:any) => promhx.Promise<T>) : promhx.Promise<T>;
		/**
		 Macro method that binds the promise arguments to a single function
		 callback that is triggered when all promises are resolved.
		 Note: You may call this function on as many promise arguments as you
		 like.
		 */
		static when<T>(args:any) : any;
		/**
		 Transforms an iterable of promises into a single promise which resolves
		 to an array of values.
		 */
		static whenAll<T>(itb:Iterable<promhx.Promise<T>>) : promhx.Promise<T[]>;
		/**
		 Converts any value to a resolved Promise
		 */
		static promise<T>(_val:T) : promhx.Promise<T>;
	}
	
	export class Stream<T> extends promhx.base.AsyncBase<T>
	{
		constructor(d?:promhx.Deferred<T>);
		/**
		 add a wait function directly to the Stream instance.
		 */
		then<A>(f:(arg:T) => A) : promhx.Stream<A>;
		detachStream(str:promhx.Stream<any>) : boolean;
		/**
		 Momentarily disable updates for the stream.  Set the pause state with
		 the argument.  Call it without the argument to toggle the current state.
		 */
		pause(set?:boolean) : void;
		pipe<A>(f:(arg:T) => promhx.Stream<A>) : promhx.Stream<A>;
		/**
		 Pipes an error back into a normal type.
		 */
		errorPipe(f:(arg:any) => promhx.Stream<T>) : promhx.Stream<T>;
		end() : promhx.Stream<T>;
		/**
		 Creates a new stream linked to the current instance that only updates
		 if the [f] argument is true.
		 */
		filter(f:(arg:T) => boolean) : promhx.Stream<T>;
		/**
		 Creates a new stream that updates with the values from the current
		 stream until the stream ends, and then takes values from the next stream
		 [s] until that stream ends.
		 */
		concat(s:promhx.Stream<T>) : promhx.Stream<T>;
		/**
		 Merges another stream into the current one.
		 */
		merge(s:promhx.Stream<T>) : promhx.Stream<T>;
		/**
		 Macro method that binds the stream arguments to a single function
		 callback that is triggered when all streams are updated.
		 Note: You may call this function on as many stream arguments as you
		 like.
		 */
		static whenever<T>(args:any) : any;
		/**
		 Creates a stream from the iterable [itb] that will immediately update
		 for each value, and then end.
		 */
		static foreach<T>(itb:Iterable<T>) : promhx.Stream<T>;
		/**
		 Transforms an iterable of streams into a single stream which resolves
		 to an array of values.
		 */
		static wheneverAll<T>(itb:Iterable<promhx.base.AsyncBase<T>>) : promhx.Stream<T[]>;
		/**
		 Concatenates all the streams in the iterable argument to a single stream.  See
		 the [concat] instance method.
		 */
		static concatAll<T>(itb:Iterable<promhx.Stream<T>>) : promhx.Stream<T>;
		/**
		 Merges all the streams in the iterable argument to a single stream.  See
		 the [merge] instance method.
		 */
		static mergeAll<T>(itb:Iterable<promhx.Stream<T>>) : promhx.Stream<T>;
		/**
		 Converts any value to a resolved Stream
		 */
		static stream<A>(_val:A) : promhx.Stream<A>;
	}
	
	export class PublicStream<T> extends promhx.Stream<T>
	{
		constructor(def?:promhx.Deferred<T>);
	}
}

export namespace geom
{
	export class NurbsCurve extends core.SerializableBase implements verb.geom.ICurve
	{
		constructor(data:core.NurbsCurveData);
		degree() : number;
		knots() : verb.core.Data.KnotArray;
		controlPoints() : verb.core.Data.Point[];
		weights() : number[];
		asNurbs() : core.NurbsCurveData;
		clone() : geom.NurbsCurve;
		domain() : core.Interval<number>;
		transform(mat:verb.core.Data.Matrix) : geom.NurbsCurve;
		transformAsync(mat:verb.core.Data.Matrix) : promhx.Promise<geom.NurbsCurve>;
		point(u:number) : verb.core.Data.Point;
		pointAsync(u:number) : promhx.Promise<verb.core.Data.Point>;
		tangent(u:number) : verb.core.Data.Vector;
		tangentAsync(u:number) : promhx.Promise<verb.core.Data.Vector>;
		derivatives(u:number, numDerivs?:number) : verb.core.Data.Vector[];
		derivativesAsync(u:number, numDerivs?:number) : promhx.Promise<verb.core.Data.Vector[]>;
		closestPoint(pt:verb.core.Data.Point) : verb.core.Data.Point;
		closestPointAsync(pt:verb.core.Data.Point) : promhx.Promise<verb.core.Data.Point>;
		closestParam(pt:verb.core.Data.Point) : number;
		closestParamAsync(pt:any) : promhx.Promise<verb.core.Data.Point>;
		length() : number;
		lengthAsync() : promhx.Promise<number>;
		lengthAtParam(u:number) : number;
		lengthAtParamAsync() : promhx.Promise<number>;
		paramAtLength(len:number, tolerance?:number) : number;
		paramAtLengthAsync(len:number, tolerance?:number) : promhx.Promise<number>;
		divideByEqualArcLength(divisions:number) : eval.Divide.CurveLengthSample[];
		divideByEqualArcLengthAsync(divisions:number) : promhx.Promise<eval.Divide.CurveLengthSample[]>;
		divideByArcLength(arcLength:number) : eval.Divide.CurveLengthSample[];
		divideByArcLengthAsync(divisions:number) : promhx.Promise<eval.Divide.CurveLengthSample[]>;
		split(u:number) : geom.NurbsCurve[];
		splitAsync(u:number) : promhx.Promise<geom.NurbsCurve[]>;
		reverse() : geom.NurbsCurve;
		reverseAsync() : promhx.Promise<geom.NurbsCurve>;
		tessellate(tolerance?:number) : verb.core.Data.Point[];
		tessellateAsync(tolerance?:number) : promhx.Promise<verb.core.Data.Point[]>;
		static byKnotsControlPointsWeights(degree:number, knots:verb.core.Data.KnotArray, controlPoints:verb.core.Data.Point[], weights?:number[]) : geom.NurbsCurve;
		static byPoints(points:verb.core.Data.Point[], degree?:number) : geom.NurbsCurve;
	}
	
	export class Arc extends geom.NurbsCurve
	{
		constructor(center:verb.core.Data.Point, xaxis:verb.core.Data.Vector, yaxis:verb.core.Data.Vector, radius:number, minAngle:number, maxAngle:number);
		center() : verb.core.Data.Point;
		xaxis() : verb.core.Data.Vector;
		yaxis() : verb.core.Data.Vector;
		radius() : number;
		minAngle() : number;
		maxAngle() : number;
	}
	
	export class BezierCurve extends geom.NurbsCurve
	{
		constructor(points:verb.core.Data.Point[], weights?:number[]);
	}
	
	export class Circle extends geom.Arc
	{
		constructor(center:verb.core.Data.Point, xaxis:verb.core.Data.Vector, yaxis:verb.core.Data.Vector, radius:number);
	}
	
	export class NurbsSurface extends core.SerializableBase implements verb.geom.ISurface
	{
		constructor(data:core.NurbsSurfaceData);
		degreeU() : number;
		degreeV() : number;
		knotsU() : number[];
		knotsV() : number[];
		controlPoints() : verb.core.Data.Point[][];
		weights() : verb.core.Data.Point[];
		asNurbs() : core.NurbsSurfaceData;
		clone() : geom.NurbsSurface;
		domainU() : core.Interval<number>;
		domainV() : core.Interval<number>;
		point(u:number, v:number) : verb.core.Data.Point;
		pointAsync(u:number, v:number) : promhx.Promise<verb.core.Data.Point>;
		normal(u:number, v:number) : verb.core.Data.Point;
		normalAsync(u:number, v:number) : promhx.Promise<verb.core.Data.Vector[][]>;
		derivatives(u:number, v:number, numDerivs?:number) : verb.core.Data.Vector[][];
		derivativesAsync(u:number, v:number, numDerivs?:number) : promhx.Promise<verb.core.Data.Vector[][]>;
		closestParam(pt:verb.core.Data.Point) : verb.core.Data.UV;
		closestParamAsync(pt:verb.core.Data.Point) : promhx.Promise<verb.core.Data.UV>;
		closestPoint(pt:verb.core.Data.Point) : verb.core.Data.Point;
		closestPointAsync(pt:verb.core.Data.Point) : promhx.Promise<verb.core.Data.Point>;
		split(u:number, useV?:boolean) : geom.NurbsSurface[];
		splitAsync(u:number, useV?:boolean) : promhx.Promise<geom.NurbsSurface[]>;
		reverse(useV?:boolean) : geom.NurbsSurface;
		reverseAsync(useV?:boolean) : promhx.Promise<geom.NurbsSurface>;
		isocurve(u:number, useV?:boolean) : geom.NurbsCurve;
		isocurveAsync(u:number, useV?:boolean) : promhx.Promise<geom.NurbsCurve>;
		boundaries(options?:eval.Tess.AdaptiveRefinementOptions) : geom.NurbsCurve[];
		boundariesAsync(options?:eval.Tess.AdaptiveRefinementOptions) : promhx.Promise<geom.NurbsCurve[]>;
		tessellate(options?:eval.Tess.AdaptiveRefinementOptions) : core.MeshData;
		tessellateAsync(options?:eval.Tess.AdaptiveRefinementOptions) : promhx.Promise<core.MeshData>;
		transform(mat:verb.core.Data.Matrix) : geom.NurbsSurface;
		transformAsync(mat:verb.core.Data.Matrix) : promhx.Promise<geom.NurbsSurface>;
		static byKnotsControlPointsWeights(degreeU:number, degreeV:number, knotsU:verb.core.Data.KnotArray, knotsV:verb.core.Data.KnotArray, controlPoints:verb.core.Data.Point[][], weights?:number[][]) : geom.NurbsSurface;
		static byCorners(point0:verb.core.Data.Point, point1:verb.core.Data.Point, point2:verb.core.Data.Point, point3:verb.core.Data.Point) : geom.NurbsSurface;
		static byLoftingCurves(curves:verb.geom.ICurve[], degreeV?:number) : geom.NurbsSurface;
	}
	
	export class ConicalSurface extends geom.NurbsSurface
	{
		constructor(axis:verb.core.Data.Vector, xaxis:verb.core.Data.Vector, base:verb.core.Data.Point, height:number, radius:number);
		axis() : verb.core.Data.Vector;
		xaxis() : verb.core.Data.Vector;
		base() : verb.core.Data.Point;
		height() : number;
		radius() : number;
	}
	
	export class CylindricalSurface extends geom.NurbsSurface
	{
		constructor(axis:verb.core.Data.Vector, xaxis:verb.core.Data.Vector, base:verb.core.Data.Point, height:number, radius:number);
		axis() : verb.core.Data.Vector;
		xaxis() : verb.core.Data.Vector;
		base() : verb.core.Data.Point;
		height() : number;
		radius() : number;
	}
	
	export class EllipseArc extends geom.NurbsCurve
	{
		constructor(center:verb.core.Data.Point, xaxis:verb.core.Data.Vector, yaxis:verb.core.Data.Vector, minAngle:number, maxAngle:number);
		center() : verb.core.Data.Point;
		xaxis() : verb.core.Data.Vector;
		yaxis() : verb.core.Data.Vector;
		minAngle() : number;
		maxAngle() : number;
	}
	
	export class Ellipse extends geom.EllipseArc
	{
		constructor(center:verb.core.Data.Point, xaxis:verb.core.Data.Vector, yaxis:verb.core.Data.Vector);
	}
	
	export class ExtrudedSurface extends geom.NurbsSurface
	{
		constructor(profile:verb.geom.ICurve, direction:verb.core.Data.Vector);
		profile() : verb.geom.ICurve;
		direction() : verb.core.Data.Vector;
	}
	
	export class Intersect
	{
		static curves(first:verb.geom.ICurve, second:verb.geom.ICurve, tol?:number) : core.CurveCurveIntersection[];
		static curvesAsync(first:verb.geom.ICurve, second:verb.geom.ICurve, tol?:number) : promhx.Promise<core.CurveCurveIntersection[]>;
		static curveAndSurface(curve:verb.geom.ICurve, surface:verb.geom.ISurface, tol?:number) : core.CurveSurfaceIntersection[];
		static curveAndSurfaceAsync(curve:verb.geom.ICurve, surface:verb.geom.ISurface, tol?:number) : promhx.Promise<core.CurveSurfaceIntersection[]>;
		static surfaces(first:verb.geom.ISurface, second:verb.geom.ISurface, tol?:number) : geom.NurbsCurve[];
		static surfacesAsync(first:verb.geom.ISurface, second:verb.geom.ISurface, tol?:number) : promhx.Promise<geom.NurbsCurve[]>;
	}
	
	export class Line extends geom.NurbsCurve
	{
		constructor(start:verb.core.Data.Point, end:verb.core.Data.Point);
		start() : verb.core.Data.Point;
		end() : verb.core.Data.Point;
	}
	
	export class RevolvedSurface extends geom.NurbsSurface
	{
		constructor(profile:geom.NurbsCurve, center:verb.core.Data.Point, axis:verb.core.Data.Vector, angle:number);
		profile() : verb.geom.ICurve;
		center() : verb.core.Data.Point;
		axis() : verb.core.Data.Vector;
		angle() : number;
	}
	
	export class SphericalSurface extends geom.NurbsSurface
	{
		constructor(center:verb.core.Data.Point, radius:number);
		center() : verb.core.Data.Point;
		radius() : number;
	}
	
	export class SweptSurface extends geom.NurbsSurface
	{
		constructor(profile:verb.geom.ICurve, rail:verb.geom.ICurve);
		profile() : verb.geom.ICurve;
		rail() : verb.geom.ICurve;
	}
}

export namespace exe
{
	export class Dispatcher
	{
		static THREADS : number;
		static dispatchMethod<T>(classType:any, methodName:string, args:any[]) : promhx.Promise<T>;
	}
	
	export class WorkerPool
	{
		constructor(numThreads?:number, fileName?:string);
		addWork(className:string, methodName:string, args:any[], callback:any) : void;
		static basePath : string;
	}
}

export namespace eval
{
	export class Analyze
	{
		static knotMultiplicities(knots:verb.core.Data.KnotArray) : eval.Analyze.KnotMultiplicity[];
		static isRationalSurfaceClosed(surface:core.NurbsSurfaceData, uDir?:boolean) : boolean;
		static rationalSurfaceClosestPoint(surface:core.NurbsSurfaceData, p:verb.core.Data.Point) : verb.core.Data.Point;
		static rationalSurfaceClosestParam(surface:core.NurbsSurfaceData, p:verb.core.Data.Point) : verb.core.Data.UV;
		static rationalCurveClosestPoint(curve:core.NurbsCurveData, p:verb.core.Data.Point) : verb.core.Data.Point;
		static rationalCurveClosestParam(curve:core.NurbsCurveData, p:verb.core.Data.Point) : number;
		static rationalCurveParamAtArcLength(curve:core.NurbsCurveData, len:number, tol?:number, beziers?:core.NurbsCurveData[], bezierLengths?:number[]) : number;
		static rationalBezierCurveParamAtArcLength(curve:core.NurbsCurveData, len:number, tol?:number, totalLength?:number) : number;
		static rationalCurveArcLength(curve:core.NurbsCurveData, u?:number, gaussDegIncrease?:number) : number;
		static rationalBezierCurveArcLength(curve:core.NurbsCurveData, u?:number, gaussDegIncrease?:number) : number;
	}
	
	export class KnotMultiplicity
	{
		constructor(knot:number, mult:number);
		knot : number;
		mult : number;
		inc() : void;
	}
	
	export class Check
	{
		static isValidKnotVector(vec:number[], degree:number) : boolean;
		static isNonDecreasing(vec:number[]) : boolean;
		static isValidNurbsCurveData(data:core.NurbsCurveData) : core.NurbsCurveData;
		static isValidNurbsSurfaceData(data:core.NurbsSurfaceData) : core.NurbsSurfaceData;
	}
	
	export class Divide
	{
		static surfaceSplit(surface:core.NurbsSurfaceData, u:number, useV?:boolean) : core.NurbsSurfaceData[];
		static curveSplit(curve:core.NurbsCurveData, u:number) : core.NurbsCurveData[];
		static rationalCurveByEqualArcLength(curve:core.NurbsCurveData, num:number) : eval.Divide.CurveLengthSample[];
		static rationalCurveByArcLength(curve:core.NurbsCurveData, l:number) : eval.Divide.CurveLengthSample[];
	}
	
	export class CurveLengthSample
	{
		constructor(u:number, len:number);
		u : number;
		len : number;
	}
	
	export class Eval
	{
		static rationalCurveTangent(curve:core.NurbsCurveData, u:number) : number[];
		static rationalSurfaceNormal(surface:core.NurbsSurfaceData, u:number, v:number) : number[];
		static rationalSurfaceDerivatives(surface:core.NurbsSurfaceData, u:number, v:number, numDerivs?:number) : number[][][];
		static rationalSurfacePoint(surface:core.NurbsSurfaceData, u:number, v:number) : verb.core.Data.Point;
		static rationalCurveDerivatives(curve:core.NurbsCurveData, u:number, numDerivs?:number) : verb.core.Data.Point[];
		static rationalCurvePoint(curve:core.NurbsCurveData, u:number) : verb.core.Data.Point;
		static surfaceDerivatives(surface:core.NurbsSurfaceData, u:number, v:number, numDerivs:number) : verb.core.Data.Point[][];
		static surfaceDerivativesGivenNM(n:number, m:number, surface:core.NurbsSurfaceData, u:number, v:number, numDerivs:number) : verb.core.Data.Point[][];
		static surfacePoint(surface:core.NurbsSurfaceData, u:number, v:number) : verb.core.Data.Point;
		static surfacePointGivenNM(n:number, m:number, surface:core.NurbsSurfaceData, u:number, v:number) : verb.core.Data.Point;
		static curveRegularSamplePoints(crv:core.NurbsCurveData, divs:number) : verb.core.Data.Point[];
		static curveRegularSamplePoints2(crv:core.NurbsCurveData, divs:number) : verb.core.Data.Point[];
		static rationalSurfaceRegularSampleDerivatives(surface:core.NurbsSurfaceData, divsU:number, divsV:number, numDerivs:number) : number[][][][][];
		static surfaceRegularSampleDerivatives(surface:core.NurbsSurfaceData, divsU:number, divsV:number, numDerivs:number) : number[][][][][];
		static rationalSurfaceRegularSamplePoints(surface:core.NurbsSurfaceData, divsU:number, divsV:number) : verb.core.Data.Point[][];
		static surfaceRegularSamplePoints(surface:core.NurbsSurfaceData, divsU:number, divsV:number) : verb.core.Data.Point[][];
		static curveDerivatives(crv:core.NurbsCurveData, u:number, numDerivs:number) : verb.core.Data.Point[];
		static curveDerivativesGivenN(n:number, curve:core.NurbsCurveData, u:number, numDerivs:number) : verb.core.Data.Point[];
		static curvePoint(curve:core.NurbsCurveData, u:number) : verb.core.Data.Point;
		static areValidRelations(degree:number, num_controlPoints:number, knots_length:number) : boolean;
		static curvePointGivenN(n:number, curve:core.NurbsCurveData, u:number) : verb.core.Data.Point;
		static volumePoint(volume:core.VolumeData, u:number, v:number, w:number) : verb.core.Data.Point;
		static volumePointGivenNML(volume:core.VolumeData, n:number, m:number, l:number, u:number, v:number, w:number) : verb.core.Data.Point;
		static derivativeBasisFunctions(u:number, degree:number, knots:verb.core.Data.KnotArray) : number[][];
		static derivativeBasisFunctionsGivenNI(knotIndex:number, u:number, p:number, n:number, knots:verb.core.Data.KnotArray) : number[][];
		static basisFunctions(u:number, degree:number, knots:verb.core.Data.KnotArray) : number[];
		static basisFunctionsGivenKnotSpanIndex(knotSpan_index:number, u:number, degree:number, knots:verb.core.Data.KnotArray) : number[];
		static knotSpan(degree:number, u:number, knots:number[]) : number;
		static knotSpanGivenN(n:number, degree:number, u:number, knots:number[]) : number;
		static dehomogenize(homoPoint:verb.core.Data.Point) : verb.core.Data.Point;
		static rational1d(homoPoints:verb.core.Data.Point[]) : verb.core.Data.Point[];
		static rational2d(homoPoints:verb.core.Data.Point[][]) : verb.core.Data.Point[][];
		static weight1d(homoPoints:verb.core.Data.Point[]) : number[];
		static weight2d(homoPoints:verb.core.Data.Point[][]) : number[][];
		static dehomogenize1d(homoPoints:verb.core.Data.Point[]) : verb.core.Data.Point[];
		static dehomogenize2d(homoPoints:verb.core.Data.Point[][]) : verb.core.Data.Point[][];
		static homogenize1d(controlPoints:verb.core.Data.Point[], weights?:number[]) : verb.core.Data.Point[];
		static homogenize2d(controlPoints:verb.core.Data.Point[][], weights?:number[][]) : verb.core.Data.Point[][];
	}
	
	export class Intersect
	{
		static surfaces(surface0:core.NurbsSurfaceData, surface1:core.NurbsSurfaceData, tol:number) : core.NurbsCurveData[];
		static surfacesAtPointWithEstimate(surface0:core.NurbsSurfaceData, surface1:core.NurbsSurfaceData, uv1:verb.core.Data.UV, uv2:verb.core.Data.UV, tol:number) : core.SurfaceSurfaceIntersectionPoint;
		static meshes(mesh0:core.MeshData, mesh1:core.MeshData, bbtree0?:eval.Intersect.IBoundingBoxTree<number>, bbtree1?:eval.Intersect.IBoundingBoxTree<number>) : core.MeshIntersectionPoint[][];
		static meshSlices(mesh:core.MeshData, min:number, max:number, step:number) : core.MeshIntersectionPoint[][][];
		static makeMeshIntersectionPolylines(segments:core.Interval<core.MeshIntersectionPoint>[]) : core.MeshIntersectionPoint[][];
		static lookupAdjacentSegment(segEnd:core.MeshIntersectionPoint, tree:core.KdTree<core.MeshIntersectionPoint>, numResults:number) : core.MeshIntersectionPoint;
		static curveAndSurface(curve:core.NurbsCurveData, surface:core.NurbsSurfaceData, tol?:number, crvBbTree?:eval.Intersect.IBoundingBoxTree<core.NurbsCurveData>, srfBbTree?:eval.Intersect.IBoundingBoxTree<core.NurbsSurfaceData>) : core.CurveSurfaceIntersection[];
		static curveAndSurfaceWithEstimate(curve:core.NurbsCurveData, surface:core.NurbsSurfaceData, start_params:number[], tol?:number) : core.CurveSurfaceIntersection;
		static polylineAndMesh(polyline:core.PolylineData, mesh:core.MeshData, tol:number) : core.PolylineMeshIntersection[];
		static curves(curve1:core.NurbsCurveData, curve2:core.NurbsCurveData, tolerance:number) : core.CurveCurveIntersection[];
		static triangles(mesh0:core.MeshData, faceIndex0:number, mesh1:core.MeshData, faceIndex1:number) : core.Interval<core.MeshIntersectionPoint>;
		static clipRayInCoplanarTriangle(ray:core.Ray, mesh:core.MeshData, faceIndex:number) : core.Interval<core.CurveTriPoint>;
		static mergeTriangleClipIntervals(clip1:core.Interval<core.CurveTriPoint>, clip2:core.Interval<core.CurveTriPoint>, mesh1:core.MeshData, faceIndex1:number, mesh2:core.MeshData, faceIndex2:number) : core.Interval<core.MeshIntersectionPoint>;
		static planes(origin0:verb.core.Data.Point, normal0:verb.core.Data.Vector, origin1:verb.core.Data.Point, normal1:verb.core.Data.Vector) : core.Ray;
		static threePlanes(n0:verb.core.Data.Point, d0:number, n1:verb.core.Data.Point, d1:number, n2:verb.core.Data.Point, d2:number) : verb.core.Data.Point;
		static polylines(polyline0:core.PolylineData, polyline1:core.PolylineData, tol:number) : core.CurveCurveIntersection[];
		static segments(a0:verb.core.Data.Point, a1:verb.core.Data.Point, b0:verb.core.Data.Point, b1:verb.core.Data.Point, tol:number) : core.CurveCurveIntersection;
		static rays(a0:verb.core.Data.Point, a:verb.core.Data.Point, b0:verb.core.Data.Point, b:verb.core.Data.Point) : core.CurveCurveIntersection;
		static segmentWithTriangle(p0:verb.core.Data.Point, p1:verb.core.Data.Point, points:verb.core.Data.Point[], tri:verb.core.Data.Tri) : core.TriSegmentIntersection;
		static segmentAndPlane(p0:verb.core.Data.Point, p1:verb.core.Data.Point, v0:verb.core.Data.Point, n:verb.core.Data.Point) : { p : number; };
	}
	
	export class Make
	{
		static rationalTranslationalSurface(profile:core.NurbsCurveData, rail:core.NurbsCurveData) : core.NurbsSurfaceData;
		static surfaceBoundaryCurves(surface:core.NurbsSurfaceData) : core.NurbsCurveData[];
		static surfaceIsocurve(surface:core.NurbsSurfaceData, u:number, useV?:boolean) : core.NurbsCurveData;
		static loftedSurface(curves:core.NurbsCurveData[], degreeV?:number) : core.NurbsSurfaceData;
		static clonedCurve(curve:core.NurbsCurveData) : core.NurbsCurveData;
		static rationalBezierCurve(controlPoints:verb.core.Data.Point[], weights?:number[]) : core.NurbsCurveData;
		static fourPointSurface(p1:verb.core.Data.Point, p2:verb.core.Data.Point, p3:verb.core.Data.Point, p4:verb.core.Data.Point, degree?:number) : core.NurbsSurfaceData;
		static ellipseArc(center:verb.core.Data.Point, xaxis:verb.core.Data.Point, yaxis:verb.core.Data.Point, startAngle:number, endAngle:number) : core.NurbsCurveData;
		static arc(center:verb.core.Data.Point, xaxis:verb.core.Data.Vector, yaxis:verb.core.Data.Vector, radius:number, startAngle:number, endAngle:number) : core.NurbsCurveData;
		static polyline(pts:verb.core.Data.Point[]) : core.NurbsCurveData;
		static extrudedSurface(axis:verb.core.Data.Point, length:number, profile:core.NurbsCurveData) : core.NurbsSurfaceData;
		static cylindricalSurface(axis:verb.core.Data.Point, xaxis:verb.core.Data.Point, base:verb.core.Data.Point, height:number, radius:number) : core.NurbsSurfaceData;
		static revolvedSurface(profile:core.NurbsCurveData, center:verb.core.Data.Point, axis:verb.core.Data.Point, theta:number) : core.NurbsSurfaceData;
		static sphericalSurface(center:verb.core.Data.Point, axis:verb.core.Data.Point, xaxis:verb.core.Data.Point, radius:number) : core.NurbsSurfaceData;
		static conicalSurface(axis:verb.core.Data.Point, xaxis:verb.core.Data.Point, base:verb.core.Data.Point, height:number, radius:number) : core.NurbsSurfaceData;
		static rationalInterpCurve(points:number[][], degree?:number, homogeneousPoints?:boolean, start_tangent?:verb.core.Data.Point, end_tangent?:verb.core.Data.Point) : core.NurbsCurveData;
	}
	
	export class Modify
	{
		static curveReverse(curve:core.NurbsCurveData) : core.NurbsCurveData;
		static surfaceReverse(surface:core.NurbsSurfaceData, useV?:boolean) : core.NurbsSurfaceData;
		static knotsReverse(knots:verb.core.Data.KnotArray) : verb.core.Data.KnotArray;
		static unifyCurveKnotVectors(curves:core.NurbsCurveData[]) : core.NurbsCurveData[];
		static curveElevateDegree(curve:core.NurbsCurveData, finalDegree:number) : core.NurbsCurveData;
		static rationalSurfaceTransform(surface:core.NurbsSurfaceData, mat:verb.core.Data.Matrix) : core.NurbsSurfaceData;
		static rationalCurveTransform(curve:core.NurbsCurveData, mat:verb.core.Data.Matrix) : core.NurbsCurveData;
		static surfaceKnotRefine(surface:core.NurbsSurfaceData, knotsToInsert:number[], useV:boolean) : core.NurbsSurfaceData;
		static decomposeCurveIntoBeziers(curve:core.NurbsCurveData) : core.NurbsCurveData[];
		static curveKnotRefine(curve:core.NurbsCurveData, knotsToInsert:number[]) : core.NurbsCurveData;
		static curveKnotInsert(curve:core.NurbsCurveData, u:number, r:number) : core.NurbsCurveData;
	}
	
	export class Tess
	{
		static rationalCurveRegularSample(curve:core.NurbsCurveData, numSamples:number, includeU:boolean) : verb.core.Data.Point[];
		static rationalCurveRegularSampleRange(curve:core.NurbsCurveData, start:number, end:number, numSamples:number, includeU:boolean) : verb.core.Data.Point[];
		static rationalCurveAdaptiveSample(curve:core.NurbsCurveData, tol?:number, includeU?:boolean) : verb.core.Data.Point[];
		static rationalCurveAdaptiveSampleRange(curve:core.NurbsCurveData, start:number, end:number, tol:number, includeU:boolean) : verb.core.Data.Point[];
		static rationalSurfaceNaive(surface:core.NurbsSurfaceData, divs_u:number, divs_v:number) : core.MeshData;
		static divideRationalSurfaceAdaptive(surface:core.NurbsSurfaceData, options?:eval.Tess.AdaptiveRefinementOptions) : eval.Tess.AdaptiveRefinementNode[];
		static rationalSurfaceAdaptive(surface:core.NurbsSurfaceData, options?:eval.Tess.AdaptiveRefinementOptions) : core.MeshData;
	}
	
	export class AdaptiveRefinementOptions
	{
		constructor();
		normTol : number;
		minDepth : number;
		maxDepth : number;
		refine : boolean;
		minDivsU : number;
		minDivsV : number;
	}
	
	export class AdaptiveRefinementNode
	{
		constructor(srf:core.NurbsSurfaceData, corners:verb.core.Intersections.SurfacePoint[], neighbors?:eval.Tess.AdaptiveRefinementNode[]);
		neighbors : eval.Tess.AdaptiveRefinementNode[];
		isLeaf() : boolean;
		center() : verb.core.Intersections.SurfacePoint;
		evalCorners() : void;
		evalSrf(u:number, v:number, srfPt?:verb.core.Intersections.SurfacePoint) : verb.core.Intersections.SurfacePoint;
		getEdgeCorners(edgeIndex:number) : verb.core.Intersections.SurfacePoint[];
		getAllCorners(edgeIndex:number) : verb.core.Intersections.SurfacePoint[];
		midpoint(index:number) : verb.core.Intersections.SurfacePoint;
		hasBadNormals() : boolean;
		fixNormals() : void;
		shouldDivide(options:eval.Tess.AdaptiveRefinementOptions, currentDepth:number) : boolean;
		divide(options?:eval.Tess.AdaptiveRefinementOptions) : void;
		triangulate(mesh?:core.MeshData) : core.MeshData;
		triangulateLeaf(mesh:core.MeshData) : core.MeshData;
	}
}

export namespace core
{
	export class BoundingBox
	{
		constructor(pts?:verb.core.Data.Point[]);
		min : verb.core.Data.Point;
		max : verb.core.Data.Point;
		fromPoint(pt:verb.core.Data.Point) : core.BoundingBox;
		add(point:verb.core.Data.Point) : core.BoundingBox;
		addRange(points:verb.core.Data.Point[]) : core.BoundingBox;
		contains(point:verb.core.Data.Point, tol?:number) : boolean;
		intersects(bb:core.BoundingBox, tol?:number) : boolean;
		clear() : core.BoundingBox;
		getLongestAxis() : number;
		getAxisLength(i:number) : number;
		intersect(bb:core.BoundingBox, tol:number) : core.BoundingBox;
		static intervalsOverlap(a1:number, a2:number, b1:number, b2:number, tol?:number) : boolean;
	}
	
	export class Constants
	{
		static TOLERANCE : number;
		static EPSILON : number;
		static VERSION : string;
	}
	
	export class SerializableBase
	{
		serialize() : string;
	}
	
	export class Plane extends core.SerializableBase
	{
		constructor(origin:verb.core.Data.Point, normal:verb.core.Data.Vector);
		normal : verb.core.Data.Vector;
		origin : verb.core.Data.Point;
	}
	
	export class Ray extends core.SerializableBase
	{
		constructor(origin:verb.core.Data.Point, dir:verb.core.Data.Vector);
		dir : verb.core.Data.Vector;
		origin : verb.core.Data.Point;
	}
	
	export class NurbsCurveData extends core.SerializableBase
	{
		constructor(degree:number, knots:number[], controlPoints:verb.core.Data.Point[]);
		degree : number;
		controlPoints : verb.core.Data.Point[];
		knots : number[];
	}
	
	export class NurbsSurfaceData extends core.SerializableBase
	{
		constructor(degreeU:number, degreeV:number, knotsU:verb.core.Data.KnotArray, knotsV:verb.core.Data.KnotArray, controlPoints:verb.core.Data.Point[][]);
		degreeU : number;
		degreeV : number;
		knotsU : verb.core.Data.KnotArray;
		knotsV : verb.core.Data.KnotArray;
		controlPoints : verb.core.Data.Point[][];
	}
	
	export class MeshData extends core.SerializableBase
	{
		constructor(faces:verb.core.Data.Tri[], points:verb.core.Data.Point[], normals:verb.core.Data.Point[], uvs:verb.core.Data.UV[]);
		faces : verb.core.Data.Tri[];
		points : verb.core.Data.Point[];
		normals : verb.core.Data.Point[];
		uvs : verb.core.Data.UV[];
		static empty() : core.MeshData;
	}
	
	export class PolylineData extends core.SerializableBase
	{
		constructor(points:verb.core.Data.Point[], params:number[]);
		points : verb.core.Data.Point[];
		params : number[];
	}
	
	export class VolumeData extends core.SerializableBase
	{
		constructor(degreeU:number, degreeV:number, degreeW:number, knotsU:verb.core.Data.KnotArray, knotsV:verb.core.Data.KnotArray, knotsW:verb.core.Data.KnotArray, controlPoints:verb.core.Data.Point[][][]);
		degreeU : number;
		degreeV : number;
		degreeW : number;
		knotsU : verb.core.Data.KnotArray;
		knotsV : verb.core.Data.KnotArray;
		knotsW : verb.core.Data.KnotArray;
		controlPoints : verb.core.Data.Point[][][];
	}
	
	export class Pair<T1, T2>
	{
		constructor(item1:T1, item2:T2);
		item0 : T1;
		item1 : T2;
	}
	
	export class Interval<T>
	{
		constructor(min:T, max:T);
		min : T;
		max : T;
	}
	
	export class CurveCurveIntersection
	{
		constructor(point0:verb.core.Data.Point, point1:verb.core.Data.Point, u0:number, u1:number);
		point0 : verb.core.Data.Point;
		point1 : verb.core.Data.Point;
		u0 : number;
		u1 : number;
	}
	
	export class CurveSurfaceIntersection
	{
		constructor(u:number, uv:verb.core.Data.UV, curvePoint:verb.core.Data.Point, surfacePoint:verb.core.Data.Point);
		u : number;
		uv : verb.core.Data.UV;
		curvePoint : verb.core.Data.Point;
		surfacePoint : verb.core.Data.Point;
	}
	
	export class MeshIntersectionPoint
	{
		constructor(uv0:verb.core.Data.UV, uv1:verb.core.Data.UV, point:verb.core.Data.Point, faceIndex0:number, faceIndex1:number);
		uv0 : verb.core.Data.UV;
		uv1 : verb.core.Data.UV;
		point : verb.core.Data.Point;
		faceIndex0 : number;
		faceIndex1 : number;
		opp : core.MeshIntersectionPoint;
		adj : core.MeshIntersectionPoint;
		visited : boolean;
	}
	
	export class PolylineMeshIntersection
	{
		constructor(point:verb.core.Data.Point, u:number, uv:verb.core.Data.UV, polylineIndex:number, faceIndex:number);
		point : verb.core.Data.Point;
		u : number;
		uv : verb.core.Data.UV;
		polylineIndex : number;
		faceIndex : number;
	}
	
	export class SurfaceSurfaceIntersectionPoint
	{
		constructor(uv0:verb.core.Data.UV, uv1:verb.core.Data.UV, point:verb.core.Data.Point, dist:number);
		uv0 : verb.core.Data.UV;
		uv1 : verb.core.Data.UV;
		point : verb.core.Data.Point;
		dist : number;
	}
	
	export class TriSegmentIntersection
	{
		constructor(point:verb.core.Data.Point, s:number, t:number, r:number);
		point : verb.core.Data.Point;
		s : number;
		t : number;
		p : number;
	}
	
	export class CurveTriPoint
	{
		constructor(u:number, point:verb.core.Data.Point, uv:verb.core.Data.UV);
		u : number;
		uv : verb.core.Data.UV;
		point : verb.core.Data.Point;
	}
	
	export class CurvePoint
	{
		constructor(u:number, pt:verb.core.Data.Point);
		u : number;
		pt : verb.core.Data.Point;
	}
	
	export class KdTree<T>
	{
		constructor(points:core.KdTree.KdPoint<T>[], distanceFunction:(arg0:verb.core.Data.Point, arg1:verb.core.Data.Point) => number);
		nearest(point:verb.core.Data.Point, maxNodes:number, maxDistance:number) : core.Pair<core.KdTree.KdPoint<T>, number>[];
	}
	
	export class KdPoint<T>
	{
		constructor(point:verb.core.Data.Point, obj:T);
		point : verb.core.Data.Point;
		obj : T;
	}
	
	export class KdNode<T>
	{
		constructor(kdPoint:core.KdTree.KdPoint<T>, dimension:number, parent:core.KdTree.KdNode<T>);
		kdPoint : core.KdTree.KdPoint<T>;
		left : core.KdTree.KdNode<T>;
		right : core.KdTree.KdNode<T>;
		parent : core.KdTree.KdNode<T>;
		dimension : number;
	}
	
	export class Mat
	{
		static mul(a:number, b:verb.core.Data.Matrix) : verb.core.Data.Matrix;
		static mult(x:verb.core.Data.Matrix, y:verb.core.Data.Matrix) : verb.core.Data.Matrix;
		static add(a:verb.core.Data.Matrix, b:verb.core.Data.Matrix) : verb.core.Data.Matrix;
		static div(a:verb.core.Data.Matrix, b:number) : verb.core.Data.Matrix;
		static sub(a:verb.core.Data.Matrix, b:verb.core.Data.Matrix) : verb.core.Data.Matrix;
		static dot(a:verb.core.Data.Matrix, b:verb.core.Data.Vector) : verb.core.Data.Vector;
		static identity(n:number) : verb.core.Data.Matrix;
		static transpose<T>(a:T[][]) : T[][];
		static solve(A:verb.core.Data.Matrix, b:verb.core.Data.Vector) : verb.core.Data.Vector;
	}
	
	export class Mesh
	{
		static getTriangleNorm(points:verb.core.Data.Point[], tri:verb.core.Data.Tri) : verb.core.Data.Point;
		static makeMeshAabb(mesh:core.MeshData, faceIndices:number[]) : core.BoundingBox;
		static sortTrianglesOnLongestAxis(bb:core.BoundingBox, mesh:core.MeshData, faceIndices:number[]) : number[];
		static getTriangleCentroid(points:verb.core.Data.Point[], tri:verb.core.Data.Tri) : verb.core.Data.Point;
		static triangleUVFromPoint(mesh:core.MeshData, faceIndex:number, f:verb.core.Data.Point) : verb.core.Data.UV;
	}
	
	export class Minimizer
	{
		static uncmin(f:(arg:verb.core.Data.Vector) => number, x0:verb.core.Data.Vector, tol?:number, gradient?:(arg:verb.core.Data.Vector) => verb.core.Data.Vector, maxit?:number) : core.Minimizer.MinimizationResult;
	}
	
	export class Deserializer
	{
		static deserialize<T>(s:string) : T;
	}
	
	export class Trig
	{
		static isPointInPlane(pt:verb.core.Data.Point, p:core.Plane, tol:number) : boolean;
		static distToSegment(a:verb.core.Data.Point, b:verb.core.Data.Point, c:verb.core.Data.Point) : number;
		static rayClosestPoint(pt:number[], o:number[], r:number[]) : number[];
		static distToRay(pt:number[], o:number[], r:number[]) : number;
		static threePointsAreFlat(p1:number[], p2:number[], p3:number[], tol:number) : boolean;
		static segmentClosestPoint(pt:verb.core.Data.Point, segpt0:verb.core.Data.Point, segpt1:verb.core.Data.Point, u0:number, u1:number) : { pt : verb.core.Data.Point; u : number; };
	}
	
	export class Vec
	{
		static angleBetween(a:number[], b:number[]) : number;
		static positiveAngleBetween(a:number[], b:number[], n:number[]) : number;
		static signedAngleBetween(a:number[], b:number[], n:number[]) : number;
		static angleBetweenNormalized2d(a:number[], b:number[]) : number;
		static range(max:number) : number[];
		static span(min:number, max:number, step:number) : number[];
		static neg(arr:number[]) : number[];
		static min(arr:number[]) : number;
		static max(arr:number[]) : number;
		static all(arr:boolean[]) : boolean;
		static finite(arr:number[]) : boolean[];
		static onRay(origin:verb.core.Data.Point, dir:verb.core.Data.Vector, u:number) : number[];
		static lerp(i:number, u:number[], v:number[]) : number[];
		static normalized(arr:number[]) : number[];
		static cross(u:number[], v:number[]) : number[];
		static dist(a:number[], b:number[]) : number;
		static distSquared(a:number[], b:number[]) : number;
		static sum(a:Iterable<number>) : number;
		static addAll(a:Iterable<number[]>) : number[];
		static addAllMutate(a:number[][]) : void;
		static addMulMutate(a:number[], s:number, b:number[]) : void;
		static subMulMutate(a:number[], s:number, b:number[]) : void;
		static addMutate(a:number[], b:number[]) : void;
		static subMutate(a:number[], b:number[]) : void;
		static mulMutate(a:number, b:number[]) : void;
		static norm(a:Iterable<number>) : number;
		static normSquared(a:Iterable<number>) : number;
		static rep<T>(num:number, ele:T) : T[];
		static zeros1d(rows:number) : number[];
		static zeros2d(rows:number, cols:number) : number[][];
		static zeros3d(rows:number, cols:number, depth:number) : number[][][];
		static dot(a:number[], b:number[]) : number;
		static add(a:number[], b:number[]) : number[];
		static mul(a:number, b:number[]) : number[];
		static div(a:number[], b:number) : number[];
		static sub(a:number[], b:number[]) : number[];
		static isZero(vec:number[]) : boolean;
		static sortedSetUnion(a:number[], b:number[]) : number[];
		static sortedSetSub(a:number[], b:number[]) : number[];
	}
}