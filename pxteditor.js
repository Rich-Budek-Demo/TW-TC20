var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        let SimState;
        (function (SimState) {
            SimState[SimState["Stopped"] = 0] = "Stopped";
            // waiting to be started
            SimState[SimState["Pending"] = 1] = "Pending";
            SimState[SimState["Starting"] = 2] = "Starting";
            SimState[SimState["Running"] = 3] = "Running";
        })(SimState = editor.SimState || (editor.SimState = {}));
        function isBlocks(f) {
            return pxt.U.endsWith(f.name, ".blocks");
        }
        editor.isBlocks = isBlocks;
        let ErrorListState;
        (function (ErrorListState) {
            ErrorListState["HeaderOnly"] = "errorListHeader";
            ErrorListState["Expanded"] = "errorListExpanded";
        })(ErrorListState = editor.ErrorListState || (editor.ErrorListState = {}));
        let MuteState;
        (function (MuteState) {
            MuteState["Muted"] = "muted";
            MuteState["Unmuted"] = "unmuted";
            MuteState["Disabled"] = "disabled";
        })(MuteState = editor.MuteState || (editor.MuteState = {}));
        let FilterState;
        (function (FilterState) {
            FilterState[FilterState["Hidden"] = 0] = "Hidden";
            FilterState[FilterState["Visible"] = 1] = "Visible";
            FilterState[FilterState["Disabled"] = 2] = "Disabled";
        })(FilterState = editor.FilterState || (editor.FilterState = {}));
        editor.initExtensionsAsync = opts => Promise.resolve({});
        editor.initFieldExtensionsAsync = opts => Promise.resolve({});
        editor.HELP_IMAGE_URI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHZpZXdCb3g9IjAgMCAyNiAyNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTMiIGN5PSIxMyIgcj0iMTMiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNy45NTIgOS4xODQwMkMxNy45NTIgMTAuMjU2IDE3LjgxNiAxMS4wNzIgMTcuNTQ0IDExLjYzMkMxNy4yODggMTIuMTkyIDE2Ljc1MiAxMi43OTIgMTUuOTM2IDEzLjQzMkMxNS4xMiAxNC4wNzIgMTQuNTc2IDE0LjU4NCAxNC4zMDQgMTQuOTY4QzE0LjA0OCAxNS4zMzYgMTMuOTIgMTUuNzM2IDEzLjkyIDE2LjE2OFYxNi45NkgxMS44MDhDMTEuNDI0IDE2LjQ2NCAxMS4yMzIgMTUuODQgMTEuMjMyIDE1LjA4OEMxMS4yMzIgMTQuNjg4IDExLjM4NCAxNC4yODggMTEuNjg4IDEzLjg4OEMxMS45OTIgMTMuNDg4IDEyLjUzNiAxMi45NjggMTMuMzIgMTIuMzI4QzE0LjEwNCAxMS42NzIgMTQuNjI0IDExLjE2OCAxNC44OCAxMC44MTZDMTUuMTM2IDEwLjQ0OCAxNS4yNjQgOS45NjgwMiAxNS4yNjQgOS4zNzYwMkMxNS4yNjQgOC4yMDgwMiAxNC40MTYgNy42MjQwMiAxMi43MiA3LjYyNDAyQzExLjc2IDcuNjI0MDIgMTAuNzUyIDcuNzM2MDIgOS42OTYgNy45NjAwMkw5LjE0NCA4LjA4MDAyTDkgNi4wODgwMkMxMC40ODggNS41NjAwMiAxMS44NCA1LjI5NjAyIDEzLjA1NiA1LjI5NjAyQzE0LjczNiA1LjI5NjAyIDE1Ljk2OCA1LjYwODAyIDE2Ljc1MiA2LjIzMjAyQzE3LjU1MiA2Ljg0MDAyIDE3Ljk1MiA3LjgyNDAyIDE3Ljk1MiA5LjE4NDAyWk0xMS40IDIyVjE4LjY0SDE0LjE4NFYyMkgxMS40WiIgZmlsbD0iIzU5NUU3NCIvPgo8L3N2Zz4K';
        let _initEditorExtensionsPromise;
        function initEditorExtensionsAsync() {
            if (!_initEditorExtensionsPromise) {
                _initEditorExtensionsPromise = Promise.resolve();
                if (pxt.appTarget && pxt.appTarget.appTheme && pxt.appTarget.appTheme.extendFieldEditors) {
                    const opts = {};
                    _initEditorExtensionsPromise = _initEditorExtensionsPromise
                        .then(() => pxt.BrowserUtils.loadBlocklyAsync())
                        .then(() => pxt.BrowserUtils.loadScriptAsync("fieldeditors.js"))
                        .then(() => pxt.editor.initFieldExtensionsAsync(opts))
                        .then(res => {
                        if (res.fieldEditors)
                            res.fieldEditors.forEach(fi => {
                                pxt.blocks.registerFieldEditor(fi.selector, fi.editor, fi.validator);
                            });
                    });
                }
            }
            return _initEditorExtensionsPromise;
        }
        editor.initEditorExtensionsAsync = initEditorExtensionsAsync;
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var editor;
    (function (editor_1) {
        const pendingRequests = {};
        /**
         * Binds incoming window messages to the project view.
         * Requires the "allowParentController" flag in the pxtarget.json/appTheme object.
         *
         * When the project view receives a request (EditorMessageRequest),
         * it starts the command and returns the result upon completion.
         * The response (EditorMessageResponse) contains the request id and result.
         * Some commands may be async, use the ``id`` field to correlate to the original request.
         */
        function bindEditorMessages(getEditorAsync) {
            const allowEditorMessages = (pxt.appTarget.appTheme.allowParentController || pxt.shell.isControllerMode())
                && pxt.BrowserUtils.isIFrame();
            const allowExtensionMessages = pxt.appTarget.appTheme.allowPackageExtensions;
            const allowSimTelemetry = pxt.appTarget.appTheme.allowSimulatorTelemetry;
            if (!allowEditorMessages && !allowExtensionMessages && !allowSimTelemetry)
                return;
            window.addEventListener("message", (msg) => {
                const data = msg.data;
                if (!data || !/^pxt(host|editor|pkgext|sim)$/.test(data.type))
                    return false;
                if (data.type === "pxtpkgext" && allowExtensionMessages) {
                    // Messages sent to the editor iframe from a child iframe containing an extension
                    getEditorAsync().then(projectView => {
                        projectView.handleExtensionRequest(data);
                    });
                }
                else if (data.type === "pxtsim" && allowSimTelemetry) {
                    const event = data;
                    if (event.action === "event") {
                        if (event.category || event.message) {
                            pxt.reportError(event.category, event.message, event.data);
                        }
                        else {
                            pxt.tickEvent(event.tick, event.data);
                        }
                    }
                }
                else if (allowEditorMessages) {
                    // Messages sent to the editor from the parent frame
                    let p = Promise.resolve();
                    let resp = undefined;
                    if (data.type == "pxthost") { // response from the host
                        const req = pendingRequests[data.id];
                        if (!req) {
                            pxt.debug(`pxthost: unknown request ${data.id}`);
                        }
                        else {
                            p = p.then(() => req.resolve(data));
                        }
                    }
                    else if (data.type == "pxteditor") { // request from the editor
                        p = p.then(() => {
                            return getEditorAsync().then(projectView => {
                                const req = data;
                                pxt.debug(`pxteditor: ${req.action}`);
                                switch (req.action.toLowerCase()) {
                                    case "switchjavascript": return Promise.resolve().then(() => projectView.openJavaScript());
                                    case "switchpython": return Promise.resolve().then(() => projectView.openPython());
                                    case "switchblocks": return Promise.resolve().then(() => projectView.openBlocks());
                                    case "startsimulator": return Promise.resolve().then(() => projectView.startSimulator());
                                    case "restartsimulator": return Promise.resolve().then(() => projectView.restartSimulator());
                                    case "hidesimulator": return Promise.resolve().then(() => projectView.collapseSimulator());
                                    case "showsimulator": return Promise.resolve().then(() => projectView.expandSimulator());
                                    case "closeflyout": return Promise.resolve().then(() => projectView.closeFlyout());
                                    case "unloadproject": return Promise.resolve().then(() => projectView.unloadProjectAsync());
                                    case "saveproject": return projectView.saveProjectAsync();
                                    case "redo": return Promise.resolve()
                                        .then(() => {
                                        const editor = projectView.editor;
                                        if (editor && editor.hasRedo())
                                            editor.redo();
                                    });
                                    case "undo": return Promise.resolve()
                                        .then(() => {
                                        const editor = projectView.editor;
                                        if (editor && editor.hasUndo())
                                            editor.undo();
                                    });
                                    case "setscale": {
                                        const zoommsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.editor.setScale(zoommsg.scale));
                                    }
                                    case "stopsimulator": {
                                        const stop = data;
                                        return Promise.resolve()
                                            .then(() => projectView.stopSimulator(stop.unload));
                                    }
                                    case "newproject": {
                                        const create = data;
                                        return Promise.resolve()
                                            .then(() => projectView.newProject(create.options));
                                    }
                                    case "importproject": {
                                        const load = data;
                                        return Promise.resolve()
                                            .then(() => projectView.importProjectAsync(load.project, {
                                            filters: load.filters,
                                            searchBar: load.searchBar
                                        }));
                                    }
                                    case "openheader": {
                                        const open = data;
                                        return projectView.openProjectByHeaderIdAsync(open.headerId);
                                    }
                                    case "startactivity": {
                                        const msg = data;
                                        let tutorialPath = msg.path;
                                        let editorProjectName = undefined;
                                        if (/^([jt]s|py|blocks?):/i.test(tutorialPath)) {
                                            if (/^py:/i.test(tutorialPath))
                                                editorProjectName = pxt.PYTHON_PROJECT_NAME;
                                            else if (/^[jt]s:/i.test(tutorialPath))
                                                editorProjectName = pxt.JAVASCRIPT_PROJECT_NAME;
                                            else
                                                editorProjectName = pxt.BLOCKS_PROJECT_NAME;
                                            tutorialPath = tutorialPath.substr(tutorialPath.indexOf(':') + 1);
                                        }
                                        return Promise.resolve()
                                            .then(() => projectView.startActivity({
                                            activity: msg.activityType,
                                            path: tutorialPath,
                                            title: msg.title,
                                            editor: editorProjectName,
                                            previousProjectHeaderId: msg.previousProjectHeaderId,
                                            carryoverPreviousCode: msg.carryoverPreviousCode
                                        }));
                                    }
                                    case "importtutorial": {
                                        const load = data;
                                        return Promise.resolve()
                                            .then(() => projectView.importTutorialAsync(load.markdown));
                                    }
                                    case "proxytosim": {
                                        const simmsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.proxySimulatorMessage(simmsg.content));
                                    }
                                    case "renderblocks": {
                                        const rendermsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.renderBlocksAsync(rendermsg))
                                            .then(r => {
                                            return r.xml.then((svg) => {
                                                resp = svg.xml;
                                            });
                                        });
                                    }
                                    case "runeval": {
                                        const evalmsg = data;
                                        const rubric = evalmsg.rubric;
                                        return Promise.resolve()
                                            .then(() => {
                                            const blocks = projectView.getBlocks();
                                            return pxt.blocks.validateProject(blocks, rubric);
                                        })
                                            .then(results => {
                                            resp = results;
                                        });
                                    }
                                    case "renderpython": {
                                        const rendermsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.renderPythonAsync(rendermsg))
                                            .then(r => {
                                            resp = r.python;
                                        });
                                    }
                                    case "toggletrace": {
                                        const togglemsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.toggleTrace(togglemsg.intervalSpeed));
                                    }
                                    case "settracestate": {
                                        const trcmsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.setTrace(trcmsg.enabled, trcmsg.intervalSpeed));
                                    }
                                    case "setsimulatorfullscreen": {
                                        const fsmsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.setSimulatorFullScreen(fsmsg.enabled));
                                    }
                                    case "togglehighcontrast": {
                                        return Promise.resolve()
                                            .then(() => projectView.toggleHighContrast());
                                    }
                                    case "sethighcontrast": {
                                        const hcmsg = data;
                                        return Promise.resolve()
                                            .then(() => projectView.setHighContrast(hcmsg.on));
                                    }
                                    case "togglegreenscreen": {
                                        return Promise.resolve()
                                            .then(() => projectView.toggleGreenScreen());
                                    }
                                    case "print": {
                                        return Promise.resolve()
                                            .then(() => projectView.printCode());
                                    }
                                    case "pair": {
                                        return projectView.pairAsync().then(() => { });
                                    }
                                    case "info": {
                                        return Promise.resolve()
                                            .then(() => {
                                            resp = {
                                                versions: pxt.appTarget.versions,
                                                locale: ts.pxtc.Util.userLanguage(),
                                                availableLocales: pxt.appTarget.appTheme.availableLocales
                                            };
                                        });
                                    }
                                    case "shareproject": {
                                        const msg = data;
                                        return projectView.anonymousPublishHeaderByIdAsync(msg.headerId, msg.projectName)
                                            .then(scriptInfo => {
                                            resp = scriptInfo;
                                        });
                                    }
                                    case "savelocalprojectstocloud": {
                                        const msg = data;
                                        return projectView.saveLocalProjectsToCloudAsync(msg.headerIds)
                                            .then(guidMap => {
                                            resp = {
                                                headerIdMap: guidMap
                                            };
                                        });
                                    }
                                    case "requestprojectcloudstatus": {
                                        // Responses are sent as separate "projectcloudstatus" messages.
                                        const msg = data;
                                        return projectView.requestProjectCloudStatus(msg.headerIds);
                                    }
                                    case "convertcloudprojectstolocal": {
                                        const msg = data;
                                        return projectView.convertCloudProjectsToLocal(msg.userId);
                                    }
                                    case "setlanguagerestriction": {
                                        const msg = data;
                                        if (msg.restriction === "no-blocks") {
                                            console.warn("no-blocks language restriction is not supported");
                                            throw new Error("no-blocks language restriction is not supported");
                                        }
                                        return projectView.setLanguageRestrictionAsync(msg.restriction);
                                    }
                                }
                                return Promise.resolve();
                            });
                        });
                    }
                    p.then(() => sendResponse(data, resp, true, undefined), (err) => sendResponse(data, resp, false, err));
                }
                return true;
            }, false);
        }
        editor_1.bindEditorMessages = bindEditorMessages;
        /**
         * Sends analytics messages upstream to container if any
         */
        function enableControllerAnalytics() {
            if (!pxt.appTarget.appTheme.allowParentController || !pxt.BrowserUtils.isIFrame())
                return;
            const te = pxt.tickEvent;
            pxt.tickEvent = function (id, data) {
                if (te)
                    te(id, data);
                postHostMessageAsync({
                    type: 'pxthost',
                    action: 'event',
                    tick: id,
                    response: false,
                    data
                });
            };
            const rexp = pxt.reportException;
            pxt.reportException = function (err, data) {
                if (rexp)
                    rexp(err, data);
                try {
                    postHostMessageAsync({
                        type: 'pxthost',
                        action: 'event',
                        tick: 'error',
                        message: err.message,
                        response: false,
                        data
                    });
                }
                catch (e) {
                }
            };
            const re = pxt.reportError;
            pxt.reportError = function (cat, msg, data) {
                if (re)
                    re(cat, msg, data);
                postHostMessageAsync({
                    type: 'pxthost',
                    action: 'event',
                    tick: 'error',
                    category: cat,
                    message: msg,
                    data
                });
            };
        }
        editor_1.enableControllerAnalytics = enableControllerAnalytics;
        function sendResponse(request, resp, success, error) {
            if (request.response) {
                window.parent.postMessage({
                    type: request.type,
                    id: request.id,
                    resp,
                    success,
                    error
                }, "*");
            }
        }
        /**
         * Determines if host messages should be posted
         */
        function shouldPostHostMessages() {
            return pxt.appTarget.appTheme.allowParentController && pxt.BrowserUtils.isIFrame();
        }
        editor_1.shouldPostHostMessages = shouldPostHostMessages;
        /**
         * Posts a message from the editor to the host
         */
        function postHostMessageAsync(msg) {
            return new Promise((resolve, reject) => {
                const env = pxt.Util.clone(msg);
                env.id = ts.pxtc.Util.guidGen();
                if (msg.response)
                    pendingRequests[env.id] = { resolve, reject };
                window.parent.postMessage(env, "*");
                if (!msg.response)
                    resolve(undefined);
            });
        }
        editor_1.postHostMessageAsync = postHostMessageAsync;
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        var experiments;
        (function (experiments_1) {
            function key(experiment) {
                const id = (typeof experiment === "object") ? experiment.id : experiment;
                return `experiments-${id}`;
            }
            function syncTheme() {
                const theme = pxt.savedAppTheme();
                const r = {};
                const experiments = all();
                experiments.forEach(experiment => {
                    const enabled = isEnabled(experiment);
                    theme[experiment.id] = !!enabled;
                    if (enabled)
                        r[experiment.id] = enabled ? 1 : 0;
                });
                if (experiments.length && Object.keys(r).length) {
                    pxt.tickEvent("experiments.loaded", r);
                    pxt.reloadAppTargetVariant();
                }
                return pxt.appTarget.appTheme;
            }
            experiments_1.syncTheme = syncTheme;
            function all() {
                const ids = pxt.appTarget.appTheme.experiments;
                if (!ids)
                    return [];
                return [
                    {
                        id: "print",
                        name: lf("Print Code"),
                        description: lf("Print the code from the current project"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/4740"
                    },
                    {
                        id: "greenScreen",
                        name: lf("Green screen"),
                        description: lf("Display a webcam video stream or a green background behind the code."),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/4738"
                    },
                    {
                        id: "allowPackageExtensions",
                        name: lf("Editor Extensions"),
                        description: lf("Allow Extensions to add buttons in the editor."),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/4741"
                    },
                    {
                        id: "instructions",
                        name: lf("Wiring Instructions"),
                        description: lf("Generate step-by-step assembly instructions for breadboard wiring."),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/4739"
                    },
                    {
                        id: "debugger",
                        name: lf("Debugger"),
                        description: lf("Step through code and inspect variables in the debugger"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/4729"
                    },
                    {
                        id: "bluetoothUartConsole",
                        name: "Bluetooth Console",
                        description: lf("Receives UART message through Web Bluetooth"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/4796"
                    },
                    {
                        id: "bluetoothPartialFlashing",
                        name: "Bluetooth Download",
                        description: lf("Download code via Web Bluetooth"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/4807"
                    },
                    {
                        id: "simScreenshot",
                        name: lf("Simulator Screenshots"),
                        description: lf("Download screenshots of the simulator"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/5232"
                    },
                    {
                        id: "python",
                        name: lf("Static Python"),
                        description: lf("Use Static Python to code your device"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/5390"
                    },
                    {
                        id: "simGif",
                        name: lf("Simulator Gifs"),
                        description: lf("Download gifs of the simulator"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/5297"
                    },
                    {
                        id: "qrCode",
                        name: lf("Shared QR Code"),
                        description: lf("Generate a QR Code form the shared project url"),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/5456"
                    },
                    {
                        id: "importExtensionFiles",
                        name: lf("Import Extension Files"),
                        description: lf("Import Extensions from compiled project files")
                    },
                    {
                        id: "debugExtensionCode",
                        name: lf("Debug Extension Code"),
                        description: lf("Use the JavaScript debugger to debug extension code")
                    },
                    {
                        id: "snippetBuilder",
                        name: lf("Snippet Builder"),
                        description: lf("Try out the new snippet dialogs.")
                    },
                    {
                        id: "experimentalHw",
                        name: lf("Experimental Hardware"),
                        description: lf("Enable support for hardware marked 'experimental' in the hardware seletion dialog")
                    },
                    {
                        id: "checkForHwVariantWebUSB",
                        name: lf("Detect Hardware with WebUSB"),
                        description: lf("When compiling, use WebUSB to detect hardware configuration.")
                    },
                    {
                        id: "githubEditor",
                        name: lf("GitHub editor"),
                        description: lf("Review, commit and push to GitHub."),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/6419",
                        enableOnline: true,
                    },
                    {
                        id: "githubCompiledJs",
                        name: lf("GitHub Pages JavaScript"),
                        description: lf("Commit compiled javascript when creating a release"),
                        enableOnline: true,
                    },
                    {
                        id: "blocksCollapsing",
                        name: lf("Collapse blocks"),
                        description: lf("Collapse and expand functions or event blocks")
                    },
                    {
                        id: "tutorialBlocksDiff",
                        name: lf("Tutorial Block Diffs"),
                        description: lf("Automatially render blocks diff in tutorials")
                    },
                    {
                        id: "openProjectNewTab",
                        name: lf("Open in New Tab"),
                        description: lf("Open an editor in a new tab.")
                    },
                    {
                        id: "openProjectNewDependentTab",
                        name: lf("Open in New Connected Tab"),
                        description: lf("Open connected editors in different browser tabs.")
                    },
                    {
                        id: "accessibleBlocks",
                        name: lf("Accessible Blocks"),
                        description: lf("Use the WASD keys to move and modify blocks."),
                        feedbackUrl: "https://github.com/microsoft/pxt/issues/6850"
                    },
                    {
                        id: "errorList",
                        name: lf("Error List"),
                        description: lf("Show an error list panel for JavaScript and Python.")
                    },
                    {
                        id: "blocksErrorList",
                        name: lf("Blocks Error List"),
                        description: lf("Show an error list panel for Blocks")
                    },
                    {
                        id: "timeMachine",
                        name: lf("Time Machine"),
                        description: lf("Save and restore past versions of a project")
                    },
                ].filter(experiment => ids.indexOf(experiment.id) > -1 && !(pxt.BrowserUtils.isPxtElectron() && experiment.enableOnline));
            }
            experiments_1.all = all;
            function clear() {
                all().forEach(experiment => pxt.storage.removeLocal(key(experiment)));
                syncTheme();
            }
            experiments_1.clear = clear;
            function someEnabled() {
                return all().some(experiment => isEnabled(experiment));
            }
            experiments_1.someEnabled = someEnabled;
            function isEnabled(experiment) {
                return !!pxt.storage.getLocal(key(experiment));
            }
            experiments_1.isEnabled = isEnabled;
            function toggle(experiment) {
                setState(experiment, !isEnabled(experiment));
            }
            experiments_1.toggle = toggle;
            function state() {
                const r = {};
                all().forEach(experiment => r[experiment.id] = isEnabled(experiment));
                return JSON.stringify(r);
            }
            experiments_1.state = state;
            function setState(experiment, enabled) {
                if (enabled == isEnabled(experiment))
                    return; // no changes
                if (enabled)
                    pxt.storage.setLocal(key(experiment), "1");
                else
                    pxt.storage.removeLocal(key(experiment));
                // sync theme
                syncTheme();
            }
            experiments_1.setState = setState;
        })(experiments = editor.experiments || (editor.experiments = {}));
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var workspace;
    (function (workspace) {
        // 5 minutes. This is overridden in pxtarget.json
        const DEFAULT_DIFF_HISTORY_INTERVAL = 1000 * 60 * 5;
        // 15 minutes. This is overridden in pxtarget.json
        const DEFAULT_SNAPSHOT_HISTORY_INTERVAL = 1000 * 60 * 15;
        const ONE_DAY = 1000 * 60 * 60 * 24;
        function collapseHistory(history, text, options, diff, patch) {
            var _a, _b;
            const newHistory = [];
            let current = Object.assign({}, text);
            let lastVersion = (_b = (_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.versions) === null || _b === void 0 ? void 0 : _b.target;
            let lastTime = undefined;
            let lastTimeIndex = undefined;
            let lastTimeText = undefined;
            let { interval, minTime, maxTime } = options;
            if (minTime === undefined) {
                minTime = 0;
            }
            if (maxTime === undefined) {
                maxTime = history[history.length - 1].timestamp;
            }
            for (let i = history.length - 1; i >= 0; i--) {
                const entry = history[i];
                if (entry.timestamp > maxTime) {
                    newHistory.unshift(entry);
                    current = applyDiff(current, entry, patch);
                    continue;
                }
                else if (entry.timestamp < minTime) {
                    if (lastTimeIndex !== undefined) {
                        if (lastTimeIndex - i > 1) {
                            newHistory.unshift({
                                timestamp: lastTime,
                                editorVersion: lastVersion,
                                changes: diffScriptText(current, lastTimeText, lastTime, diff).changes
                            });
                        }
                        else {
                            newHistory.unshift(history[lastTimeIndex]);
                        }
                    }
                    newHistory.unshift(entry);
                    lastTimeIndex = undefined;
                    continue;
                }
                else if (lastTimeIndex === undefined) {
                    lastTimeText = Object.assign({}, current);
                    lastTime = entry.timestamp;
                    lastVersion = entry.editorVersion;
                    lastTimeIndex = i;
                    current = applyDiff(current, entry, patch);
                    continue;
                }
                if (lastTime - entry.timestamp > interval) {
                    if (lastTimeIndex - i > 1) {
                        newHistory.unshift({
                            timestamp: lastTime,
                            editorVersion: lastVersion,
                            changes: diffScriptText(current, lastTimeText, lastTime, diff).changes
                        });
                    }
                    else {
                        newHistory.unshift(history[lastTimeIndex]);
                    }
                    lastTimeText = Object.assign({}, current);
                    current = applyDiff(current, entry, patch);
                    lastTimeIndex = i;
                    lastTime = entry.timestamp;
                    lastVersion = entry.editorVersion;
                }
                else {
                    current = applyDiff(current, entry, patch);
                }
            }
            if (lastTimeIndex !== undefined) {
                if (lastTimeIndex) {
                    newHistory.unshift({
                        timestamp: lastTime,
                        editorVersion: lastVersion,
                        changes: diffScriptText(current, lastTimeText, lastTime, diff).changes
                    });
                }
                else {
                    newHistory.unshift(history[0]);
                }
            }
            return newHistory;
        }
        workspace.collapseHistory = collapseHistory;
        function diffScriptText(oldVersion, newVersion, time, diff) {
            var _a, _b;
            const changes = [];
            for (const file of Object.keys(oldVersion)) {
                if (!(file.endsWith(".ts") || file.endsWith(".jres") || file.endsWith(".py") || file.endsWith(".blocks") || file === "pxt.json"))
                    continue;
                if (newVersion[file] == undefined) {
                    changes.push({
                        type: "removed",
                        filename: file,
                        value: oldVersion[file]
                    });
                }
                else if (oldVersion[file] !== newVersion[file]) {
                    changes.push({
                        type: "edited",
                        filename: file,
                        patch: diff(newVersion[file], oldVersion[file])
                    });
                }
            }
            for (const file of Object.keys(newVersion)) {
                if (!(file.endsWith(".ts") || file.endsWith(".jres") || file.endsWith(".py") || file.endsWith(".blocks") || file === "pxt.json"))
                    continue;
                if (oldVersion[file] == undefined) {
                    changes.push({
                        type: "added",
                        filename: file,
                        value: newVersion[file]
                    });
                }
            }
            if (!changes.length)
                return undefined;
            return {
                timestamp: time,
                editorVersion: (_b = (_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.versions) === null || _b === void 0 ? void 0 : _b.target,
                changes
            };
        }
        workspace.diffScriptText = diffScriptText;
        function applyDiff(text, history, patch) {
            const result = Object.assign({}, text);
            for (const change of history.changes) {
                if (change.type === "added") {
                    delete result[change.filename];
                }
                else if (change.type === "removed") {
                    result[change.filename] = change.value;
                }
                else {
                    result[change.filename] = patch(change.patch, text[change.filename]);
                }
            }
            return result;
        }
        workspace.applyDiff = applyDiff;
        function createSnapshot(text) {
            try {
                const result = {};
                const config = JSON.parse(text[pxt.CONFIG_NAME]);
                for (const file of config.files) {
                    // these files will just get regenrated
                    if (file === pxt.IMAGES_CODE || file === pxt.TILEMAP_CODE) {
                        result[file] = "";
                    }
                    else {
                        result[file] = text[file];
                    }
                }
                result[pxt.CONFIG_NAME] = text[pxt.CONFIG_NAME];
                // main.ts will also be regenerated if blocks/python
                if (config.preferredEditor === pxt.BLOCKS_PROJECT_NAME) {
                    if (result[pxt.MAIN_BLOCKS])
                        result[pxt.MAIN_TS] = "";
                }
                else if (config.preferredEditor === pxt.PYTHON_PROJECT_NAME) {
                    if (result[pxt.MAIN_PY])
                        result[pxt.MAIN_TS] = "";
                }
                if (config.testFiles) {
                    for (const file of config.testFiles) {
                        result[file] = text[file];
                    }
                }
                return result;
            }
            catch (e) {
                return Object.assign({}, text);
            }
        }
        workspace.createSnapshot = createSnapshot;
        function applySnapshot(text, snapshot) {
            var _a;
            try {
                const result = Object.assign({}, snapshot);
                const config = JSON.parse(text[pxt.CONFIG_NAME]);
                // preserve any files from the current text that aren't in the config; this is just to make
                // sure that our internal files like history, markdown, serial output are preserved
                for (const file of Object.keys(text)) {
                    if (config.files.indexOf(file) === -1 && ((_a = config.testFiles) === null || _a === void 0 ? void 0 : _a.indexOf(file)) === -1 && !result[file]) {
                        result[file] = text[file];
                    }
                }
                return result;
            }
            catch (e) {
                const result = Object.assign({}, text);
                for (const file of Object.keys(snapshot)) {
                    result[file] = snapshot[file];
                }
                return result;
            }
        }
        workspace.applySnapshot = applySnapshot;
        function parseHistoryFile(text) {
            const result = JSON.parse(text);
            if (!result.entries)
                result.entries = [];
            if (!result.shares)
                result.shares = [];
            if (!result.snapshots)
                result.snapshots = [];
            return result;
        }
        workspace.parseHistoryFile = parseHistoryFile;
        function updateHistory(previousText, toWrite, currentTime, shares, diff, patch) {
            let history;
            // Always base the history off of what was in the previousText,
            // which is written to disk. The new text could have corrupted it
            // in some way
            if (previousText[pxt.HISTORY_FILE]) {
                history = pxt.workspace.parseHistoryFile(previousText[pxt.HISTORY_FILE]);
            }
            else {
                history = {
                    entries: [],
                    snapshots: [takeSnapshot(previousText, currentTime - 1)],
                    shares: []
                };
            }
            // First save any new project shares
            for (const share of shares) {
                if (!history.shares.some(s => s.id === share.id)) {
                    history.shares.push({
                        id: share.id,
                        timestamp: currentTime,
                    });
                }
            }
            // If no source changed, we can bail at this point
            if (scriptEquals(previousText, toWrite)) {
                toWrite[pxt.HISTORY_FILE] = JSON.stringify(history);
                return;
            }
            // Next, update the diff entries. We always update this, but may
            // combine it with the previous diff if it's been less than the
            // interval time
            let shouldCombine = false;
            if (history.entries.length > 1) {
                const topTime = history.entries[history.entries.length - 1].timestamp;
                const prevTime = history.entries[history.entries.length - 2].timestamp;
                if (currentTime - topTime < diffInterval() && topTime - prevTime < diffInterval()) {
                    shouldCombine = true;
                }
            }
            if (shouldCombine) {
                // Roll back the last diff and create a new one
                const prevText = applyDiff(previousText, history.entries.pop(), patch);
                const diffed = diffScriptText(prevText, toWrite, currentTime, diff);
                if (diffed) {
                    history.entries.push(diffed);
                }
            }
            else {
                const diffed = diffScriptText(previousText, toWrite, currentTime, diff);
                if (diffed) {
                    history.entries.push(diffed);
                }
            }
            // Finally, update the snapshots. These are failsafes in case something
            // goes wrong with the diff history. We keep one snapshot per interval for
            // the past 24 hours and one snapshot per day prior to that
            if (history.snapshots.length == 0) {
                history.snapshots.push(takeSnapshot(previousText, currentTime - 1));
            }
            else if (currentTime - history.snapshots[history.snapshots.length - 1].timestamp >= snapshotInterval()) {
                history.snapshots.push(takeSnapshot(previousText, currentTime));
                const trimmed = [];
                let currentDay = Math.floor(currentTime / ONE_DAY) * ONE_DAY;
                for (let i = 0; i < history.snapshots.length; i++) {
                    const current = history.snapshots[history.snapshots.length - 1 - i];
                    if (currentTime - current.timestamp < ONE_DAY || i === history.snapshots.length - 1) {
                        trimmed.unshift(current);
                    }
                    else if (current.timestamp < currentDay) {
                        trimmed.unshift(current);
                        currentDay = Math.floor(current.timestamp / ONE_DAY) * ONE_DAY;
                    }
                }
                history.snapshots = trimmed;
            }
            toWrite[pxt.HISTORY_FILE] = JSON.stringify(history);
        }
        workspace.updateHistory = updateHistory;
        function pushSnapshotOnHistory(text, currentTime) {
            let history;
            if (text[pxt.HISTORY_FILE]) {
                history = pxt.workspace.parseHistoryFile(text[pxt.HISTORY_FILE]);
            }
            else {
                history = {
                    entries: [],
                    snapshots: [],
                    shares: []
                };
            }
            history.snapshots.push(takeSnapshot(text, currentTime));
            text[pxt.HISTORY_FILE] = JSON.stringify(history);
        }
        workspace.pushSnapshotOnHistory = pushSnapshotOnHistory;
        function updateShareHistory(text, currentTime, shares) {
            let history;
            if (text[pxt.HISTORY_FILE]) {
                history = pxt.workspace.parseHistoryFile(text[pxt.HISTORY_FILE]);
            }
            else {
                history = {
                    entries: [],
                    snapshots: [],
                    shares: []
                };
            }
            for (const share of shares) {
                if (!history.shares.some(s => s.id === share.id)) {
                    history.shares.push({
                        id: share.id,
                        timestamp: currentTime,
                    });
                }
            }
            text[pxt.HISTORY_FILE] = JSON.stringify(history);
        }
        workspace.updateShareHistory = updateShareHistory;
        function takeSnapshot(text, time) {
            return {
                timestamp: time,
                editorVersion: pxt.appTarget.versions.target,
                text: pxt.workspace.createSnapshot(text)
            };
        }
        function scriptEquals(a, b) {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length)
                return false;
            for (const key of aKeys) {
                if (bKeys.indexOf(key) === -1)
                    return false;
                if (a[key] !== b[key])
                    return false;
            }
            return true;
        }
        function diffInterval() {
            var _a, _b;
            if (((_b = (_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.appTheme) === null || _b === void 0 ? void 0 : _b.timeMachineDiffInterval) != undefined) {
                return pxt.appTarget.appTheme.timeMachineDiffInterval;
            }
            return DEFAULT_DIFF_HISTORY_INTERVAL;
        }
        function snapshotInterval() {
            var _a, _b;
            if (((_b = (_a = pxt.appTarget) === null || _a === void 0 ? void 0 : _a.appTheme) === null || _b === void 0 ? void 0 : _b.timeMachineSnapshotInterval) != undefined) {
                return pxt.appTarget.appTheme.timeMachineSnapshotInterval;
            }
            return DEFAULT_SNAPSHOT_HISTORY_INTERVAL;
        }
    })(workspace = pxt.workspace || (pxt.workspace = {}));
})(pxt || (pxt = {}));
/// <reference path="../localtypings/monaco.d.ts" />
/// <reference path="../built/pxtlib.d.ts"/>
/// <reference path="../built/pxtblocks.d.ts"/>
var pxt;
(function (pxt) {
    var vs;
    (function (vs) {
        function syncModels(mainPkg, libs, currFile, readOnly) {
            if (readOnly)
                return;
            let extraLibs = monaco.languages.typescript.typescriptDefaults.getExtraLibs();
            let modelMap = {};
            mainPkg.sortedDeps().forEach(pkg => {
                pkg.getFiles().forEach(f => {
                    let fp = pkg.id + "/" + f;
                    let proto = "pkg:" + fp;
                    if (/\.(ts)$/.test(f) && fp != currFile) {
                        if (!monaco.languages.typescript.typescriptDefaults.getExtraLibs()[fp]) {
                            // inserting a space creates syntax errors in Python
                            let content = pkg.readFile(f) || "\n";
                            libs[fp] = monaco.languages.typescript.typescriptDefaults.addExtraLib(content, fp);
                        }
                        modelMap[fp] = "1";
                    }
                });
            });
            // dispose of any extra libraries, the typescript worker will be killed as a result of this
            Object.keys(extraLibs)
                .filter(lib => /\.(ts)$/.test(lib) && !modelMap[lib])
                .forEach(lib => {
                libs[lib].dispose();
            });
        }
        vs.syncModels = syncModels;
        function initMonacoAsync(element) {
            return new Promise((resolve, reject) => {
                if (typeof (window.monaco) === 'object') {
                    // monaco is already loaded
                    resolve(createEditor(element));
                    return;
                }
                let monacoPaths = window.MonacoPaths;
                let onGotAmdLoader = () => {
                    let req = window.require;
                    req.config({ paths: monacoPaths });
                    // Load monaco
                    req(['vs/editor/editor.main'], () => {
                        setupMonaco();
                        resolve(createEditor(element));
                    });
                };
                // Load AMD loader if necessary
                if (!window.require) {
                    let loaderScript = document.createElement('script');
                    loaderScript.type = 'text/javascript';
                    loaderScript.src = monacoPaths['vs/loader'];
                    loaderScript.addEventListener('load', onGotAmdLoader);
                    document.body.appendChild(loaderScript);
                }
                else {
                    onGotAmdLoader();
                }
            });
        }
        vs.initMonacoAsync = initMonacoAsync;
        function setupMonaco() {
            initAsmMonarchLanguage();
            initTypeScriptLanguageDefinition();
        }
        function createEditor(element) {
            const inverted = pxt.appTarget.appTheme.invertedMonaco;
            const hasFieldEditors = !!(pxt.appTarget.appTheme.monacoFieldEditors && pxt.appTarget.appTheme.monacoFieldEditors.length);
            const isAndroid = pxt.BrowserUtils.isAndroid();
            let editor = monaco.editor.create(element, {
                model: null,
                ariaLabel: pxt.Util.lf("JavaScript editor"),
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', 'monospace'",
                scrollBeyondLastLine: true,
                language: "typescript",
                mouseWheelZoom: false,
                wordBasedSuggestions: true,
                lineNumbersMinChars: 3,
                formatOnPaste: true,
                folding: hasFieldEditors,
                glyphMargin: hasFieldEditors || pxt.appTarget.appTheme.debugger,
                minimap: {
                    enabled: false
                },
                fixedOverflowWidgets: true,
                autoIndent: "full",
                useTabStops: true,
                dragAndDrop: true,
                matchBrackets: "always",
                occurrencesHighlight: false,
                quickSuggestionsDelay: 200,
                theme: inverted ? 'vs-dark' : 'vs',
                renderIndentGuides: true,
                accessibilityHelpUrl: "",
                // disable completions on android
                quickSuggestions: {
                    "other": !isAndroid,
                    "comments": !isAndroid,
                    "strings": !isAndroid
                },
                acceptSuggestionOnCommitCharacter: !isAndroid,
                acceptSuggestionOnEnter: !isAndroid ? "on" : "off",
                accessibilitySupport: !isAndroid ? "on" : "off"
            });
            editor.layout();
            return editor;
        }
        vs.createEditor = createEditor;
        function initAsmMonarchLanguage() {
            monaco.languages.register({ id: 'asm', extensions: ['.asm'] });
            monaco.languages.setMonarchTokensProvider('asm', {
                // Set defaultToken to invalid to see what you do not tokenize yet
                // defaultToken: 'invalid',
                tokenPostfix: '',
                //Extracted from http://infocenter.arm.com/help/topic/com.arm.doc.qrc0006e/QRC0006_UAL16.pdf
                //Should be a superset of the instructions emitted
                keywords: [
                    'movs', 'mov', 'adds', 'add', 'adcs', 'adr', 'subs', 'sbcs', 'sub', 'rsbs',
                    'muls', 'cmp', 'cmn', 'ands', 'eors', 'orrs', 'bics', 'mvns', 'tst', 'lsls',
                    'lsrs', 'asrs', 'rors', 'ldr', 'ldrh', 'ldrb', 'ldrsh', 'ldrsb', 'ldm',
                    'str', 'strh', 'strb', 'stm', 'push', 'pop', 'cbz', 'cbnz', 'b', 'bl', 'bx', 'blx',
                    'sxth', 'sxtb', 'uxth', 'uxtb', 'rev', 'rev16', 'revsh', 'svc', 'cpsid', 'cpsie',
                    'setend', 'bkpt', 'nop', 'sev', 'wfe', 'wfi', 'yield',
                    'beq', 'bne', 'bcs', 'bhs', 'bcc', 'blo', 'bmi', 'bpl', 'bvs', 'bvc', 'bhi', 'bls',
                    'bge', 'blt', 'bgt', 'ble', 'bal',
                    //Registers
                    'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15',
                    'pc', 'sp', 'lr'
                ],
                typeKeywords: [
                    '.startaddr', '.hex', '.short', '.space', '.section', '.string', '.byte'
                ],
                operators: [],
                // Not all of these are valid in ARM Assembly
                symbols: /[:\*]+/,
                // C# style strings
                escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
                // The main tokenizer for our languages
                tokenizer: {
                    root: [
                        // identifiers and keywords
                        [/(\.)?[a-z_$\.][\w$]*/, {
                                cases: {
                                    '@typeKeywords': 'keyword',
                                    '@keywords': 'keyword',
                                    '@default': 'identifier'
                                }
                            }],
                        // whitespace
                        { include: '@whitespace' },
                        // delimiters and operators
                        [/[{}()\[\]]/, '@brackets'],
                        [/[<>](?!@symbols)/, '@brackets'],
                        [/@symbols/, {
                                cases: {
                                    '@operators': 'operator',
                                    '@default': ''
                                }
                            }],
                        // @ annotations.
                        [/@\s*[a-zA-Z_\$][\w\$]*/, { token: 'annotation' }],
                        // numbers
                        //[/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                        [/(#|(0[xX]))?[0-9a-fA-F]+/, 'number'],
                        // delimiter: after number because of .\d floats
                        [/[;,.]/, 'delimiter'],
                        // strings
                        [/"([^"\\]|\\.)*$/, 'string.invalid'],
                        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                        // characters
                        [/'[^\\']'/, 'string'],
                        [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                        [/'/, 'string.invalid']
                    ],
                    comment: [],
                    string: [
                        [/[^\\"]+/, 'string'],
                        [/@escapes/, 'string.escape'],
                        [/\\./, 'string.escape.invalid'],
                        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                    ],
                    whitespace: [
                        [/[ \t\r\n]+/, 'white'],
                        [/\/\*/, 'comment', '@comment'],
                        [/;.*$/, 'comment'],
                    ],
                }
            });
        }
        function initTypeScriptLanguageDefinition() {
            if (!monaco.languages.typescript) {
                return;
            }
            // validation settings
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSyntaxValidation: true,
                noSemanticValidation: true
            });
            // Register our worker
            monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
                customWorkerPath: pxt.webConfig.typeScriptWorkerJs
            });
            // compiler options
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                allowUnreachableCode: true,
                noImplicitAny: true,
                allowJs: false,
                allowUnusedLabels: true,
                target: monaco.languages.typescript.ScriptTarget.ES5,
                outDir: "built",
                rootDir: ".",
                noLib: true,
                mouseWheelZoom: false
            });
        }
    })(vs = pxt.vs || (pxt.vs = {}));
})(pxt || (pxt = {}));
/// <reference path="../built/pxtlib.d.ts"/>
var pxt;
(function (pxt) {
    var workspace;
    (function (workspace) {
        function freshHeader(name, modTime) {
            let header = {
                target: pxt.appTarget.id,
                targetVersion: pxt.appTarget.versions.target,
                name: name,
                meta: {},
                editor: pxt.JAVASCRIPT_PROJECT_NAME,
                pubId: "",
                pubCurrent: false,
                _rev: null,
                id: pxt.U.guidGen(),
                recentUse: modTime,
                modificationTime: modTime,
                cloudUserId: null,
                cloudCurrent: false,
                cloudVersion: null,
                cloudLastSyncTime: 0,
                isDeleted: false,
            };
            return header;
        }
        workspace.freshHeader = freshHeader;
    })(workspace = pxt.workspace || (pxt.workspace = {}));
})(pxt || (pxt = {}));
/// <reference path="../../localtypings/monaco.d.ts" />
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        const definitions = {};
        function registerMonacoFieldEditor(name, definition) {
            definitions[name] = definition;
        }
        editor.registerMonacoFieldEditor = registerMonacoFieldEditor;
        function getMonacoFieldEditor(name) {
            return definitions[name];
        }
        editor.getMonacoFieldEditor = getMonacoFieldEditor;
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
/// <reference path="./monacoFieldEditor.ts" />
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        const fieldEditorId = "image-editor";
        class MonacoReactFieldEditor {
            getId() {
                return fieldEditorId;
            }
            showEditorAsync(fileType, editrange, host) {
                this.fileType = fileType;
                this.editrange = editrange;
                this.host = host;
                return this.initAsync().then(() => {
                    const value = this.textToValue(host.getText(editrange));
                    if (!value) {
                        return Promise.resolve(null);
                    }
                    this.fv = pxt.react.getFieldEditorView(this.getFieldEditorId(), value, this.getOptions());
                    this.fv.onHide(() => {
                        this.onClosed();
                    });
                    this.fv.show();
                    return new Promise((resolve, reject) => {
                        this.resolver = resolve;
                        this.rejecter = reject;
                    });
                });
            }
            onClosed() {
                if (this.resolver) {
                    this.resolver({
                        range: this.editrange,
                        replacement: this.resultToText(this.fv.getResult())
                    });
                    this.editrange = undefined;
                    this.resolver = undefined;
                    this.rejecter = undefined;
                }
            }
            dispose() {
                this.onClosed();
            }
            initAsync() {
                return Promise.resolve();
            }
            textToValue(text) {
                return null;
            }
            resultToText(result) {
                return result + "";
            }
            getFieldEditorId() {
                return "";
            }
            getOptions() {
                return null;
            }
        }
        editor.MonacoReactFieldEditor = MonacoReactFieldEditor;
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
/// <reference path="./monacoFieldEditor.ts" />
/// <reference path="./field_react.ts" />
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        const fieldEditorId = "music-editor";
        class MonacoSongEditor extends editor.MonacoReactFieldEditor {
            textToValue(text) {
                this.isPython = text.indexOf("`") === -1;
                this.text = text;
                const match = pxt.parseAssetTSReference(text);
                if (match) {
                    const { type, name: matchedName } = match;
                    const name = matchedName.trim();
                    const project = pxt.react.getTilemapProject();
                    this.isAsset = true;
                    const asset = project.lookupAssetByName("song" /* pxt.AssetType.Song */, name);
                    if (asset) {
                        return asset;
                    }
                    else {
                        const newAsset = project.createNewSong(pxt.assets.music.getEmptySong(2));
                        if (name && !project.isNameTaken("song" /* pxt.AssetType.Song */, name) && pxt.validateAssetName(name)) {
                            newAsset.meta.displayName = name;
                        }
                        return newAsset;
                    }
                }
                const hexLiteralMatch = /hex\s*(?:`|\(""")\s*([a-fA-F0-9]*)\s*(?:`|"""\))\s*(?:;?)/m.exec(text);
                if (hexLiteralMatch) {
                    const contents = hexLiteralMatch[1].trim();
                    if (contents) {
                        return createFakeAsset(pxt.assets.music.decodeSongFromHex(contents));
                    }
                    return createFakeAsset(pxt.assets.music.getEmptySong(2));
                }
                return undefined; // never
            }
            resultToText(result) {
                var _a;
                if ((_a = result.meta) === null || _a === void 0 ? void 0 : _a.displayName) {
                    const project = pxt.react.getTilemapProject();
                    if (this.isAsset || project.lookupAsset(result.type, result.id)) {
                        result = project.updateAsset(result);
                    }
                    else {
                        result = project.createNewSong(result.song, result.meta.displayName);
                    }
                    this.isAsset = true;
                    return pxt.getTSReferenceForAsset(result, this.isPython);
                }
                let hexString = pxt.assets.music.encodeSongToHex(result.song);
                if (this.isPython) {
                    hexString = `hex("""${hexString}""")`;
                }
                else {
                    hexString = "hex`" + hexString + "`";
                }
                return this.text.replace(/hex\s*(?:`|\(""")\s*([a-fA-F0-9]*)\s*(?:`|"""\))\s*(?:;?)/m, hexString);
            }
            getFieldEditorId() {
                return fieldEditorId;
            }
            getOptions() {
                return {
                    blocksInfo: this.host.blocksInfo()
                };
            }
        }
        editor.MonacoSongEditor = MonacoSongEditor;
        function createFakeAsset(song) {
            return {
                type: "song" /* pxt.AssetType.Song */,
                id: "",
                internalID: 0,
                meta: {},
                song
            };
        }
        editor.songEditorDefinition = {
            id: fieldEditorId,
            foldMatches: true,
            glyphCssClass: "fas fa-music sprite-focus-hover",
            heightInPixels: 510,
            matcher: {
                /**
                 * This is horrendous-looking regex matches both the asset reference syntax:
                 *     assets.song`name`
                 *     assets.song("""name""")
                 *
                 * and the hex-literal syntax:
                 *     music.createSong(hex`01234`
                 *     music.create_song(hex("""01234""")
                 *
                 * For the hex literal matches, it includes the call to music.createSong since
                 * hex buffers can also be used for other things
                 */
                searchString: "(?:(?:assets\\s*\\.\\s*song)|(?:music\\s*\\.\\s*create(?:S|_s)ong\\s*\\(\\s*hex))\\s*(?:`|\\(\\s*\"\"\")(?:(?:[^(){}:\\[\\]\"';?/,+\\-=*&|^%!`~]|\\n)*)\\s*(?:`|\"\"\"\\s*\\))",
                isRegex: true,
                matchCase: true,
                matchWholeWord: false
            },
            proto: MonacoSongEditor
        };
        editor.registerMonacoFieldEditor(fieldEditorId, editor.songEditorDefinition);
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
/// <reference path="./monacoFieldEditor.ts" />
/// <reference path="./field_react.ts" />
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        const fieldEditorId = "soundeffect-editor";
        // music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear
        class MonacoSoundEffectEditor extends editor.MonacoReactFieldEditor {
            textToValue(text) {
                const out = defaultSound();
                this.value = out;
                const argMatch = /\(([^)]*)\)/.exec(text);
                const args = argMatch[1].split(",").map(a => a.replace(/\s/g, ""));
                if (args.length !== 8)
                    return out;
                switch (args[0]) {
                    case "WaveShape.Sawtooth":
                        out.wave = "sawtooth";
                        break;
                    case "WaveShape.Square":
                        out.wave = "square";
                        break;
                    case "WaveShape.Noise":
                        out.wave = "noise";
                        break;
                    case "WaveShape.Triangle":
                        out.wave = "triangle";
                        break;
                    case "WaveShape.Sine":
                    default:
                        out.wave = "sine";
                        break;
                }
                const withDefault = (val, def) => {
                    return isNaN(val) ? def : val;
                };
                out.startFrequency = withDefault(parseInt(args[1]), out.startFrequency);
                out.endFrequency = withDefault(parseInt(args[2]), out.endFrequency);
                out.startVolume = withDefault(parseInt(args[3]), out.startVolume);
                out.endVolume = withDefault(parseInt(args[4]), out.endVolume);
                out.duration = withDefault(parseInt(args[5]), out.duration);
                switch (args[6]) {
                    case "SoundExpressionEffect.Vibrato":
                        out.effect = "vibrato";
                        break;
                    case "SoundExpressionEffect.Tremolo":
                        out.effect = "tremolo";
                        break;
                    case "SoundExpressionEffect.Warble":
                        out.effect = "warble";
                        break;
                    case "SoundExpressionEffect.None":
                    default:
                        out.effect = "none";
                        break;
                }
                switch (args[7]) {
                    case "InterpolationCurve.Logarithmic":
                        out.interpolation = "logarithmic";
                        break;
                    case "InterpolationCurve.Curve":
                        out.interpolation = "curve";
                        break;
                    case "InterpolationCurve.Linear":
                    default:
                        out.interpolation = "linear";
                        break;
                }
                return out;
            }
            resultToText(result) {
                result = this.value;
                let waveShape;
                switch (result.wave) {
                    case "sine":
                        waveShape = "WaveShape.Sine";
                        break;
                    case "square":
                        waveShape = "WaveShape.Square";
                        break;
                    case "triangle":
                        waveShape = "WaveShape.Triangle";
                        break;
                    case "noise":
                        waveShape = "WaveShape.Noise";
                        break;
                    case "sawtooth":
                        waveShape = "WaveShape.Sawtooth";
                        break;
                }
                let effect;
                switch (result.effect) {
                    case "vibrato":
                        effect = "SoundExpressionEffect.Vibrato";
                        break;
                    case "tremolo":
                        effect = "SoundExpressionEffect.Tremolo";
                        break;
                    case "warble":
                        effect = "SoundExpressionEffect.Warble";
                        break;
                    case "none":
                        effect = "SoundExpressionEffect.None";
                        break;
                }
                let interpolation;
                switch (result.interpolation) {
                    case "curve":
                        interpolation = "InterpolationCurve.Curve";
                        break;
                    case "linear":
                        interpolation = "InterpolationCurve.Linear";
                        break;
                    case "logarithmic":
                        interpolation = "InterpolationCurve.Logarithmic";
                        break;
                }
                return `music.createSoundEffect(${waveShape}, ${Math.round(result.startFrequency)}, ${Math.round(result.endFrequency)}, ${Math.round(result.startVolume)}, ${Math.round(result.endVolume)}, ${Math.round(result.duration)}, ${effect}, ${interpolation})`;
            }
            getFieldEditorId() {
                return fieldEditorId;
            }
            getOptions() {
                return {
                    onClose: () => this.fv.hide(),
                    onSoundChange: (newValue) => this.value = newValue,
                    initialSound: this.value,
                    useFlex: true,
                    useMixerSynthesizer: pxt.appTarget.id !== "microbit" // FIXME
                };
            }
        }
        editor.MonacoSoundEffectEditor = MonacoSoundEffectEditor;
        function validateRange(range, model) {
            let currentLine = range.startLineNumber;
            let currentColumn = 0;
            let foundStart = false;
            let parenCount = 0;
            const methodName = "createSoundEffect";
            const totalLines = model.getLineCount();
            while (currentLine < totalLines) {
                const lineContent = model.getLineContent(currentLine);
                const startIndex = lineContent.indexOf(methodName);
                if (startIndex !== -1) {
                    foundStart = true;
                    currentColumn = startIndex + methodName.length;
                }
                if (foundStart) {
                    while (currentColumn < lineContent.length) {
                        const currentChar = lineContent.charAt(currentColumn);
                        if (currentChar === "(") {
                            parenCount++;
                        }
                        else if (currentChar === ")") {
                            parenCount--;
                            if (parenCount === 0) {
                                return new monaco.Range(range.startLineNumber, range.startColumn, currentLine, currentColumn + model.getLineMinColumn(currentLine) + 1);
                            }
                        }
                        currentColumn++;
                    }
                }
                currentColumn = 0;
                currentLine++;
            }
            return undefined;
        }
        function defaultSound() {
            return {
                wave: "sine",
                startFrequency: 5000,
                endFrequency: 0,
                startVolume: 255,
                endVolume: 0,
                duration: 500,
                effect: "none",
                interpolation: "linear"
            };
        }
        editor.soundEditorDefinition = {
            id: fieldEditorId,
            foldMatches: true,
            glyphCssClass: "fas fa-music sprite-focus-hover",
            heightInPixels: 510,
            matcher: {
                // match both JS and python
                searchString: "music\\s*\\.\\s*createSoundEffect\\s*\\(",
                isRegex: true,
                matchCase: true,
                matchWholeWord: false,
                validateRange
            },
            proto: MonacoSoundEffectEditor
        };
        editor.registerMonacoFieldEditor(fieldEditorId, editor.soundEditorDefinition);
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
/// <reference path="./monacoFieldEditor.ts" />
/// <reference path="./field_react.ts" />
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        const fieldEditorId = "image-editor";
        class MonacoSpriteEditor extends editor.MonacoReactFieldEditor {
            textToValue(text) {
                this.isPython = text.indexOf("`") === -1;
                const match = pxt.parseAssetTSReference(text);
                if (match) {
                    const { type, name: matchedName } = match;
                    const name = matchedName.trim();
                    const project = pxt.react.getTilemapProject();
                    this.isAsset = true;
                    const asset = project.lookupAssetByName("image" /* pxt.AssetType.Image */, name);
                    if (asset) {
                        return asset;
                    }
                    else {
                        const newAsset = project.createNewImage();
                        if (name && !project.isNameTaken("image" /* pxt.AssetType.Image */, name) && pxt.validateAssetName(name)) {
                            newAsset.meta.displayName = name;
                        }
                        return newAsset;
                    }
                }
                return createFakeAsset(pxt.sprite.imageLiteralToBitmap(text));
            }
            resultToText(result) {
                var _a;
                if ((_a = result.meta) === null || _a === void 0 ? void 0 : _a.displayName) {
                    const project = pxt.react.getTilemapProject();
                    if (this.isAsset || project.lookupAsset(result.type, result.id)) {
                        result = project.updateAsset(result);
                    }
                    else {
                        result = project.createNewProjectImage(result.bitmap, result.meta.displayName);
                    }
                    this.isAsset = true;
                    return pxt.getTSReferenceForAsset(result, this.isPython);
                }
                return pxt.sprite.bitmapToImageLiteral(pxt.sprite.Bitmap.fromData(result.bitmap), this.isPython ? "python" : "typescript");
            }
            getFieldEditorId() {
                return "image-editor";
            }
            getOptions() {
                return {
                    initWidth: 16,
                    initHeight: 16,
                    blocksInfo: this.host.blocksInfo()
                };
            }
        }
        editor.MonacoSpriteEditor = MonacoSpriteEditor;
        function createFakeAsset(bitmap) {
            return {
                type: "image" /* pxt.AssetType.Image */,
                id: "",
                internalID: 0,
                bitmap: bitmap.data(),
                meta: {},
                jresData: ""
            };
        }
        editor.spriteEditorDefinition = {
            id: fieldEditorId,
            foldMatches: true,
            glyphCssClass: "sprite-editor-glyph sprite-focus-hover",
            heightInPixels: 510,
            matcher: {
                // match both JS and python
                searchString: "(?:img|assets\\s*\\.\\s*image)\\s*(?:`|\\(\\s*\"\"\")(?:(?:[^(){}:\\[\\]\"';?/,+\\-=*&|^%!`~]|\\n)*)\\s*(?:`|\"\"\"\\s*\\))",
                isRegex: true,
                matchCase: true,
                matchWholeWord: false
            },
            proto: MonacoSpriteEditor
        };
        editor.registerMonacoFieldEditor(fieldEditorId, editor.spriteEditorDefinition);
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
/// <reference path="./monacoFieldEditor.ts" />
/// <reference path="./field_react.ts" />
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        const fieldEditorId = "tilemap-editor";
        class MonacoTilemapEditor extends editor.MonacoReactFieldEditor {
            textToValue(text) {
                const tm = this.readTilemap(text);
                const project = pxt.react.getTilemapProject();
                pxt.sprite.addMissingTilemapTilesAndReferences(project, tm);
                return tm;
            }
            readTilemap(text) {
                const project = pxt.react.getTilemapProject();
                if (/^\s*tiles\s*\./.test(text)) {
                    this.isTilemapLiteral = false;
                    if (text) {
                        try {
                            const data = pxt.sprite.decodeTilemap(text, "typescript", project);
                            return createFakeAsset(data);
                        }
                        catch (e) {
                            // If the user is still typing, they might try to open the editor on an incomplete tilemap
                        }
                        return null;
                    }
                }
                this.isTilemapLiteral = true;
                // This matches the regex for the field editor, so it should always match
                const match = /^\s*(tilemap(?:8|16|32)?)\s*(?:`([^`]*)`)|(?:\(\s*"""([^"]*)"""\s*\))\s*$/.exec(text);
                const name = (match[2] || match[3] || "").trim();
                this.tilemapLiteral = match[1];
                let proj;
                let id;
                if (name) {
                    id = ts.pxtc.escapeIdentifier(name);
                    proj = project.getTilemap(id) || project.lookupAssetByName("tilemap" /* AssetType.Tilemap */, name);
                }
                if (!proj) {
                    let tileWidth = 16;
                    if (this.tilemapLiteral === "tilemap8") {
                        tileWidth = 8;
                    }
                    else if (this.tilemapLiteral === "tilemap32") {
                        tileWidth = 32;
                    }
                    const [name] = project.createNewTilemap(id, tileWidth, 16, 16);
                    proj = project.getTilemap(name);
                    id = name;
                }
                return proj;
            }
            resultToText(asset) {
                const project = pxt.react.getTilemapProject();
                project.pushUndo();
                pxt.sprite.updateTilemapReferencesFromResult(project, asset);
                if (this.isTilemapLiteral) {
                    project.updateAsset(asset);
                    return pxt.getTSReferenceForAsset(asset, this.fileType === "python");
                }
                else {
                    return pxt.sprite.encodeTilemap(asset.data, this.fileType === "typescript" ? "typescript" : "python");
                }
            }
            getFieldEditorId() {
                return "tilemap-editor";
            }
            getOptions() {
                return {
                    initWidth: 16,
                    initHeight: 16,
                    blocksInfo: this.host.blocksInfo()
                };
            }
            getCreateTilemapRange() {
                const start = this.editrange.getStartPosition();
                let current = this.editrange.getEndPosition();
                let range;
                let openParen = 1;
                while (true) {
                    range = new monaco.Range(current.lineNumber, current.column, current.lineNumber + 1, 0);
                    const line = this.host.getText(range);
                    for (let i = 0; i < line.length; i++) {
                        if (line.charAt(i) === "(") {
                            openParen++;
                        }
                        else if (line.charAt(i) === ")") {
                            openParen--;
                            if (openParen === 0) {
                                const end = new monaco.Position(current.lineNumber, current.column + i + 2);
                                return monaco.Range.fromPositions(start, end);
                            }
                        }
                    }
                    current = range.getEndPosition();
                    if (current.lineNumber > start.lineNumber + 20) {
                        return null;
                    }
                }
            }
        }
        editor.MonacoTilemapEditor = MonacoTilemapEditor;
        function createFakeAsset(data) {
            return {
                type: "tilemap" /* pxt.AssetType.Tilemap */,
                id: "",
                internalID: 0,
                meta: {},
                data
            };
        }
        editor.tilemapEditorDefinition = {
            id: fieldEditorId,
            foldMatches: true,
            alwaysBuildOnClose: true,
            glyphCssClass: "sprite-focus-hover ms-Icon ms-Icon--Nav2DMapView",
            heightInPixels: 510,
            weight: 5,
            matcher: {
                // match both JS and python
                searchString: "(?:tilemap(?:8|16|32)?\\s*(?:`|\\(\"\"\")(?:[ a-zA-Z0-9_]|\\n)*\\s*(?:`|\"\"\"\\)))|(?:tiles\\s*\\.\\s*createTilemap\\s*\\([^\\)]+\\))",
                isRegex: true,
                matchCase: true,
                matchWholeWord: false
            },
            proto: MonacoTilemapEditor
        };
        editor.registerMonacoFieldEditor(fieldEditorId, editor.tilemapEditorDefinition);
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
