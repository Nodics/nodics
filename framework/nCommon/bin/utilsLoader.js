module.exports = {
    loadUtils: function() {
        let utils = global.UTILS = {};
        console.log('=> Staring Utils loader process');
        SYSTEM.loadFiles(CONFIG, '/src/utils/utils.js', utils);
    }
}