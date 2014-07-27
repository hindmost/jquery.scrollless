/**
 * jquery.scrollless.tapctrl
 * e-book readers' tap control emulation for jquery.scrollless
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
var fTapArea = 0.3;
// Vars:
var bEnable = false;
var oCntr = 0;
var xCntr = 0;
var yCntr = 0;
var nItems = 0;
var iStart = 0;
var iEnd = 0;

function onPreInit(oOpts) {
    if (!this || !setOptions(oOpts))
        onDisable();
    else {
        bEnable = true; oCntr = this;
    }
}

function setOptions(obj) {
    if (!obj || typeof obj != 'object') return false;
    if (!('tapctrl' in obj)) return true;
    if ('disable' in obj.tapctrl) return false;
    if ('ratioTapArea' in obj && obj.ratioTapArea >= 0.1 && obj.ratioTapArea < 1)
        fTapArea = Number(obj.ratioTapArea);
    return true;
}

function onPostInit(aItems, aHeights) {
    if (!bEnable || !aItems || !aItems.length) return;
    nItems = aItems.length;
    var o = oCntr.offset();
    xCntr = o.left; yCntr = o.top;
    oCntr.on('click', onClick);
}

function onDisable() {
    if (!bEnable || !nItems) return;
    bEnable = false;
    oCntr.off('click', onClick);
}

function onChangePos(oPos) {
    iStart = oPos.start;
    iEnd = oPos.end;
}

function onClick(oEvt) {
    deltaPos(parsePos(oEvt.pageX, oEvt.pageY));
}

function parsePos(x, y) {
    var wh = Math.floor(oCntr.width()/2), xc = xCntr + wh;
    return 1 - Math.abs(x - xc) / wh <= fTapArea? (x > xc? 1 : -1) : false;
}

function deltaPos(i) {
    if (!i) return;
    var bFwd = i > 0;
    if (!bFwd && iStart <= 0 || bFwd && iEnd >= nItems) return;
    if (bFwd)
        $.scrollless.setPos(iEnd);
    else 
        $.scrollless.setPos({pos:iStart, right:iStart});
}

})(jQuery);
