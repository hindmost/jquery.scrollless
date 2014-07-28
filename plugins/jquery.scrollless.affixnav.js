/**
 * jquery.scrollless.affixnav
 * Contents navigation for jquery.scrollless
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
.on('changeSize', onChangeSize).on('changePos', onChangePos);

// Const:
var sHtmlElps = '<div class="affixnav-elps"><span></span></div>';
var sHtmlSpacer = '<div class="affixnav-spacer"></div>';
var sHtmlListItem = '<li></li>';
var sHtmlNavCnt = 
    sHtmlElps+
    sHtmlSpacer+
    '<ul></ul>'+
    sHtmlSpacer+
    sHtmlElps;
var sHtmlNav = '<td class="affixnav"></td>';
var sHtmlNavWrap = '<table class="affixnav-wrap"><tr><td></td></tr></table>';
// Options:
var sClassHdr = 'affixnav-header';
var sClassHdrLevel = 'level';
// Vars:
var bEnable = false;
var oCntr = 0;
var oNav = 0;
var nItems = 0;
var nHeaders = 0;
var aoHeaders = 0;
var aoElps = 0;
var aItem4Hdr = [];
var aHdr4Item = [];
var aSize = [];
var hMargin = 0;
var hAvail = 0;
var iCurSt = 0;
var iCurEnd = 0;
var bSizing = false;

function onPreInit(oOpts) {
    if (!this || !setOptions(oOpts) ||
        !sClassHdr || !this.find('.'+sClassHdr).length) {
        onDisable(); return;
    }
    bEnable = true;
    if (!oNav) {
        oCntr = this;
        oNav = $(sHtmlNav).html(sHtmlNavCnt);
        this.wrap(sHtmlNavWrap).parent().after(oNav);
    }
    oNav.show();
}

function setOptions(obj) {
    if (!obj || typeof obj != 'object') return false;
    obj.attachItemData = true;
    if (!('affixnav' in obj)) return true;
    if ('disable' in obj.affixnav) return false;
    if ('classHeader' in obj.affixnav)
        sClassHdr = obj.affixnav.classHeader;
    if ('classHeaderLevel' in obj.affixnav)
        sClassHdrLevel = obj.affixnav.classHeaderLevel;
    return true;
}

function onPostInit(aoItems, aHeights) {
    if (!bEnable || !oNav || !aoItems || !aoItems.length) return;
    var sItemClass = 'scrollless-item';
    nItems = aoItems.length;
    aItem4Hdr.length = aHdr4Item.length = 0; aHdr4Item.length = nItems;
    var aTitles = [];
    var aElems = this.find('.'+sClassHdr);
    var aLevels = [];
    nHeaders = aElems.length;
    for (var i = 0; i < nHeaders; i++) {
        var oElem = aElems.eq(i), aObjs;
        var oObj = oElem.hasClass(sItemClass)?
            oElem :
            ((aObjs = oElem.parents('.'+sItemClass)).length ||
                (aObjs = oElem.find('.'+sItemClass)).length?
                aObjs.eq(0) : 0
            );
        if (!oObj) continue;
        for (var j = 0; j < 5 && !oElem.hasClass(sClassHdrLevel+ (j+1)); j++) ;
        var iLvl = j < 5 ? j : 0;
        var iPos = oObj.data('iItem');
        if (aHdr4Item[iPos] == undefined)
            aHdr4Item[iPos] = aItem4Hdr.length;
        aItem4Hdr.push(iPos);
        aLevels.push(iLvl);
        aTitles.push(oElem.text());
    }
    var oHdr = $(sHtmlListItem);
    var oList = oNav.children('ul').eq(0).empty();
    var h0 = 0;
    oNav.children().each(function () {
        h0 += $(this).height();
    });
    var aH = [];
    for (i = 0; i < nHeaders; i++) {
        var oCurr = oHdr.clone().html(aTitles[i])
        .addClass(sClassHdrLevel+(aLevels[i]+1)).data('iHeader', i).appendTo(oList);
        aH[i] = oNav.height() - h0;
        oCurr.hide();
    }
    hMargin = h0+1;
    aSize = aH;
    aoHeaders = oList.children()
    .on('click', onClickHeader);
    if (!aoElps) {
        aoElps = oNav.find('.affixnav-elps > span');
    }
}

function onDisable() {
    if (!bEnable || !oNav) return;
    bEnable = false;
    oNav.hide();
}

function onChangeSize(oSize) {
    if (!bEnable || typeof oSize != 'object') return;
    if (!oSize.sizing) {
        bSizing = false;
        hAvail = oSize.height;
    }
    else if (!bSizing) {
        bSizing = true;
        hidePos();
    }
}


function onChangePos(oPos) {
    if (!bEnable || typeof oPos != 'object') return;
    var iStart = oPos.start, iEnd = oPos.end, i;
    if (aHdr4Item[iStart] != undefined)
        iCurSt = aHdr4Item[iStart];
    else {
        for (i = iStart-1; i >= 0 && aHdr4Item[i] == undefined; i--) ;
        iCurSt = i >= 0? aHdr4Item[i] : 0;
    }
    if (aHdr4Item[iEnd] != undefined)
        iCurEnd = aHdr4Item[iEnd];
    else {
        for (i = iEnd+1; i < nItems && aHdr4Item[i] == undefined; i++) ;
        iCurEnd = i < nItems? aHdr4Item[i] : nHeaders;
    }
    showPos();
}

function showPos() {
    var h = hAvail - hMargin;
    var s = 0, i, j;
    for (i = iCurSt; i < iCurEnd && s + aSize[i] < h; i++) s += aSize[i];
    var b = true;
    for (i = iCurEnd, j = iCurSt - 1; b; ) {
        var b1, b2;
        if (b1 = i < nItems && s + aSize[i] < h) s += aSize[i++];
        if (b2 = j >= 0 && s + aSize[j] < h) s += aSize[j--];
        b = b1 || b2;
    }
    var iHdr1 = j < iCurSt - 1? j+1 : iCurSt, iHdr2 = i;
    aoHeaders.removeClass('affixnav-cursor').slice(iCurSt, iCurEnd).addClass('affixnav-cursor');
    aoHeaders.hide().slice(iHdr1, iHdr2).show();
    showElps(0, iHdr1);
    showElps(1, iHdr2 < nHeaders - 1);
}

function hidePos() {
    aoHeaders.hide();
    showElps(0, 0); showElps(1, 0);
}

function onClickHeader(oEvt) {
    oEvt.preventDefault();
    var iHdr = $(this).data('iHeader');
    var iPos = aItem4Hdr[iHdr];
    $.scrollless.setPos(iPos);
}

function showElps(i, b) {
    aoElps.eq(i).css('visibility', b? 'visible' : 'hidden');
}

})(jQuery);
