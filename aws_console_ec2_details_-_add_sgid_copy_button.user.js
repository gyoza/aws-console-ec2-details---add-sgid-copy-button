// ==UserScript==
// @name        aws console ec2 details - add sgid copy button on hover
// @include     https://*console.aws.amazon.com/ec2*
// @version     1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.7.1/clipboard.min.js
// @grant       GM_addStyle
// ==/UserScript==

// stolen functions include:
//  - waitforkeyelements:
//  - sauce: https://stackoverflow.com/questions/19238791/how-to-use-waitforkeyelements-to-display-information-after-select-images
//
// i have no idea what im doing with javascript, this is probably really bad.

function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}

new Clipboard('.sgbtn');


function isMatch(v) {
   var exp = new RegExp("(%)"); return exp.test(v);
}

function dostuff () {
    $('a[href*="groupId=sg-"]').hover(function(){
    var regexp = /(sg-[0-9a-f]{8})/g;
    var match = regexp.exec(this);
    var sgid = match[0];
    if(!$(this).hasClass(sgid)) {
       var copybutton = '</a><div class="sgdiv"><button class="sgbtn" data-clipboard-text="'+sgid+'">'+sgid+'</button></div>';
       $( this ).addClass(sgid).after(copybutton);
    }
    });
   }

waitForKeyElements ("div.KG", dostuff);