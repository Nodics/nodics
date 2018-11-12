const promiseOne = function () {
  return new Promise((resolve, reject) => {
    resolve({
      success: true,
      name: 'promiseOne'
    });
  });
};

const promiseTwo = function () {
  return new Promise((resolve, reject) => {
    reject({
      success: false,
      name: 'promiseTwo'
    });
  });
};


Promise.all([promiseOne(), promiseTwo()]).then(success => {
  console.log('------------ Success ------------------');
  console.log(success);
}).catch(error => {
  console.log('------------ Error ------------------');
  console.log(error);
}).all(result => {
  console.log('------------ All ------------------');
  console.log(result);
});