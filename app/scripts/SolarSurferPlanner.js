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
    date_start: moment(),
    date_delta: moment.duration(1, 'hour'),
    date_max: moment().add(moment.duration(6, 'months')),
    loc_start: new google.maps.LatLng(33.8823163, -118.4123013),
    loc_end: new google.maps.LatLng(19.1205301, -155.5010251),
    nav_radius: new Qty('1 km'),
    p_thruster: new Qty('60 W'),
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

    // state vars
    this.dt = new Qty(this.config.date_delta.asMilliseconds()+'ms');
    var step, previous = {
        step: 0,
        date: this.config.date_start.clone(),
        loc: this.config.loc_start,
        energy: new Qty('0 J')
    };

    // loop
    this.log('Starting sim...');
    var at_end = false;
    while(!at_end && previous.date < this.config.date_max) {
        // calculate step
        step = this.calculateStep(previous);

        // save data
        this.data.push(step);
        previous = step;

        // see if we reach the end
        var err_end = new Qty(google.maps.geometry.spherical.computeDistanceBetween(
            this.config.loc_end,
            step.loc
        )+'m');
        at_end = err_end.lt(this.config.nav_radius);
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

    // do the actual sim logic
    this.calculateSolar(data, previous);
    this.calculatePowerAvailable(data, previous);
    this.calculateSea(data, previous);
    this.calculateDrag(data, previous);
    this.calculateThrust(data, previous);
    this.calculateThrusterPower(data, previous);
    this.calculateMovement(data, previous);
    this.calculatePowerUsed(data, previous);

    // return the result of this step
    return data;
};

// calculate available solar energy based on time of day and day of year
Planner.prototype.calculateSolar = function(data, previous) {
    // calculate the power output
    // TODO: actually use sun angle at the time of the year
    var sun_factor = (Math.sin((5/6)*(data.date.hours()-7)/Math.PI)*0.9+0.1);
    if ( sun_factor < 0 ) {
    	sun_factor = 0;
    }
    data.p_solar = new Qty(sun_factor*120+'W');
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
        mag: new Qty('0.1 m/s').mul(this.config.sea_mult.scalar),
        dir: new Qty('-130 deg') // to the South
    };
};

// calculate drag based on sea state
Planner.prototype.calculateDrag = function(data, previous) {
};

// calculate thrust based on available battery power
Planner.prototype.calculateThrust = function(data, previous) {
	data.thrust = data.p_solar.div(new Qty('120.0 W')).mul(new Qty('26.7 N')); // Each thruster produces 3 lb at ~60 Watts
};

// calculate thruster power based on solar array charging state and power setting
Planner.prototype.calculateThrusterPower = function(data, previous) {
    if(data.p_solar.lt(this.config.p_thruster)) {
        data.p_thruster = new Qty('0 W');
    }
    else {
        data.p_thruster = this.config.p_thruster;
    }
};

// calculate new position at the end of the step
Planner.prototype.calculateMovement = function(data, previous) {
    // force balance
    // var f = data.thrust - data.drag;

    // simple speed calc if battery power is good
    var v;
    if(data.p_solar.lt(new Qty('20 W'))) {
        // stormy seas?
        if(Math.random() > 0.9) {
            v = {
                mag: data.sea_current.mag.mul(10),
                dir: data.sea_current.dir
            };
        }
        else v = data.sea_current;
    }
    else {
        // For now we'll assume that 4.5 ft/s is our max speed at max power and the speed
        // drops off linearly with power. This isn't really true because drag is proportional
        // to the square of speed and thrust. It'll be close though.
        v = {
            mag: data.p_thruster.div(new Qty('120.0 W')).mul(new Qty('4.5 ft/s')).mul(2), // this is the fastest we could go
            dir: new Qty(google.maps.geometry.spherical.computeHeading(
                previous.loc,
                this.config.loc_end 
            )+'deg')
        };
    }

    // calculate a distance from the speed
    var x = {
        mag: v.mag.mul(this.dt).to('m'),
        dir: v.dir
    };

    // calculate new latlng based on the distance and heading
    data.loc = google.maps.geometry.spherical.computeOffset(
        previous.loc,
        x.mag.to('m').scalar,
        x.dir.to('deg').scalar
    );
    data.dx_home = new Qty(google.maps.geometry.spherical.computeDistanceBetween(
        this.config.loc_start,
        data.loc
    )+'m'); // probably in meters, API docs don't say
};

// calculate power used
Planner.prototype.calculatePowerUsed = function(data, previous) {
    data.energy = previous.energy.add(data.p_solar.mul(this.dt));
};

// export
window.SolarSuferPlanner = Planner;

})(window, window._, window.moment, window.Qty);
