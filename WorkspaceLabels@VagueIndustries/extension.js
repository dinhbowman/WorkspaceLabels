/*
 * Editiable Workspace Labels
 *
 *  by: Dinh Bowman
 *
 */

const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Shell = imports.gi.Shell;

const Main = imports.ui.main;


/* Object Definition */
function WorkSpaceLabel() {
    this._init();
}

WorkSpaceLabel.prototype = {

    _init: function() {

        // Create the primary visual element
        this._label = new St.Label( { text: 'Hello World',
                                      style_class: 'workspace-label' });

        // Set the label to be responsive to clicks
        this._label.reactive = true
        this._label.connect('button-release-event', Lang.bind(this, this._onClick));

        // Add the label to the center of the Top Bar / Panel
        Main.panel._centerBox.add(this._label, { x_fill: true, y_fill: true } );

        // Hook up to workspace modification events
        global.screen.connect_after('workspace-added', Lang.bind(this, this._updateOnAdd));
        global.screen.connect_after('workspace-removed', Lang.bind(this, this._updateOnRemove));
        global.screen.connect_after('workspace-switched', Lang.bind(this, this._updateOnSwitch));
    },

    _onClick: function() {

    },

    _updateOnSwitch: function() {


    },

    _updateOnRemove: function() {
    },

    _updateOnAdd: function() {

    },

    _onDestroy: function() {
    }
}

function _showHello() {
    let text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
    let monitor = global.get_primary_monitor();
    global.stage.add_actor(text);
    text.set_position(Math.floor (monitor.width / 2 - text.width / 2), Math.floor(monitor.height / 2 - text.height / 2));
    Mainloop.timeout_add(3000, function () { text.destroy(); });
}

// Main extension initialization
function main(extensionMetaData) {
    //Main.panel.actor.reactive = true;
    //Main.panel.actor.connect('button-release-event', _showHello);

    new WorkSpaceLabel();
}
