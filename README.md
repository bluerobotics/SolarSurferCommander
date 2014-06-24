# SolarSurferPlanner

Navigation planner for the [SolarSurfer](http://bluerobotics.com/) project.

## Overview

This script is used to estimate the total travel profile of the SolarSurfer. While written in JavaScript, this package isn't normally hosted anywhere, so you'll have to download and run it yourself to see it.

The bulk of the planning calculations takes place in `app/scripts/SolarSurferPlanner.js`. The planner uses these packages:

* [moment.js](http://momentjs.com/) for working with date and time objects
* [js-quantities](http://gentooboontoo.github.io/js-quantities/) for dealing with units
* [Google Maps Geometry Library](https://developers.google.com/maps/documentation/javascript/reference#spherical) for converting between distances and lat, long
* [Highcharts](http://api.highcharts.com/highcharts) for plotting data
* [Lo-Dash](http://lodash.com/) for handy utility functions

## Usage

Clone the repo, install the code, and start the server like this:

```bash
git clone https://github.com/bluerobotics/SolarSurferAPI.git
npm install
npm start
```

The planner should now be available at [http://localhost:4444/](http://localhost:4444/). The planner prints out most of useful information to the JavaScript console, so open that up to interact with the planner.

## Change History

This project uses [semantic versioning](http://semver.org/).

### v0.1.0 - tbd

* Initial release

