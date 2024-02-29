(function() {
    if (window.ksRunnerInit) return;

    // This line gets patched up by the cloud
    var pxtConfig = {
    "relprefix": "/TW-TC20/",
    "verprefix": "",
    "workerjs": "/TW-TC20/worker.js",
    "monacoworkerjs": "/TW-TC20/monacoworker.js",
    "gifworkerjs": "/TW-TC20/gifjs/gif.worker.js",
    "serviceworkerjs": "/TW-TC20/serviceworker.js",
    "typeScriptWorkerJs": "/TW-TC20/tsworker.js",
    "pxtVersion": "9.3.13",
    "pxtRelId": "localDirRelId",
    "pxtCdnUrl": "/TW-TC20/",
    "commitCdnUrl": "/TW-TC20/",
    "blobCdnUrl": "/TW-TC20/",
    "cdnUrl": "/TW-TC20/",
    "targetVersion": "0.0.0",
    "targetRelId": "",
    "targetUrl": "",
    "targetId": "TW",
    "simUrl": "/TW-TC20/simulator.html",
    "simserviceworkerUrl": "/TW-TC20/simulatorserviceworker.js",
    "simworkerconfigUrl": "/TW-TC20/workerConfig.js",
    "partsUrl": "/TW-TC20/siminstructions.html",
    "runUrl": "/TW-TC20/run.html",
    "docsUrl": "/TW-TC20/docs.html",
    "multiUrl": "/TW-TC20/multi.html",
    "asseteditorUrl": "/TW-TC20/asseteditor.html",
    "skillmapUrl": "/TW-TC20/skillmap.html",
    "authcodeUrl": "/TW-TC20/authcode.html",
    "multiplayerUrl": "/TW-TC20/multiplayer.html",
    "kioskUrl": "/TW-TC20/kiosk.html",
    "teachertoolUrl": "/TW-TC20/teachertool.html",
    "isStatic": true
};

    var scripts = [
        "/TW-TC20/highlight.js/highlight.pack.js",
        "/TW-TC20/marked/marked.min.js",
    ]

    if (typeof jQuery == "undefined")
        scripts.unshift("/TW-TC20/jquery.js")
    if (typeof jQuery == "undefined" || !jQuery.prototype.sidebar)
        scripts.push("/TW-TC20/semantic.js")
    if (!window.pxtTargetBundle)
        scripts.push("/TW-TC20/target.js");
    scripts.push("/TW-TC20/pxtembed.js");

    var pxtCallbacks = []

    window.ksRunnerReady = function(f) {
        if (pxtCallbacks == null) f()
        else pxtCallbacks.push(f)
    }

    window.ksRunnerWhenLoaded = function() {
        pxt.docs.requireHighlightJs = function() { return hljs; }
        pxt.setupWebConfig(pxtConfig || window.pxtWebConfig)
        pxt.runner.initCallbacks = pxtCallbacks
        pxtCallbacks.push(function() {
            pxtCallbacks = null
        })
        pxt.runner.init();
    }

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
    })

} ())
