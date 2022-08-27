//var val = Math.floor(1000 + Math.random() * 9000);

//var val=Math.floor(x + (y - x) * Math.random());
function isBlank(value) {
    return !value || !Object.keys(value).length;
}
var val = {
    do: 'home'
}
console.log(isBlank(''));
console.log(isBlank({}));
console.log(isBlank('hi'));
console.log(isBlank(val));
console.log(isBlank(val.do));
console.log(isBlank(val.fo));