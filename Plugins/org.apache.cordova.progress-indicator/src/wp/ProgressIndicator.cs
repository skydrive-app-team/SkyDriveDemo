// Copyright (c) Sergey Grebnov.  Licensed under the MIT license. 

using akvelon.cordova.oneDriveDemoApp;
using Microsoft.Phone.Controls;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO.IsolatedStorage;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Windows.Storage;
using WPCordovaClassLib.Cordova.Commands;

namespace WPCordovaClassLib.Cordova.Commands
{
    public class ProgressIndicator : BaseCommand
    {
        private const string GRID_NAME = "LayoutRoot";

        ProgressBar p = new ProgressBar();

        public ProgressIndicator() : base()
        {
            p.IsIndeterminate = true;
            p.Visibility = Visibility.Collapsed;
            PhoneApplicationFrame frame = Application.Current.RootVisual as PhoneApplicationFrame;
            if (frame != null)
            {
                PhoneApplicationPage page = frame.Content as PhoneApplicationPage;
                if (page != null)
                {
                    Grid grid = page.FindName(GRID_NAME) as Grid;
                    grid.Children.Add(p);
                }
            }

        }

        public void show(string options)
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                p.Visibility = Visibility.Visible;
            });
        }

        public void hide(string options)
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
            {
                p.Visibility = Visibility.Collapsed;
            });
        }
    }
}