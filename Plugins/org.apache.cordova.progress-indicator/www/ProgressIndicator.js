cordova.define("org.apache.cordova.progress-indicator.ProgressIndicator", function(require, exports, module) { // forked from https://github.com/markeeftb/FileOpener
    module.exports = {
        show: function () {
            cordova.exec(null, null, "ProgressIndicator", "show", []);
        },

        hide: function () {
            cordova.exec(null, null, "ProgressIndicator", "hide", []);
        }
    }
});
