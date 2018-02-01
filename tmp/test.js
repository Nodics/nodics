const _ = require('lodash');

let prop = {
    name: "himkar"
};

let prop1 = {
    name: "Dwivedi"
};

let club = _.merge(prop, prop1);

console.log(prop);
console.log(prop1);
console.log(club);