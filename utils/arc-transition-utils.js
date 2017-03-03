function Utils() {
}

Math.Cos = function(w){
	return parseFloat(Math.cos(w).toFixed(10));
};

Math.Sin = function(w){
	return parseFloat(Math.sin(w).toFixed(10));
};

Utils.prototype = {
	DEGREE_TO_RAD: Math.PI / 180,
	RAD_TO_DEGREE: 180 / Math.PI,
	OZ: {x: 0, y: 0, z: -1},
	EPSILON: Math.exp(-16),
	degreesToRadian: function (v) {
		return ((v + 360) % 360) * this.DEGREE_TO_RAD;
	},
	radiansToDegrees: function (v) {
		return v * this.RAD_TO_DEGREE;
	},

	//region vector utils
	getVector: function (p1, p2) {
		return {x: (p2.x - p1.x), y: (p2.y - p1.y), z: (p2.z - p1.z)};
	},
	vectorModule: function (v) {
		return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
	},
	vectorScalar: function (v1, v2) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	},
	normalizeVector: function (v) {
		var _vectorModule = this.vectorModule(v);
		return {x: v.x / _vectorModule, y: v.y / _vectorModule, z: v.z / _vectorModule};
	},
	vectorsAngle: function (v1, v2) {
		return Math.acos(this.vectorScalar(v1, v2) / (this.vectorModule(v1) * this.vectorModule(v2)));
	},
	getVectorMultiplication: function (p1p2Vect, p1p3Vect) {
		var i_v = p1p2Vect.y * p1p3Vect.z - p1p2Vect.z * p1p3Vect.y;
		var j_v = -(p1p2Vect.x * p1p3Vect.z - p1p2Vect.z * p1p3Vect.x);
		var k_v = p1p2Vect.x * p1p3Vect.y - p1p2Vect.y * p1p3Vect.x;
		return {x: i_v, y: j_v, z: k_v};
	},
	getNormalVector: function (p1, p2, p3) {
		var p1p2Vect = this.getVector(p1, p2);
		var p1p3Vect = this.getVector(p1, p3);
		return this.getVectorMultiplication(p1p2Vect, p1p3Vect);
	},
	//endregion

	// region spherical to cartesian coordinates
	// phi is in [0,2*pi]
	// theta is in [0,pi]
	toCartesian: function (point) {
		var _point = {};
		var r = 10;
		_point.x = r * Math.Sin(point.theta) * Math.Cos(point.phi);
		_point.y = r * Math.Sin(point.theta) * Math.Sin(point.phi);
		_point.z = r * Math.Cos(point.theta);
		return _point;
	},

	// convert cartesian to spherical coordinates
	toSpherical: function (point) {
		var _point = {};
		_point.r = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
		if (point.x == 0 && point.y == 0) {
			_point.theta = point.z >= 0 ? 0 : Math.PI;
			_point.phi = 0;
		} else {
			_point.theta = Math.acos(point.z / _point.r);
			_point.phi = (Math.atan2(point.y, point.x) + 2 * Math.PI) % (2 * Math.PI);
		}
		return _point;
	},

	movePointInSpherical: function (point, theta) {
		point.theta -= theta;
		if (point.theta < 0) {
			point.theta = -point.theta;
			point.phi += Math.PI;
		}
		return point;
	},
	movePointInCartesian: function (p1, p2, coef) {
		return {x: p1.x + coef * p2.x, y: p1.y + coef * p2.y, z: p1.z + coef * p2.z};
	},

	getDistanceBetweenPointsInSpherical: function (p1, p2) {
		var R = 1;
		var delta_phi = p2.phi - p1.phi;
		var delta_theta = p2.theta - p1.theta;
		var a = Math.Sin(delta_phi / 2) * Math.Sin(delta_phi / 2)
			+ Math.Cos(p1.phi) * Math.Cos(p2.phi)
			* Math.Sin(delta_theta / 2) * Math.Sin(delta_theta / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;

		return d;
	},
	getDistanceBetweenPointsInCartesian: function (point1, point2) {
		var xDelta = point1.x - point2.x;
		var yDelta = point1.y - point2.y;
		var zDelta = point1.z - point2.z;
		return Math.sqrt(xDelta * xDelta + yDelta * yDelta + zDelta * zDelta);
	},
	//endregion

	//region circle main formulas

	// Find center point C0 what is on vector OC and on ABC plane
	// A,B - points on the sphere
	// C - projection of the center point on the sphere
	calcCenterPoint: function (centerOnSphere, p) {
		var moduleSqr = this.vectorScalar(centerOnSphere, centerOnSphere);
		var coef = 1 - (moduleSqr - this.vectorScalar(centerOnSphere, p)) / moduleSqr;
		return {
			x: centerOnSphere.x * coef,
			y: centerOnSphere.y * coef,
			z: centerOnSphere.z * coef
		};
	},

	// spherical coordinates => polar coordinates
	// circle plane is parallel with Oxy plane => z=0; theta = pi/2
	// sin(theta) = sin(pi/2) = 1;
	// cos(theta) = cos(pi/2) = 0;
	// x = r*sin(theta)*cos(phi) = r*cos(phi)
	// y = r*sin(theta)*sin(phi) = r*sin(phi)
	// z = r*cos(theta) = 0;
	getCirclePoint2: function (t, radius) {
		return {x: radius * Math.cos(t), y: radius * Math.sin(t), z: 0};
	},

	/*
	 * Rotate coordinate system by angle
	 * http://math.stackexchange.com/questions/542801/rotate-3d-coordinate-system-such-that-z-axis-is-parallel-to-a-given-vector
	 */
	rotatePoint_xy_quarterion: function (p, normalVector) {
		//TODO check OZ using instead "p" vector. is it correct
		var angle = this.vectorsAngle(this.OZ, normalVector);
		// find case when angle near 0 or PI
		var an = (angle + 2 * Math.PI) % (Math.PI);
		if (an < this.EPSILON || an > Math.PI - this.EPSILON) {
			return p;
		}

		var b = this.getVectorMultiplication(this.OZ, normalVector);
		b = this.normalizeVector(b);

		var q0 = Math.cos(angle / 2);
		var q1 = Math.sin(angle / 2) * b.x;
		var q2 = Math.sin(angle / 2) * b.y;
		var q3 = Math.sin(angle / 2) * b.z;

		var rm = [
			[q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3, 2 * (q1 * q2 - q0 * q3), 2 * (q1 * q3 + q0 * q2)],
			[2 * (q1 * q2 + q0 * q3), q0 * q0 - q1 * q1 + q2 * q2 - q3 * q3, 2 * (q2 * q3 - q0 * q1)],
			[2 * (q1 * q3 - q0 * q2), 2 * (q2 * q3 + q0 * q1), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3]];

		var res = {};
		res.x = p.x * rm[0][0] + p.y * rm[1][0] + p.z * rm[2][0];
		res.y = p.x * rm[0][1] + p.y * rm[1][1] + p.z * rm[2][1];
		res.z = p.x * rm[0][2] + p.y * rm[1][2] + p.z * rm[2][2];

		return res;
	},
	getIterationPoint: function(t, radius, backVector, backMovementPoint){
		var iterationPoint = this.getCirclePoint2(t,radius);
		iterationPoint = this.rotatePoint_xy_quarterion(iterationPoint,backVector);
		iterationPoint = this.movePointInCartesian(iterationPoint, backMovementPoint, 1);
		return this.toSpherical({x:iterationPoint.x,y:iterationPoint.y, z:iterationPoint.z});
	}
//endregion
};

var utils = new Utils();
module.exports = utils;

