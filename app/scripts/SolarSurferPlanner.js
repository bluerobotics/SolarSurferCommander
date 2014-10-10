(function(window, _, moment, Qty, undefined) {

'use strict';

// SolarSuferPlanner, BlueRobotics

// constructor
function Planner(config) {
  this.config = _.extend({}, _.clone(this.default_config), config);
}

// defaults
Planner.prototype.default_config = {
  debug: true,
  date_start: moment('2014-10-14 10:00:00.000+07:00'),
  date_delta: moment.duration(1, 'hour'),
  date_max: moment().add(moment.duration(6, 'months')),
  // Monterey route:
  route: [
    [33.963010 , -118.496475],
    [33.788279 , -120.289307],
    [34.270836 , -121.794434],
    [35.728677 , -123.079834],
    [36.562600 , -122.036133],
  ],
  // Hawaii route:
  // loc_start: new google.maps.LatLng(33.8823163, -118.4123013),
  // loc_end: new google.maps.LatLng(19.1205301, -155.5010251),
  nav_radius: new Qty('1 km'),
  p_solar_max: new Qty('74 W'), // September, Marina del Rey
  p_thruster: new Qty('120 W'),
  p_avionics: new Qty('4 W'),
  sea_mult: new Qty('1')
};

// this is used as the data template during each step
Planner.prototype.data_template = {
  step: 0,
  date: undefined,
};

// init instance vars
Planner.prototype.data = [];
Planner.prototype.complete = false;
Planner.prototype.callback = undefined;

// log to the logger
Planner.prototype.log = function(data) {
  if(this.config.debug) this.logger(data);
};

// console logger
Planner.prototype.logger = function(data) {
  console.log(data);
};

// chainable constructor
Planner.prototype.start = function() {
  // clear out the data
  this.data = [];

  // prep GPS coordinates
  if(this.config.route[0].constructor.name == 'Array') {
    for(var i = 0; i < this.config.route.length; i++) {
      this.config.route[i] = new google.maps.LatLng(
        this.config.route[i][0],
        this.config.route[i][1]);
    }
  }

  // state vars
  this.dt = new Qty(this.config.date_delta.asMilliseconds()+'ms');
  var step;
  var previous = {
    step: 0,
    date: this.config.date_start.clone().subtract(this.config.date_delta),
    loc: this.config.route[0],
    route_index: 1, // go to the coordinate after the start
    energy: new Qty('0 J'),
    dx_home: new Qty('0 m')
  };

  // loop
  this.log('Starting sim...');
  var at_end = false;
  while(!at_end && previous.date < this.config.date_max) {
    // calculate step
    step = this.calculateStep(previous);

    // save data
    if(step.route_index >= 0) {
      this.data.push(step);
      previous = step;
    }
    else at_end = true;
  }
  this.log('Sim complete! '+String(this.data.length)+' steps');
  this.complete = true;
  if(this.callback !== undefined) this.callback(this);
};

// allow another class to inherit from Planner
Planner.prototype.calculateStep = function(previous) {

  // create a new step container
  var data = _.clone(this.data_template);

  // build on the previous step
  data.step = previous.step + 1;
  data.date = previous.date.clone().add(this.config.date_delta);
  this.calculateRouteIndex(data, previous);

  // do the actual sim logic
  if(data.route_index >= 0) {
    this.calculateSolar(data, previous);
    this.calculatePowerAvailable(data, previous);
    this.calculateSea(data, previous);
    this.calculateDrag(data, previous);
    // this.calculateThrust(data, previous);
    this.calculateThrusterPower(data, previous);
    this.calculateMovement(data, previous);
    this.calculatePowerUsed(data, previous);
  }

  // return the result of this step
  return data;
};

// calculate available solar energy based on time of day and day of year
Planner.prototype.calculateRouteIndex = function(data, previous) {
  data.route_index = previous.route_index;

  // calculate distance to waypoint
  var waypoint_error = new Qty(google.maps.geometry.spherical.computeDistanceBetween(
    previous.loc,
    this.config.route[data.route_index]
  )+'m');

  // jump to next waypoint
  if(waypoint_error.lt(this.config.nav_radius)) {
    data.route_index = data.route_index + 1;

    // are we at the end?
    if(data.route_index >= this.config.route.length)
      data.route_index = -1;
  }
};

// calculate available solar energy based on time of day and day of year
Planner.prototype.calculateSolar = function(data, previous) {
  // calculate the power output
  // TODO: actually use sun angle at the time of the year
  var h = data.date.hours()+7;
  var sunrise = 7;
  var transit = 11.5;
  var sun_factor;
  if(h < 7 || h > (sunrise + transit)) sun_factor = 0;
  else sun_factor = Math.sin((h - sunrise) / transit * Math.PI);
  // var sun_factor = (Math.sin((5/6)*()/Math.PI)*0.9+0.1);
  // if ( sun_factor < 0 ) {
  //   sun_factor = 0;
  // }
  data.p_solar = this.config.p_solar_max.mul(sun_factor);
  data.v_solar = new Qty(sun_factor*14+'V'); // This is not accurate at all.
};

// calculate battery state based on previous state and solar state
Planner.prototype.calculatePowerAvailable = function(data, previous) {
  data.v_batt = data.v_solar;
};

// calculate the sea conditions based on historical record
Planner.prototype.calculateSea = function(data, previous) {
  // calculate a historic or random sea current from the JPL OSCAR database
  data.sea_current = {
    mag: new Qty('0.05 m/s').mul(this.config.sea_mult.scalar),
    dir: new Qty('-130 deg') // to the South
  };
};

// calculate drag based on sea state
Planner.prototype.calculateDrag = function(data, previous) {
};

// calculate thrust based on available battery power
// Planner.prototype.calculateThrust = function(data, previous) {
// 	data.thrust = data.p_solar.div(new Qty('120.0 W')).mul(new Qty('52 N')); // Each thruster produces 3 lb at ~60 Watts
// };

// calculate thruster power based on solar array charging state and power setting
Planner.prototype.calculateThrusterPower = function(data, previous) {
  var zero = new Qty('0 W');
  data.p_thruster = data.p_solar.sub(this.config.p_avionics); // 5 W avionics
  if(data.p_thruster.gt(this.config.p_thruster)) data.p_thruster = this.config.p_thruster;
  if(data.p_thruster.lt(zero)) data.p_thruster = zero;
};

// calculate new position at the end of the step
Planner.prototype.calculateMovement = function(data, previous) {
  // stormy seas?
  // var v_current;
  // if(Math.random() > 0.9) {
  //   v_current = {
  //     mag: data.sea_current.mag.mul(4),
  //     dir: data.sea_current.dir
  //   };
  // }
  // else v_current = data.sea_current;
  var v_current = data.sea_current;

  // force balance
  // var f = data.thrust - data.drag;

  // For now we'll assume that 1 m/s is our max speed at max power and the speed
  // drops off linearly with power. This isn't really true because drag is proportional
  // to the square of speed and thrust. It'll be close though.
  // Ocean Test No. 3 / Marina del Rey says 0.8 m/s max at 70W
  var v_thrust = {
    mag: data.p_thruster.div(new Qty('70.0 W')).mul(new Qty('0.82 m/s')),
    dir: new Qty(google.maps.geometry.spherical.computeHeading(
      previous.loc,
      this.config.route[data.route_index]
    )+'deg')
  };
  data.v = this.addVectors(v_current, v_thrust);

  // calculate a distance from the speed
  var x = {
    mag: data.v.mag.mul(this.dt).to('m'),
    dir: data.v.dir
  };

  // calculate new latlng based on the distance and heading
  data.loc = google.maps.geometry.spherical.computeOffset(
    previous.loc,
    x.mag.to('m').scalar,
    x.dir.to('deg').scalar
  );
  data.dx_home = previous.dx_home.add(new Qty(google.maps.geometry.spherical.computeDistanceBetween(
    previous.loc,
    data.loc
  )+'m')); // probably in meters, API docs don't say
};

// calculate power used
Planner.prototype.calculatePowerUsed = function(data, previous) {
  data.energy = previous.energy.add(data.p_solar.mul(this.dt));
};

// add two vectors
Planner.prototype.addVectors = function(a, b) {
  // calculate vector components
  // console.log(a.mag.scalar, a.dir.to('rad'), Math.sin(a.dir.to('rad').scalar))
  var ax = a.mag.scalar * Math.sin(a.dir.to('rad').scalar);
  var ay = a.mag.scalar * Math.cos(a.dir.to('rad').scalar);
  var bx = b.mag.to(a.mag.units()).scalar * Math.sin(b.dir.to('rad').scalar);
  var by = b.mag.to(a.mag.units()).scalar * Math.cos(b.dir.to('rad').scalar);

  // add components and calculate resultant
  var cx = ax + bx;
  var cy = ay + by;
  return {
    mag: new Qty(Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2)).toString() + ' ' + a.mag.units()),
    dir: new Qty(Math.atan2(cx, cy).toString() + ' rad')
  };
};

// angle converters
// Planner.prototype.mapAngleToMathAngle = function(a) {
//   return 2 * Math.PI - (.scalar + 270) % 360;
// };
// Planner.prototype.mathAngleToMapAngle = function(a) {
//   return new Qty(5/2 * Math.PI - (a % 2 * Math.PI).toString() + 'rad');
// };

// export
window.SolarSuferPlanner = Planner;

})(window, window._, window.moment, window.Qty);
