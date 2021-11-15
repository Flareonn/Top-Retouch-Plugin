const APP_EXTENSION_ID = "TransitionsPack";
const HOST_JSX_PATH = '/jsx/';

/**
 * App Class
 */
class App extends AppExt {
    /**
     *
     */
    constructor() {
        super(APP_EXTENSION_ID, HOST_JSX_PATH);
    }

    loadHostScripts() {

    }

    /**
     * on page load event
     */
    onLoad() {
        super.onLoad();

    }
}

/**
 * App instance
 * @type {App}
 */
 app = new App();