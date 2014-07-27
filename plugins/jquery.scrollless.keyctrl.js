/**
 * jquery.scrollless.keyctrl
 * Keyboard control for jquery.scrollless
 * 
 * @version  1.0.0
 * @requires jquery.scrollless
 * @author   Savr Goryaev (savreen.com/contact/)
 * @license  GPL v2 http://opensource.org/licenses/GPL-2.0
 */

(function($) {

$.scrollless
.on('preInit', onPreInit).on('postInit', onPostInit)
.on('disable', onDisable)
.on('changePos', onChangePos);

// Options:
var bUseWheel = false;
// Vars:
var bEnable = false;
var bEvents = false;
var sWheelEvt = '';
var nItems = 0;
var iStart = 0;
var iEnd = 0;
var bShift = false;

function onPreInit(oOpts) {
    if (!this || !setOptions(oOpts))
        onDisable();
    else
        bEnable = true;
}

function setOptions(obj) {
    if (!obj || typeof obj != 'object') return false;
    if (!('keyctrl' in obj)) return true;
    if ('disable' in obj.keyctrl) return false;
    if ('useWheel' in obj.keyctrl)
        bUseWheel = Boolean(obj.keyctrl.useWheel);
    return true;
}

function onPostInit(aItems, aHeights) {
    if (!bEnable || !aItems || !aItems.length) return;
    nItems = aItems.length;
    if (bEvents) return;
    bEvents = true;
    $(document).on({'keydown': onKeyDown, 'keyup': onKeyUp});
    if (!bUseWheel) return;
    if (document.addEventListener) {
        if ('onwheel' in document)
            document.addEventListener(sWheelEvt = 'wheel', onWheel, false);
        else if ('onmousewheel' in document)
            document.addEventListener(sWheelEvt = 'mousewheel', onWheel, false);
        else
            document.addEventListener(sWheelEvt = 'DOMMouseScroll', onWheel, false);
    }
    else if ('onmousewheel' in document)
        document.attachEvent(sWheelEvt = 'onmousewheel', onWheel);
}

function onDisable() {
    if (!bEnable || !nItems) return;
    bEnable = bEvents = false;
    $(document).off({'keydown': onKeyDown, 'keyup': onKeyUp});
    if (!bUseWheel || !sWheelEvt) return;
    if (sWheelEvt.substr(0, 2) == 'on')
        document.detachEvent(sWheelEvt, onWheel);
    else
        document.removeEventListener(sWheelEvt, onWheel, false);
}

function onChangePos(oPos) {
    iStart = oPos.start;
    iEnd = oPos.end;
}

function onKeyDown(oEvt) {
    parseKeyCode(oEvt, false);
}

function onKeyUp(oEvt) {
    deltaPos(parseKeyCode(oEvt, true));
}

function onWheel(oEvt) {
    oEvt.preventDefault();
    if (!oEvt) oEvt = window.event;
    var i = oEvt.deltaY? (oEvt.deltaY > 0? 1 : -1) :
        oEvt.wheelDelta? (oEvt.wheelDelta > 0? -1 : 1) : (oEvt.detail > 0? 1 : -1);
    deltaPos(bShift? i*2 : i);
}

function parseKeyCode(oEvt, bUp) {
    var code = oEvt.which;
    var i = 0;
    switch (code) {
        case 38: i = -1; break;
        case 40: i = 1; break;
        case 33: i = -2; break;
        case 34: i = 2; break;
        case 16: bShift = !bUp; break;
        default: return 0;
    }
    return i;
}

function deltaPos(i) {
    if (!i) return;
    var bFwd = i > 0;
    if (!bFwd && iStart <= 0 || bFwd && iEnd >= nItems) return;
    if (Math.abs(i) == 1)
        $.scrollless.setPos(iStart + i);
    else if (bFwd)
        $.scrollless.setPos(iEnd);
    else 
        $.scrollless.setPos({pos:iStart, right:iStart});
}

})(jQuery);
