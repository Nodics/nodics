const uuidv5 = require('uuid/v5');

console.log(uuidv5('nodics/profile', uuidv5.URL));
console.log(uuidv5('nodics/profile', uuidv5.URL));
console.log('---------------------------------------------');
console.log(uuidv5('nodics/profile/id/123', uuidv5.URL));
console.log(uuidv5('nodics/profile/id/123', uuidv5.URL));
console.log('---------------------------------------------');