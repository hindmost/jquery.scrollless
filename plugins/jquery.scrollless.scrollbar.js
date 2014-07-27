/**
 * jquery.scrollless.scrollbar
 * Custom vertical scrollbar for jquery.scrollless
 * 
 * @version  1.0.0
 * @requires jquery.scrollless
 * @requires jquery.scrollless.affixnav
 * @author   Savr Goryaev (savreen.com/contact/)
 * @license  GPL v2 http://opensource.org/licenses/GPL-2.0
 */

(function($) {

$.scrollless
.on('preInit', onPreInit).on('postInit', onPostInit)
.on('disable', onDisable)
.on('changeSize', onChangeSize).on('changePos', onChangePos);

// Const:
var sHtmlBtnUp = '<div class="btn-icon btn-icon-up"></div>';
var sHtmlBtnDn = '<div class="btn-icon btn-icon-dn"></div>';
var sHtmlSpacer = '<div class="scrollbar-spacer"></div>';
var sHtmlNavCnt = 
    '<div class="scrollbar-btn btn-up">'+ sHtmlBtnUp+ sHtmlBtnUp+ '</div>'+
    sHtmlSpacer+
    '<div class="scrollbar">'+
    '<div class="scrollbar-track">&nbsp;</div>'+
    '<div class="scrollbar-thumb"></div>'+
    '</div>'+
    sHtmlSpacer+
    '<div class="scrollbar-btn btn-dn">'+ sHtmlBtnDn+ sHtmlBtnDn+ '</div>';
var sHtmlNav = '<td class="affixscrollbar"></td>';
// Options:
var hMargin = 4;
// Vars:
var bEnable = false;
var oCntr = 0;
var oNav = 0;
var oBar = 0;
var oThumb = 0;
var aoBtns = 0;
var nItems = 0;
var aRelPos = [];
var hBar = 0;
var hBarXtra = 0;
var iStart = 0;
var iEnd = 0;
var bSizing = false;

function onPreInit(oOpts) {
    if (!this || !setOptions(oOpts)) {
        onDisable(); return;
    }
    bEnable = true;
    if (!oNav) {
        oCntr = this;
        var oPlc = $('.affixnav');
        if (!oPlc.length) return;
        oNav = $(sHtmlNav).html(sHtmlNavCnt);
        oPlc.eq(0).before(oNav);
        oBar = oNav.children('.scrollbar');
        oThumb = oBar.children('.scrollbar-thumb');
    }
    oNav.show();
    resetBar();
}

function setOptions(obj) {
    if (!obj || typeof obj != 'object') return false;
    if (!('scrollbar' in obj)) return true;
    if ('disable' in obj.scrollbar) return false;
    if ('margin' in obj.scrollbar)
        hMargin = Math.floor(Number(obj.scrollbar.margin));
    return true;
}

function onPostInit(aoItems, aHeights) {
    if (!bEnable || !oBar || !aoItems || !aoItems.length) return;
    oBar.height(0);
    var h0 = 0;
    oNav.children().each(function () {
        h0 += $(this).height();
    });
    hBarXtra = h0;
    nItems = aoItems.length;
    aRelPos.length = 0;
    var aH = [], h = 0;
    for (var i = 0; i < nItems; i++) {
        aH.push(h);
        h += aHeights[i];
    }
    aH.push(h);
    for (i = 0; i <= nItems; i++) {
        aRelPos.push(aH[i] / h);
    }
    if (aoBtns)  return;
    aoBtns = oNav.children('.scrollbar-btn').on('click', onClickBtn);
    oNav.find('.scrollbar-track').on('click', onClickTrack);
}

function onDisable() {
    if (!bEnable || !oBar) return;
    bEnable = false;
    oNav.hide();
}

function onChangeSize(oSize) {
    if (!bEnable || typeof oSize != 'object') return;
    if (!oSize.sizing) {
        bSizing = false;
        hBar = oSize.height - hMargin - hBarXtra;
        updateBar();
    }
    else if (!bSizing) {
        bSizing = true;
        resetBar();
    }
}

function onChangePos(oPos) {
    if (!bEnable || typeof oPos != 'object') return;
    iStart = oPos.start; iEnd = oPos.end;
    updateThumb();
}

function onClickBtn(oEvt) {
    if (!bEnable) return;
    oEvt.preventDefault();
    var bUp = $(this).hasClass('btn-up');
    if (bUp? iStart < 2 : iEnd >= nItems-2) return;
    $.scrollless.setPos(bUp? 0 : nItems-1);
}

function onClickTrack(oEvt) {
    if (!bEnable) return;
    oEvt.preventDefault();
    var yOrg = oBar.offset().top;
    var yCur = oEvt.pageY - yOrg;
    var yTh = oThumb.offset().top - yOrg;
    if (yCur > yTh)
        $.scrollless.setPos(iEnd);
    else
        $.scrollless.setPos({pos:iStart, right:iStart});
}

function resetBar() {
    if (!oBar) return;
    hBar = 0;
    oBar.hide();
    oNav.css('visibility', 'hidden');
}

function updateBar() {
    if (!oBar) return;
    oBar.height(hBar).show();
    oThumb.css('top', 0).height(0);
    oNav.css('visibility', 'visible');
}

function updateThumb() {
    if (!oThumb) return;
    var yRelSt = aRelPos[iStart], yRelEnd = aRelPos[iEnd];
    var ySt = Math.round(hBar * yRelSt), yEnd = Math.round(hBar * yRelEnd);
    var h = yEnd- ySt > 4? yEnd- ySt : 4;
    if (ySt + h > hBar) ySt = hBar- h-1;
    oThumb.css('top', ySt).height(h);
}

})(jQuery);
