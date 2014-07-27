/**
 * jquery.scrollless.animbyscroll
 * Scrolling animation effect for jquery.scrollless
 * 
 * @version  1.0.0
 * @requires jquery.scrollless
 * @author   Savr Goryaev (savreen.com/contact/)
 * @license  GPL v2 http://opensource.org/licenses/GPL-2.0
 */

(function($) {

$.scrollless
.on('preInit', onPreInit).on('postInit', onPostInit);

// Options:
var nDuration = 500;
// Vars:
var oCntr = 0;
var raItems = 0;
var nItems = 0;
var bOn = false;
var iSt = 0;
var iEnd = 0;

function onPreInit(oOpts) {
    if (!this || !oOpts || typeof oOpts != 'object') return;
    if ('animbyscroll' in oOpts && 'nDuration' in oOpts.animbyscroll)
        nDuration = Math.floor(Number(oOpts.animbyscroll.nDuration));
    if (oCntr) return;
    oCntr = this;
    oOpts.fnAnimate = animateStart;
    oOpts.fnAnimateEnd = animateEnd;
}

function onPostInit(aItems) {
    if (!oCntr || !aItems || !aItems.length) return;
    raItems = aItems;
    nItems = aItems.length;
}

function animateStart(obj) {
    if (!oCntr) return;
    var iSt0 = obj.startPrev, iEnd0 = obj.endPrev;
    iSt = obj.start, iEnd = obj.end;
    if (iSt == iSt0) {
        if (iEnd == iEnd0) return;
        iEnd > iEnd0? raItems.slice(iEnd0, iEnd).show() : raItems.slice(iEnd, iEnd0).hide();
        $.scrollless.setPosComplete();
        return;
    }
    bOn = true;
    var hCntr = oCntr.height(), wCntr = oCntr.width(), yCntr = oCntr.offset().top;
    raItems.show();
    oCntr.height(obj.height).width(wCntr);
    var yItem0 = raItems.eq(iSt0).offset().top- yCntr,
        yLast = raItems.eq(nItems-1).offset().top- yCntr,
        yItem = iSt < nItems-1? raItems.eq(iSt).offset().top- yCntr : yLast;
    var hLast = raItems.eq(iSt).outerHeight(), h = yLast + hLast - yItem;
    if (yItem < 0) {
        var y1st = raItems.eq(0).offset().top;
        yItem0 -= y1st;
        yItem -= y1st;
    }
    else if (h < obj.height) {
        var hCut = obj.height - h;
        yItem -= hCut + 1;
    }
    oCntr.scrollTop(Math.floor(yItem0));
    oCntr.animate({scrollTop: Math.floor(yItem)}, nDuration, animateEnd);
}

function animateEnd() {
    if (!bOn) return;
    bOn = false;
    oCntr.stop();
    raItems.hide();
    oCntr.height('auto').width('auto');
    raItems.slice(iSt, iEnd).show();
    $.scrollless.setPosComplete();
}

})(jQuery);
