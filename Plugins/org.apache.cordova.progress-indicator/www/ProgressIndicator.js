//
module.exports = {
    show: function (tapDisable,message) {
        cordova.exec(null, null, "ProgressIndicator", "show", [!!tapDisable, message?message:"Waiting"]);
    },

    hide: function () {
        cordova.exec(null, null, "ProgressIndicator", "hide", []);
    }
}
