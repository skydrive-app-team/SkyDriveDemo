//progressIndicator plugin
module.exports = {
    show: function (tapDisable, message, color) {
        cordova.exec(null, null, "ProgressIndicator", "show", [!!tapDisable, message?message:"Waiting", color]);
    },

    hide: function () {
        cordova.exec(null, null, "ProgressIndicator", "hide", []);
    }
}



