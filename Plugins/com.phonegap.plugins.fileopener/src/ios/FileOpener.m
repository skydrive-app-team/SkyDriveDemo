#import "FileOpener.h"
#import <Cordova/CDV.h>

#import <QuartzCore/QuartzCore.h>
#import <MobileCoreServices/MobileCoreServices.h>

@implementation FileOpener
@synthesize controller = docController;

- (void) openFile: (CDVInvokedUrlCommand*)command {

    NSString *path = [command.arguments objectAtIndex:0];
    NSURL *fileURL = [NSURL URLWithString:path];
    docController = [UIDocumentInteractionController  interactionControllerWithURL:fileURL];
    docController.delegate = self;
    
    BOOL wasOpened = [docController presentPreviewAnimated:YES ];
    
    CDVPluginResult* pluginResult = nil;

    if(wasOpened) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: @""];
    } else {
        NSDictionary *jsonObj = [ [NSDictionary alloc]
                                 initWithObjectsAndKeys :
                                 @"9", @"status",
                                 @"Could not handle UTI", @"message",
                                 nil
                                 ];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:jsonObj];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (UIViewController *) documentInteractionControllerViewControllerForPreview: (UIDocumentInteractionController *) controller
{
    return [self viewController];
} 


@end
