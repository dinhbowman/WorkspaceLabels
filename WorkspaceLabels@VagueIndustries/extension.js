/*
 * Editiable Workspace Labels
 *
 *  by: Dinh Bowman
 *
 */

// Basic Imports
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const Mainloop = imports.mainloop;

// UI Elements
const BoxPointer = imports.ui.boxpointer;
const PanelMenu = imports.ui.panelMenu;
const Main = imports.ui.main;


/* Widget Object Definition */
function WorkSpaceLabel() {
    this._init();
}

WorkSpaceLabel.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        // Call the base class's init.
        let menuAlignment = 0.25
        PanelMenu.Button.prototype._init.call(this, menuAlignment);

        // Configure actor basics
        this.actor._delegate = this;
        this.menu.passEvents = true;
        this.actor.y_fill = true;

        // Create the primary visual element
        this._label = new St.Label({ text: 'Workspace Label',
                                     style_class: 'workspace-label' });
        this.actor.set_child(this._label);

        // Create the Pop-Out layout
        this._layout = new St.BoxLayout({ name: 'workspaceLabel' });
        this.menu.addActor(this._layout);

        // Create the Text Entry
        this._entry = new St.Entry();
        this._layout.add(this._entry);

        // Set the label to be responsive to <ESC> and <CR>
        this._entry.clutter_text.connect('key-press-event', Lang.bind(this, this._onKeyPressEvent));

        // Add the label to the center of the Top Bar / Panel
        Main.panel._centerBox.add(this.actor, { x_fill: true, y_fill: true } );

        // Hook up to workspace modification events
        global.screen.connect_after('workspace-added', Lang.bind(this, this._updateOnAdd));
        global.screen.connect_after('workspace-removed', Lang.bind(this, this._updateOnRemove));
        global.screen.connect_after('workspace-switched', Lang.bind(this, this._updateOnSwitch));
    },

    _onButtonPress: function(actor, event) {
        global.log("ButtonPress");
        this._entry.grab_key_focus();
        global.stage.set_key_focus(this._entry);
        this.toggle();
        return true;
    },

    _onKeyPressEvent: function(actor, event) {
        global.log("KeyPressEvent");
        if ( (event.get_key_symbol() == Clutter.Escape) ||
             (event.get_key_symbol() == Clutter.Return) ) {
            this.close();
            return true;
        }

        // Make the entry text match the label text
        let newText = this._entry.get_text();
        this._label.set_text(newText);

        return false;
    },

    toggle: function() {
        if ( this.menu.isOpen == false ) {
            this.open();
        } else {
            this.close();
        }
    },

    open: function() {
        // Make the entry text match the label text
        let newText = this._label.get_text();
        this._entry.set_text(newText);
        this.menu.open();
    },

    close: function() {
        // Make the entry text match the label text
        let newText = this._entry.get_text();
        this._label.set_text(newText);
        this.menu.close();
    },

    _updateOnSwitch: function() {
        global.log("Workspace Switch");
        return false;
    },

    _updateOnRemove: function() {
        global.log("Workspace Remove");
        return false;
    },

    _updateOnAdd: function() {
        global.log("Workspace Add");
        return false;
    },

    _onDestroy: function() {
        global.log("Destroy");
    }
}

// Main extension initialization
function main(extensionMetaData) {
    new WorkSpaceLabel();
}
