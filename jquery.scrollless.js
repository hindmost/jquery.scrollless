/**
 * jquery.scrollless
 * Total replacement of native scrolling
 * https://github.com/hindmost/jquery.scrollless
 * 
 * @version  1.0.0
 * @requires jQuery
 * @author   Savr Goryaev (savreen.com/contact/)
 * @license  GPL v2 http://opensource.org/licenses/GPL-2.0
 */

(function($) {

// Options:
var iPosInit = 0;
var nMaxDepth = 5;
var hQuota = 0;
var nTimePostpone = 500;
var bAutoRestore = true;
var bAttachData = false;
// Vars:
var aFnPreInit = [];
var aFnPostInit = [];
var aFnDisable = [];
var aFnChangeSize = [];
var aFnChangePos = [];
var aFnQueues = {
    'preInit': aFnPreInit,
    'postInit': aFnPostInit,
    'disable': aFnDisable,
    'changeSize': aFnChangeSize,
    'changePos': aFnChangePos
};
var bEnable = false;
var oCntr = 0;
var aoItems = 0;
var nItems = 0;
var aoNests = 0;
var nNests = 0;
var aNestRange = [];
var aSizeSrc = [];
var aSizeXtra = [];
var aSize = [];
var hMaxItem = 0;
var hCntrXtra = 0;
var wWnd = 0;
var hWnd = 0;
var wWndFxd = 0;
var hWndFxd = 0;
var wWndFxdMin = 0;
var hWndFxdMin = 0;
var iViewStart = 0;
var iViewEnd = 0;
var nIdTimer = 0;
var fnAnimate = 0;
var fnAnimateEnd = 0;

$.scrollless = {
    on: function(sEvent, fnCallback) {
        if (sEvent in aFnQueues) addCallback(aFnQueues[sEvent], fnCallback);
        return this;
    },
    setPos: function(v) {
        if (typeof v == 'object')
            setPos(v.pos, v.left, v.right);
        else if (typeof v == 'number')
            setPos(v);
    },
    setPosComplete: function() {
        setPosComplete();
    },
    disable: function() {
        disable(false);
    }
};

$.fn.scrollless = function(v) {
    if (!((!v || typeof v == 'object') && this && this.length))
        return this;
    if (!oCntr) {
        oCntr = this.eq(0);
        oCntr.css({'overflow': 'hidden'});
        $(window).on('resize', function() {
            onResize();
        });
    }
    if (init(v))
        setPos(iPosInit, null, null, true);
    else
        disable(false);
    return this;
};


function init(oOpts) {
    if (!oCntr) return false;
    bEnable = true;
    fnAnimate = animateByDeft;
    resetPos();
    if (typeof oOpts != 'object') oOpts = {};
    for (var i in aFnPreInit) aFnPreInit[i].call(oCntr, oOpts);
    if (!setOptions(oOpts) || !oCntr.children().length) return false;
    var hDoc = $(document).height();
    recalcWnd();
    wWndFxd = wWnd; hWndFxd = hWnd;
    var hMax = hWnd - hDoc + oCntr.height();
    hMaxItem = hQuota > 0?
        Math.round(hQuota <= 1? hMax*hQuota : Math.min(hQuota, hMax)) : hMax;
    aoItems = $([]); aoNests = $([]);
    try {
        buildItems(oCntr, 0);
    }
    catch (e) {
        return false;
    }
    nItems = aoItems.length;
    nNests = aoNests.length;
    aNestRange.length = 0;
    for (i = 0; i < nNests; i++) {
        aNestRange.push(aoNests.eq(i).data('nestrange'));
        aoNests.eq(i).removeData('nest');
    }
    recalcItems();
    if (bAttachData) {
        aoItems.addClass('scrollless-item');
        for (i = 0; i < nItems; i++)
            aoItems.eq(i).data('iItem', i);
    }
    for (i in aFnPostInit) aFnPostInit[i].call(oCntr, aoItems, aSize.slice());
    callbackOnSize();
    if (bAttachData) {
        aoItems.removeClass('scrollless-item');
        for (i = 0; i < nItems; i++)
            aoItems.eq(i).removeData('iItem');
    }
    return true;
}

function setOptions(obj) {
    if (!obj || typeof obj != 'object') return false;
    if ('position' in obj)
        iPosInit = Math.floor(Number(obj.position));
    if ('itemQuota' in obj && obj.itemQuota >= 0.1)
        hQuota = Number(obj.itemQuota);
    if ('itemNestDepth' in obj)
        nMaxDepth = Math.floor(Number(obj.itemNestDepth));
    if ('autoRestore' in obj)
        bAutoRestore = Boolean(obj.autoRestore);
    if ('attachItemData' in obj)
        bAttachData = Boolean(obj.attachItemData);
    if ('timePostpone' in obj && obj.timePostpone >= 300)
        nTimePostpone = Math.floor(Number(obj.timePostpone));
    if ('fnAnimate' in obj && typeof obj.fnAnimate == 'function')
        fnAnimate = obj.fnAnimate;
    if ('fnAnimateEnd' in obj && typeof obj.fnAnimateEnd == 'function')
        fnAnimateEnd = obj.fnAnimateEnd;
    return true;
}

function addCallback(aQueue, fn) {
    if (typeof fn == 'function') aQueue.push(fn);
}

function buildItems(oElem, nLevel) {
    if (nLevel > nMaxDepth) {
        throw 1; return;
    }
    var aElems = oElem.children(), nElems = aElems.length, i0 = 0;
    if (!nElems) {
        throw 2; return;
    }
    var aTags = ['tbody', 'thead', 'tfoot'];
    for (var i = 0; i < nElems; i++) {
        var oEl = aElems.eq(i);
        var oStyle = oEl.get(0).currentStyle || window.getComputedStyle(oEl.get(0), null);
        if (oStyle.display == 'inline' || oStyle.display == 'table-cell') break;
        var b = $.inArray(oEl.get(0).tagName.toLowerCase(), aTags) >= 0;
        if (!b && oEl.height() < hMaxItem) continue;
        aoItems = aoItems.add(aElems.slice(i0, i));
        i0 = i+1;
        var n = aoItems.length;
        buildItems(oEl, nLevel+1);
        oEl.data('nestrange', [n, aoItems.length]);
        aoNests = aoNests.add(oEl);
    }
    if (i0 < nElems) aoItems = aoItems.add(i0? aElems.slice(i0, nElems) : aElems);
}

function onResize() {
    clearTimer();
    if (!bEnable) {
        if (bAutoRestore && recalcWnd() && wWnd >= wWndFxdMin && hWnd >= hWndFxdMin)
            restore();
        return;
    }
    if (recalcWnd()) {
        callbackOnSize(true);
        reduceView(true);
    }
    nIdTimer= setTimeout(postponeResize, nTimePostpone);
}

function postponeResize() {
    clearTimer();
    if (!bEnable) return;
    recalcWnd();
    if (wWnd != wWndFxd) {
        recalcItems();
        aoItems.slice(iViewStart, iViewEnd).show();
        showNests();
    }
    if (wWnd > wWndFxd || hWnd > hWndFxd) {
        expandView();
    }
    wWndFxd = wWnd; hWndFxd = hWnd;
    if (wWndFxd* hWndFxd < wWndFxdMin* hWndFxdMin) {
        wWndFxdMin = wWndFxd;
        hWndFxdMin = hWndFxd;
    }
    callbackOnSize();
    reduceView();
    callbackOnPos(true);
}

function resetPos() {
    iViewStart = iViewEnd = 0;
}

function setPos(iPos, iLeft, iRight, bReset) {
    iPos = typeof iPos == 'number'? iPos : 0;
    if (!(iPos >= 0 && iPos < nItems) || iViewEnd >= nItems && iPos > iViewStart)
        return;
    var h = hWnd - hCntrXtra;
    var bL = typeof iLeft == 'number' && iLeft >= 0 && iLeft <= iPos,
        bR = typeof iRight == 'number' && iRight > 0 && iRight < nItems;
    iLeft = bL? iLeft : 0;
    iRight = bR? iRight : nItems;
    for (var s = 0, i = iPos; i < iRight && s + aSize[i] < h; i++)
        s += aSize[i];
    var iSt = iPos, iEnd = i;
    if (bR || iEnd == nItems) {
        for (i = iSt - 1; i >= iLeft && s + aSize[i] < h; i--)
            s += aSize[i];
        if (i + 1 < iSt && i + 1 != iViewStart) iSt = i + 1;
    }
    if (bR && iSt == iLeft) {
        for (i = iEnd; i < nItems && s + aSize[i] < h; i++)
            s += aSize[i];
        if (i > iEnd) iEnd = i;
    }
    if (iSt == iEnd) {
        disable(true); return;
    }
    if (iSt == iViewStart && iEnd == iViewEnd) return;
    var iPrevSt = iViewStart, iPrevEnd = iViewEnd;
    iViewStart = iSt; iViewEnd = iEnd;
    callbackOnPos();
    if (bReset) {
        aoItems.hide().slice(iSt, iEnd).show();
        setPosComplete();
        return;
    }
    if (fnAnimateEnd) fnAnimateEnd();
    var o = {
        height: h,
        startPrev: iPrevSt,
        endPrev: iPrevEnd,
        start: iSt,
        end: iEnd
    };
    fnAnimate(o);
}

function setPosComplete() {
    showNests();
    reduceView();
    callbackOnPos();
}

function reduceView(bSizing) {
    if (iViewEnd- iViewStart <= 1) return false;
    var hCut = calcHiddenHeight();
    if (hCut <= 0) return false;
    if (bSizing) recalcVisible();
    for (var s = 0, i = iViewEnd-1; i > iViewStart && (s += aSize[i]) < hCut; i--);
    if (i <= iViewStart) {
        if (!bSizing) disable(true);
        return false;
    }
    aoItems.slice(i, iViewEnd).hide();
    iViewEnd = i;
    showNests();
    if (bSizing || (hCut = calcHiddenHeight()) <= 0) return true;
    disable(true);
    return true;
}

function calcHiddenHeight() {
    return $(document).height() - hWnd;
}

function expandView() {
    if (iViewEnd == nItems) return;
    for (var s = 0, i = iViewStart; i < iViewEnd; i++) s += aSize[i];
    var hCntr = s;
    var hAdd = hWnd - hCntrXtra - hCntr;
    if (hAdd <= 0) return;
    for (s = 0, i = iViewEnd; i < nItems && (s += aSize[i]) < hAdd; i++);
    if (i == iViewEnd) return;
    aoItems.slice(iViewEnd, i).show();
    iViewEnd = i;
    showNests();
    reduceView();
}

function disable(bShow) {
    if (!bEnable) return;
    bEnable = false;
    if (fnAnimateEnd) fnAnimateEnd();
    resetPos();
    if (bShow) {
        if (nItems) aoItems.show();
        if (nNests) aoNests.show();
    }
    if (!aFnDisable.length) return;
    for (var i in aFnDisable) aFnDisable[i]();
}

function restore() {
    if (init())
        setPos(iViewStart, null, null, true);
    else 
        disable(false);
}

function clearTimer() {
    if (nIdTimer) clearTimeout(nIdTimer);
}

var wWndPrev = 0;
var hWndPrev = 0;

function recalcWnd() {
    wWndPrev = wWnd; hWndPrev = hWnd;
    wWnd = $(window).width(); hWnd = $(window).height();
    if (wWnd == wWndPrev && hWnd == hWndPrev) return false;
    return true;
}

function recalcItems() {
    var hDoc0 = $(document).height(), hCntr0 = oCntr.height();
    var oStyle = oCntr.get(0).style;
    oStyle.visibility = 'hidden';
    oStyle.height = hMaxItem; oStyle.width = oCntr.width();
    aoItems.show();
    var hDoc = $(document).height(), hCntr = oCntr.height();
    hCntrXtra = hDoc - hCntr + 1;
    aSize.length = aSizeSrc.length = aSizeXtra.length = 0;
    var aHxtd = [];
    var hC0 = oCntr.height();
    for (var s = 0, i = nItems-1; i >= 0; i--) {
        var h = aoItems.eq(i).height();
        aoItems.eq(i).hide();
        var hC = oCntr.height();
        s += (aHxtd[i] = Math.max(hC0 - hC, 0));
        aSizeXtra[i] = Math.max(aHxtd[i] - h, 0);
        hC0 = hC;
    }
    if (nNests) aoNests.hide();
    oStyle.height = oStyle.width = 'auto';
    oStyle.visibility = 'visible';
    aSizeSrc = aHxtd.slice();
    aSize = aHxtd.slice();
    var hXtra = Math.max(hCntr - s, 0);
}

function recalcVisible() {
    for (var s = 0, i = iViewStart; i < iViewEnd; i++) {
        s += aSize[i] = aoItems.eq(i).height() + aSizeXtra[i];
    }
}

function animateByDeft(obj) {
    if (obj.expand)
        aoItems.slice(iViewEnd, obj.end).show();
    else
        aoItems.hide().slice(obj.start, obj.end).show();
    setPosComplete();
}

function showNests() {
    var aShow = [];
    for (var i= 0; i < nNests; i++) {
        var aRng = aNestRange[i], i1 = aRng[0], i2 = aRng[1];
        (aShow[i] = i1 < iViewEnd && iViewStart < i2)? aoNests.eq(i).show() :
            aoNests.eq(i).hide();
    }
}

function callbackOnSize(bSizing) {
    if (!aFnChangeSize.length) return;
    var o = {
        sizing: Boolean(bSizing),
        height: hWnd - hCntrXtra
    };
    for (var i in aFnChangeSize) aFnChangeSize[i](o);
}

var iViewStartPrev = 0;
var iViewEndPrev = 0;

function callbackOnPos(bResize) {
    if (!aFnChangePos.length) return;
    if (!bResize && iViewStart == iViewStartPrev && iViewEnd == iViewEndPrev) return;
    iViewStartPrev = iViewStart; iViewEndPrev = iViewEnd;
    var o = {
        items: nItems,
        start: iViewStart,
        end: iViewEnd
    };
    for (var i in aFnChangePos) aFnChangePos[i](o);
    if (calcHiddenHeight() > 0)
        disable(true);
}

})(jQuery);
