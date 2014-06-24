(function(window, _, moment, Qty, undefined) {

'use strict';

// SolarSuferPlanner, BlueRobotics

// constructor
function Planner(options) {
    this.options = _.extend({}, _.clone(this.default_options), options);
}

// defaults
Planner.prototype.default_options = {
    debug: true,
    date_start: moment(),
    date_delta: moment.duration(1, 'minute'),
    date_max: moment().add(moment.duration(2, 'hours'))
};

// this is used as the data template during each step
Planner.prototype.data_template = {
    step: 0,
    date: undefined,
};

// this is where the simulation results go
Planner.prototype.data = [];

// log to the logger
Planner.prototype.log = function(data) {
    if(this.options.debug) this.logger(data);
};

// console logger
Planner.prototype.logger = console.log;

// chainable constructor
Planner.prototype.start = function() {
    // clear out the data
    this.data = [];

    // state vars
    var step, previous = {
        step: 0,
        date: this.options.date_start.clone()
    };

    // loop
    this.log('### Starting the sim...');
    while(previous === undefined || previous.date < this.options.date_max) {
        // calculate step
        step = this.calculateStep(previous);

        // save data
        this.data.push(step);
        previous = step;
    }
    this.log('### Sim complete!');
};

// allow another class to inherit from Planner
Planner.prototype.calculateStep = function(previous) {
    this.log('step');

    // create a new step container
    var data = _.clone(this.data_template);

    // build on the previous step
    data.step = previous.step + 1;
    data.date = previous.date.clone().add(this.options.date_delta);

    // do the actual sim logic
    this.calculateSolar(data, previous);
    this.calculateBattery(data, previous);
    this.calculateSea(data, previous);
    this.calculateDrag(data, previous);
    this.calculateThrust(data, previous);
    this.calculateMovement(data, previous);

    // return the result of this step
    return data;
};

// calculate available solar energy based on time of day and day of year
Planner.prototype.calculateSolar = function(data, previous) {
};

// calculate battery state based on previous state and solar state
Planner.prototype.calculateBattery = function(data, previous) {
    data.v_batt = 0;
};

// calculate the sea conditions based on historical record
Planner.prototype.calculateSea = function(data, previous) {
    // calculate a historic or random sea current from the JPL OSCAR database
};

// calculate drag based on sea state
Planner.prototype.calculateDrag = function(data, previous) {
};

// calculate thrust based on available battery power
Planner.prototype.calculateThrust = function(data, previous) {
};

// calculate new position at the end of the step
Planner.prototype.calculateMovement = function(data, previous) {
    // force balance
    // var f = data.thrust - data.drag;

    // simple speed calc for now
    var v = new Qty('4.5 ft/s'); // this is the fasted we could go

};

// export
window.SolarSuferPlanner = Planner;

})(window, window._, window.moment, window.Qty);
