/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

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