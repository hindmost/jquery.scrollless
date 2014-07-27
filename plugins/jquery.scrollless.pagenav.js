/**
 * jquery.scrollless.pagenav
 * Page navigation for jquery.scrollless
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

// Const:
var sHtmlThumb = '<div class="pagenav-thumb"></div>';
var sHtmlNavCnt = '<div>'+
    '<div class="pagenav-cursor">&nbsp;</div>'+
    '<div class="pagenav-arrow pagenav-before-thumb"><span>1</span><span class="arrow-left"></span></div>'+
    '<div class="pagenav-arrow"><span class="arrow-right"></span><span></span></div>'+
    '<div class="pagenav-clear"></div>'+
'</div>';
var sHtmlNav = '<div class="pagenav"></div>';
// Options:
var nThumbs = 3;
var nPageQuota = 2000;
var sPageBrClass = 'pagenav-break';
// Vars:
var bEnable = false;
var oNav = 0;
var aoThumbs = 0;
var aoArrows = 0;
var oCursor = 0;
var nPages = 0;
var aItem4Page = [];
var aPage4Item = [];
var aItemWeight = [];
var aThumbPos = [];
var wThumb = 0;
var iPageOffset = 0;
var iThumbMid = 0;

function onPreInit(oOpts) {
    if (!this || !setOptions(oOpts)) {
        onDisable(); return;
    }
    bEnable = true;
    if (!oNav) {
        oNav = $(sHtmlNav);
        oNav.html(sHtmlNavCnt).insertBefore(this);
    }
    oNav.show();
}

function setOptions(obj) {
    if (!obj || typeof obj != 'object') return false;
    obj.attachItemData = true;
    if (!('pagenav' in obj)) return true;
    if ('disable' in obj.pagenav) return false;
    if ('quota' in obj.pagenav)
        nPageQuota = Math.floor(Number(obj.pagenav.quota));
    if ('nThumbs' in obj.pagenav)
        nThumbs = Math.floor(Number(obj.pagenav.nThumbs));
    if ('classPageBreak' in obj.pagenav)
        sPageBrClass = obj.pagenav.classPageBreak;
    return true;
}

function onPostInit(aItems, aHeights) {
    if (!bEnable || !oNav || !aItems || !aItems.length) return;
    var nItems = aItems.length;
    var sItemClass = 'scrollless-item';
    var aElems = this.find('.'+sPageBrClass), nElems = aElems.length;
    var aItem4Break = [], aBreak4Item = [];
    for (var i = 0; i < nElems; i++) {
        var oElem = aElems.eq(i), aObjs;
        var oObj = oElem.hasClass(sItemClass)?
            oElem :
            ((aObjs = oElem.find('.'+sItemClass)).length? aObjs.eq(0) : 0);
        if (!oObj) continue;
        var iPos = oObj.data('iItem');
        if (!iPos) continue;
        aBreak4Item[iPos] = true;
        aItem4Break.push(iPos);
    }
    var nBreaks = aItem4Break.length;
    aItem4Page.length = aPage4Item.length = aItemWeight.length = aThumbPos.length = 0;
    var s = 0, h = 0;
    var aLen4Item = [], aLen4Page = [];
    for (i = 0; i < nItems; i++) {
        aItemWeight.push(h);
        h += aHeights[i];
        var len = aItems.eq(i).text().length;
        aLen4Item.push(len);
        var b = nBreaks && aBreak4Item[i] != undefined || (s += len) > nPageQuota;
        if (b) {
            aItem4Page.push(i);
            aLen4Page.push(s > nPageQuota? s - len : s);
            s = s > nPageQuota? len : 0;
        }
        aPage4Item[i] = aItem4Page.length;
    }
    aItemWeight.push(h);
    nPages = aItem4Page.push(aItems.length); aItem4Page.unshift(0);
    aPage4Item.push(nPages-1);
    aLen4Page.push(s);
    for (var iPg0 = 0, iPg2 = 0, j = 0; j < nBreaks; j++, iPg0 = iPg2) {
        var i2 = aItem4Break[j];
        iPg2 = aPage4Item[i2];
        if (iPg2 - iPg0 < 2) continue;
        iPg0 = iPg2-2;
        var iPg1 = iPg2-1, len1 = aLen4Page[iPg1], len0 = aLen4Page[iPg0];
        if (len0 <= len1) continue;
        var lenAvg = Math.floor((len0 + len1)/2), diff = lenAvg - len1,
            i1 = aItem4Page[iPg1], i0 = aItem4Page[iPg0];
        for (s = 0, i = i1-1; i >= i0 && s + aLen4Item[i] < diff; i--) {
            var l = aLen4Item[i]; s += l;
            aPage4Item[i] = iPg1; aLen4Page[iPg1] += l; aLen4Page[iPg0] -= l;
        }
        if (i < i1-1) aItem4Page[iPg1] = i+1;
    }
    if (nThumbs % 2 == 0) nThumbs++;
    nThumbs = Math.max(Math.min(nThumbs, nPages), 1);
    iThumbMid = nThumbs < nPages? Math.floor(nThumbs/2) : nPages;
    oNav.find('.pagenav-thumb').remove();
    var oThumb = $(sHtmlThumb);
    var oBefore = oNav.find('.pagenav-before-thumb');
    for (i = 0; i < nThumbs; i++) {
        oThumb.clone().html(nThumbs-i).insertAfter(oBefore);
    }
    aoThumbs = oNav.find('.pagenav-thumb')
    .on('click', onClickThumb);
    wThumb = aoThumbs.eq(0).width();
    for (i = 0; i< nThumbs; i++) {
        aThumbPos[i] = aoThumbs.eq(i).data('iThumb', i).position().left;
    }
    oCursor = oNav.find('.pagenav-cursor').eq(0);
    if (!aoArrows) {
        aoArrows = oNav.find('.pagenav-arrow')
        .on('click', onClickArrow);
        aoArrows.eq(0).data('arrowtype', 0);
        aoArrows.eq(1).data('arrowtype', 1);
    }
    aoArrows.eq(1).children().eq(1).html(nPages);
}

function onDisable() {
    if (!bEnable || !oNav) return;
    bEnable = false;
    oNav.hide();
}

function onChangePos(oPos) {
    if (!bEnable || typeof oPos != 'object') return;
    var iStart = oPos.start, iEnd = oPos.end;
    var iPg = aPage4Item[iStart], iPg2 = aPage4Item[iEnd];
    var iStPg = aItem4Page[iPg], iStPg2 = aItem4Page[iPg2];
    var iEndPg = aItem4Page[iPg+1], iEndPg2 = aItem4Page[iPg2+1];
    var iTh = iPg < iThumbMid? iPg
        : (iPg >= nPages - iThumbMid? iThumbMid + nPages - iPg : iThumbMid);
    var iTh2 = Math.min(iTh + iPg2 - iPg, nThumbs-1);
    iPageOffset = iPg - iTh;
    var hSt = aItemWeight[iStart], hEnd = aItemWeight[iEnd];
    var hPgSt = aItemWeight[iStPg], hPgEnd = aItemWeight[iEndPg];
    var hPg2St = aItemWeight[iStPg2], hPg2End = aItemWeight[iEndPg2];
    var dx1 = Math.round(wThumb * (hSt- hPgSt) / (hPgEnd- hPgSt));
    var dx2 = Math.round(wThumb * (hEnd- hPg2St) / (hPg2End- hPg2St));
    var x1 = aThumbPos[iTh] + dx1;
    var x2 = aThumbPos[iTh2] + (iTh + iPg2 - iPg < nThumbs? dx2 : wThumb);
    var w = x2 - x1;
    oCursor.css('left', x1);
    oCursor.css('width', w);
    showArrow(0, iPageOffset);
    showArrow(1, iPageOffset+nThumbs < nPages);
    for (var i = 0; i< nThumbs; i++) {
        aoThumbs.eq(i).html(iPageOffset+i+1);
    }
}

function onClickThumb(oEvt) {
    oEvt.preventDefault();
    var iThumb = Number($(this).data('iThumb'));
    if (isNaN(iThumb)) return;
    var xNav = oNav.offset().left;
    var xCur = oEvt.pageX - xNav - aThumbPos[iThumb];
    var iPg = iPageOffset+ iThumb;
    var iLeft = aItem4Page[iPg], iRight = aItem4Page[iPg+1];
    var hLeft = aItemWeight[iLeft], hRight = aItemWeight[iRight];
    var hCur = hLeft + Math.round(xCur / wThumb * (hRight - hLeft));
    for (var i = iRight - 1; i >= 0 && aItemWeight[i] >= hCur; i--) ;
    var iPos = i;
    $.scrollless.setPos({pos:iPos, left:iLeft, right:iRight});
}

function onClickArrow(oEvt) {
    oEvt.preventDefault();
    var bRight = Boolean($(this).data('arrowtype'));
    $.scrollless.setPos(aItem4Page[bRight? nPages-1 : 0]);
}

function showArrow(i, b) {
    aoArrows.eq(i).css('visibility', b? 'visible' : 'hidden');
}

})(jQuery);
