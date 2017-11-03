module.exports = {
    loadUtils: function() {
        console.log('=> Staring Utils loader process');
        SYSTEM.loadFiles('/src/utils/utils.js', global.UTILS);
    }
};