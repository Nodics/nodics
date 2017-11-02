module.exports = function() {

    let _testSuites = {};

    this.addSuite = function(suiteName, testSuite) {
        _testSuites[suiteName] = testSuite;
    };
    this.getSuite = function(suiteName) {
        return _testSuites[suiteName];
    };
    this.getAllSuite = function() {
        return _testSuites;
    };
};