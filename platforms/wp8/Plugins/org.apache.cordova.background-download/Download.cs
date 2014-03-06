using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WPCordovaClassLib.Cordova.Commands
{
    class Download
    {
        public string uriString;
        public string filePath;
        public string callbackId;

        public Download(string uriString, string filePath, string callbackId)
        {
            this.uriString = uriString;
            this.filePath = filePath;
            this.callbackId = callbackId;
        }
    }
}
