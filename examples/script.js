$(function() {
    var oOpts = {
        itemNestDepth: 6,
        keyctrl: {useWheel: true},
        tapctrl: {ratioTapArea: 0.6}
    };
    var aItems = $('ul.nav > li');
    var oCntr = $('#main');
    var oImg = oCntr.children('img').eq(0).detach();
    var aUrls = [];
    var nUrls = 0;
    var iSample = false;
    var aPos = [];
    var nCalls = 0;
    var bLoading = false;
    var bAlert = false;

    $.scrollless
    .on('changePos', function (oPos) {
        aPos[iSample] = oPos.start;
    })
    .on('disable', function () {
        if (!bAlert) return;
        bAlert = false;
        alert('jquery.scrollless is disabled!');
    });
    
    aItems.children('a').each(function(i){
        $(this).data('index', i);
        aUrls.push($(this).data('url'));
    }).click(function(e) {
        e.preventDefault();
        loadSample($(this).data('index'));
    });
    aPos.length = nUrls = aUrls.length;
    loadSample(0);

    function loadSample(i) {
        if (bLoading || iSample === i || !(i >= 0 && i < nUrls)) return;
        iSample = Number(i);
        if (!aUrls[iSample]) return;
        oCntr.empty().append(oImg.clone());
        bAlert = false;
        if (nCalls++) $.scrollless.disable();
        aItems.removeClass('active');
        bLoading = bAlert = true;
        oOpts.position = aPos[iSample] != undefined? aPos[iSample] : 0;
        $.ajax({
            url: aUrls[iSample],
            dataType: 'html',
            success: function(s) {
                oCntr.html(s)
                .scrollless(oOpts);
            }
        })
        .complete(function() {
            bLoading = false;
            aItems.eq(iSample).addClass('active');
        });
    }

});
