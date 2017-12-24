(function test() {
    var obj = { first: 'someVal', second: 'second' };
    console.log(obj[Object.keys(obj)[0]]);
})();