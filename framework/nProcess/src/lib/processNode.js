module.exports = function(name, processNode) {

    let _name = name;
    let _type = processNode.type || 'function';
    let _process = processNode.process;
    let _success = processNode.success || 'PROCESS.handleSucessEnd';
    let _failure = processNode.failure || 'PROCESS.handleFailureEnd'

    if (!_process) {
        throw new Error("Process property for node : " + _name + " can't be null or blank");
    };

    this.getName = function() {
        return _name;
    };

    this.getType = function() {
        return _type;
    };

    this.getProcess = function() {
        return _process;
    };

    this.getSuccess = function() {
        return _success;
    };

    this.getFailure = function() {
        return _failure;
    };
}