module.exports = {
    show: function (tapDisable) {
        cordova.exec(null, null, "ProgressIndicator", "show", [!!tapDisable]);
    },

    hide: function () {
        cordova.exec(null, null, "ProgressIndicator", "hide", []);
    }
}

