const DEFAULT_HOST_JSX_PATH = "/host/scripts/";

let DEBUG = true;

class StringHelpersClass {
    replaceAll(str, search, replace) {
        return str.split(search).join(replace);
    }
}

const StringHelpers = new StringHelpersClass();

/**
 * Debug front logger helper
 * Log messages to console
 */
class Logger {
    constructor(name) {
        this.name = name;
    }

    ___log___(caption, msg, object = null) {
        if (DEBUG) {
            console.log(`${caption} | ${this.name}`)
            console.log(msg)
            if (object !== null) console.log(object)
        }
    }

    /**
     * log message
     * @param msg
     * @param object
     */
    logDebug(msg, object = null) {
        this.___log___('___DEBUG___', msg, object);
    }

    /**
     * log error
     * @param msg
     * @param err
     */
    logDebugError(msg, err = null) {
        this.___log___('___DEBUG___ERROR___', msg, err);
    }
}

/**
 * Base App Class for extension panel
 */
class AppExt {
    /**
     * Constructor
     * @param {string} appID
     * @param {string} hostJSX path to host jsx scripts
     */
    constructor(appID = "AppExt", hostJSX = DEFAULT_HOST_JSX_PATH) {
        this.extensionId = appID;
        this.logger = new Logger(appID);
        this.hostJSX = hostJSX;
        this.isPersistent = true;
        this.state = {
            jsxLoaded: []
        };
    }

    /**
     * Change panel persistent state
     */
    persistent() {
        if (this.csInterface) {
            let event = null;

            if (this.isPersistent) {
                event = new CSEvent("com.adobe.PhotoshopPersistent", "APPLICATION");
            } else {
                event = new CSEvent("com.adobe.PhotoshopUnPersistent", "APPLICATION");
            }

            event.extensionId = this.extensionId;
            this.csInterface.dispatchEvent(event);
        }
    }

    /**
     * on page load event
     */
    onLoad() {
        try {
            this.csInterface = new CSInterface();
            this.panelRoot = this.csInterface.getSystemPath(SystemPath.EXTENSION);
            this.extensionRoot = this.panelRoot + this.hostJSX;
            this.persistent();
            this.logger.logDebug('csInterface init', this.csInterface)
        } catch (err) {
            this.logger.logDebugError("onLoad csInterface init error", err);
        }
    }

    /**
     * Evaluates a JavaScript script, which can use the JavaScript DOM
     * of the host application.
     *
     * @param script The JavaScript script.
     * @param callback Optional. A callback function that receives the result of execution.
     *          If execution fails, the callback function receives the error message \c EvalScript_ErrMessage.
     */
    evalHostScript(script, callback = null) {
        try {
            this.csInterface.evalScript(script, (executionResult) => {
                this.logger.logDebug("evalHostScript done", executionResult);
                if (callback !== null && callback !== undefined) {
                    callback(executionResult);
                }
            });
        } catch (err) {
            this.logger.logDebugError("evalHostScript call error", err);
        }
    }

    /**
     *
     * @param scriptPath
     * @param callback
     */
    evalHostScriptFile(scriptPath, callback = null) {
        const jsxFullPath = `${this.extensionRoot}/${scriptPath}`;
        StringHelpers.replaceAll(jsxFullPath, "///", "/");
        StringHelpers.replaceAll(jsxFullPath, "//", "/");

        const jsx = `$._ext.evalFile("${jsxFullPath}")`;
        this.evalHostScript(jsx, callback);
    }

    /**
     *
     * @param scriptPath
     * @param callback
     * @param force
     */
    loadHostScriptFile(scriptPath, callback = null, force = false) {
        if (force || !this.state.jsxLoaded.includes(scriptPath)) {
            this.evalHostScriptFile(scriptPath, callback);
            this.state.jsxLoaded.push(scriptPath);
        }
    }

    /**
     * open url in default browser
     * @param {string} url
     */
    openURL(url) {
        this.csInterface.openURLInDefaultBrowser(url);
    }
}