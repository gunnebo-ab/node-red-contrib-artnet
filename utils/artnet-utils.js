const utils = require('./arc-transition-utils');

function ArtnetUtils() {
	this.IS_DEBUG = false;
	this.log = function (v) {
		if (this.IS_DEBUG) {
			console.log.apply(console,arguments);
		}
	}
}

ArtnetUtils.prototype = {
	MIN_CHANNEL_VALUE: 0,
	MAX_CHANNEL_VALUE: 255,
	tracePoint:function (tag,point){
		this.log(tag + " : " + parseFloat(point.x).toFixed(4) + " : " + parseFloat(point.y).toFixed(4) + " : " + parseFloat(point.z).toFixed(4));
	},
	roundChannelValue: function (value) {
		return Math.min(this.MAX_CHANNEL_VALUE, Math.max(this.MIN_CHANNEL_VALUE, Math.round(value)));
	},
	validateChannelValue: function (value) {
		return Math.min(this.MAX_CHANNEL_VALUE, Math.max(this.MIN_CHANNEL_VALUE, value));
	},
	getDegreeToChannelCoefficient: function (maxAngle) {
		return this.MAX_CHANNEL_VALUE / maxAngle;
	},
	getChannelToDegreeCoefficient: function (maxAngle) {
		return maxAngle / this.MAX_CHANNEL_VALUE;
	},
	channelValueToRad: function (v, angle) {
		return utils.degreesToRadian(v * artnetutils.getChannelToDegreeCoefficient(angle));
	},
	radToChannelValue: function (v, angle) {
		return utils.radiansToDegrees(v) * artnetutils.getDegreeToChannelCoefficient(angle);
	}
};

var artnetutils = new ArtnetUtils();
module.exports = artnetutils;

