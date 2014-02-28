using System;
using System.Collections.Generic;
using System.IO.IsolatedStorage;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Storage;
using WPCordovaClassLib.Cordova.Commands;

namespace WPCordovaClassLib.Cordova.Commands
{
    public class FileOpening : BaseCommand
    {
        async public void open(string options)
        {
            var optStings = JSON.JsonHelper.Deserialize<string[]>(options);
          
            string openFile = optStings[0].Replace('/', '\\').Substring(2);

            StorageFolder local = Windows.Storage.ApplicationData.Current.LocalFolder;
            StorageFile file = await local.GetFileAsync(openFile);

            if (file != null)
            {
                var success = await Windows.System.Launcher.LaunchFileAsync(file);
                
                if (success)
                {
                    //File launched
                }
                else
                {
                    // File launch failed
                }
            }
            else
            {
                // Could not find file
            }
        }
    }
}
