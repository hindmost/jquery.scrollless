/**
 * jquery.scrollless
 * Total replacement of native scrolling
 * https://github.com/hindmost/jquery.scrollless
 * 
 * @version  0.9.0
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
var aSizeFlag = [];
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

$.scrollless = {
    on: function(sEvent, fnCallback) {
        if (sEvent in aFnQueues) addCallback(aFnQueues[sEvent], fnCallback);
        return this;
    },
    setPos: function(v) {
        if (typeof v == 'object')
            setViewPos(v.pos, v.left, v.right);
        else if (typeof v == 'number')
            setViewPos(v);
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
        $(window).on('resize', function() {
            onResize();
        });
    }
    if (init(v))
        setViewPos(iPosInit);
    else
        disable(false);
    return this;
};


function init(oOpts) {
    if (!oCntr) return false;
    bEnable = true;
    resetViewPos();
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
    callbackOnSize(true);
    for (i in aFnPostInit) aFnPostInit[i].call(oCntr, aoItems, aSize.slice());
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
        callbackOnSize(false);
        reduceView(true);
    }
    nIdTimer= setTimeout(postponeResize, nTimePostpone);
}

function postponeResize() {
    clearTimer();
    if (!bEnable) return;
    recalcWnd();
    if (Math.abs(wWnd/wWndFxd-1) > 0.1) {
        recalcItems();
        aoItems.slice(iViewStart, iViewEnd).show();
        showNests();
    }
    else if (wWnd != wWndFxd) {
        recalcVisible();
        recalcHidden();
    }
    if (wWnd > wWndFxd || hWnd > hWndFxd)  {
        expandView();
    }
    wWndFxd = wWnd; hWndFxd = hWnd;
    if (wWndFxd* hWndFxd < wWndFxdMin* hWndFxdMin) {
        wWndFxdMin = wWndFxd;
        hWndFxdMin = hWndFxd;
    }
    callbackOnSize(true);
    callbackOnPos();
}

function resetViewPos() {
    iViewStart = iViewEnd = 0;
}

function setViewPos(iPos, iLeft, iRight) {
    iPos = typeof iPos == 'number'? iPos : 0;
    if (!(iPos >= 0 && iPos < nItems) || iViewEnd >= nItems && iPos > iViewStart)
        return;
    var iPrev1 = iViewStart, iPrev2 = iViewEnd;
    var h = hWnd - hCntrXtra;
    var bL = typeof iLeft == 'number' && iLeft >= 0 && iLeft <= iPos,
        bR = typeof iRight == 'number' && iRight > 0 && iRight < nItems;
    iLeft = bL? iLeft : 0;
    iRight = bR? iRight : nItems;
    for (var s = 0, i = iPos; i < iRight && s + aSize[i] < h; i++)
        s += aSize[i];
    iViewEnd = i;
    iViewStart = iPos;
    if (bR || iViewEnd == nItems) {
        for (i = iViewStart - 1; i >= iLeft && s + aSize[i] < h; i--)
            s += aSize[i];
        if (i < iViewStart - 1) iViewStart = i + 1;
    }
    if (bR && iViewStart == iLeft) {
        for (i = iViewEnd; i < nItems && s + aSize[i] < h; i++)
            s += aSize[i];
        if (i > iViewEnd) iViewEnd = i;
    }
    if (iViewStart == iViewEnd) {
        disable(true); return;
    }
    if (iViewStart == iPrev1 && iViewEnd == iPrev2) return;
    aoItems.hide().slice(iViewStart, iViewEnd).show();
    showNests();
    if (!reduceView()) flagItems();
    callbackOnPos();
}

function reduceView(bRecalc) {
    if (iViewEnd- iViewStart <= 1) return false;
    var hCut = $(document).height() - hWnd;
    if (hCut <= 0) return false;
    if (bRecalc) recalcVisible();
    for (var s = 0, i = iViewEnd-1; i > iViewStart && (s += aSize[i]) < hCut; i--);
    if (i <= iViewStart) {
        disable(true); return false;
    }
    aoItems.slice(i, iViewEnd).hide();
    iViewEnd = i;
    showNests();
    flagItems();
    return true;
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
    if (!reduceView()) flagItems();
}

function disable(bShow) {
    if (!bEnable) return;
    bEnable = false;
    resetViewPos();
    if (bShow) {
        if (nItems) aoItems.show();
        if (nNests) aoNests.show();
    }
    if (!aFnDisable.length) return;
    for (var i in aFnDisable) aFnDisable[i].call(null);
}

function restore() {
    if (init())
        setViewPos(iViewStart);
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
    oStyle.overflow = 'hidden';
    oStyle.visibility = 'hidden';
    oStyle.height = hMaxItem; oStyle.width = oCntr.width();
    aoItems.show();
    var hDoc = $(document).height(), hCntr = oCntr.height();
    hCntrXtra = hDoc - hCntr;
    aSize.length = aSizeSrc.length = aSizeXtra.length = aSizeFlag.length = 0;
    var aHxtd = [];
    var hC0 = oCntr.height();
    for (var s = 0, i = nItems-1; i >= 0; i--) {
        var h = aoItems.eq(i).height();
        aoItems.eq(i).hide();
        var hC = oCntr.height();
        s += (aHxtd[i] = Math.max(hC0 - hC, 0));
        aSizeXtra[i] = Math.max(aHxtd[i] - h, 0);
        aSizeFlag[i] = 0;
        hC0 = hC;
    }
    if (nNests) aoNests.hide();
    oStyle.height = oStyle.width = 'auto';
    oStyle.overflow = 'visible';
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

function recalcHidden() {
    for (var s = 0, i= iViewStart; i < iViewEnd; i++) {
        s += aSize[i] / aSizeSrc[i];
    }
    var ratio = s / (iViewEnd - iViewStart);
    var bEx = ratio > 1;
    for (i= 0; i < nItems; i++) {
        if (i >= iViewStart && i < iViewEnd || aSizeFlag[i]) continue;
        aSize[i] = bEx? Math.round(aSizeSrc[i] * ratio) : aSizeSrc[i];
    }
}

function flagItems() {
    for (var i= iViewStart; i < iViewEnd; i++) {
        aSizeFlag[i] = 1;
    }
}

function showNests() {
    var aShow = [];
    for (var i= 0; i < nNests; i++) {
        var aRng = aNestRange[i], i1 = aRng[0], i2 = aRng[1];
        (aShow[i] = i1 < iViewEnd && iViewStart < i2)? aoNests.eq(i).show() :
            aoNests.eq(i).hide();
    }
}

function callbackOnSize(bFixed) {
    if (!aFnChangeSize.length) return;
    var o = {
        fixed: bFixed,
        height: hWnd - hCntrXtra
    };
    for (var i in aFnChangeSize) aFnChangeSize[i].call(null, o);
}

var iViewStartPrev = 0;
var iViewEndPrev = 0;

function callbackOnPos() {
    if (!aFnChangePos.length) return;
    if (iViewStart == iViewStartPrev && iViewEnd == iViewEndPrev) return;
    iViewStartPrev = iViewStart; iViewEndPrev = iViewEnd;
    var o = {
        items: nItems,
        start: iViewStart,
        end: iViewEnd
    };
    for (var i in aFnChangePos) aFnChangePos[i].call(null, o);
}

})(jQuery);
