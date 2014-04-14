cordova.define("org.apache.cordova.progress-indicator.ProgressIndicator", function(require, exports, module) { // forked from https://github.com/markeeftb/FileOpener
    module.exports = {
        show: function (tapDisable) {
            cordova.exec(null, null, "ProgressIndicator", "show", [!!tapDisable]);
        },

        hide: function () {
            cordova.exec(null, null, "ProgressIndicator", "hide", []);
        }
    }
});
