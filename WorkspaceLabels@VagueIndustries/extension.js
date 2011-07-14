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

        // Initialize the set of workspace labels
        this.labels = [];
        for (let i=0; i < global.screen.n_workspaces; i++) {
            this.labels[i] = "Workspace " + (i+1).toString();
        }

        // Create the primary visual element
        this._label = new St.Label({ text: 'Workspace Label',
                                     style_class: 'workspace-label' });
        this.actor.set_child(this._label);

        // Create the Pop-Out layout
        this._layout = new St.BoxLayout({ name: 'workspaceLabel',
                                          style_class: 'workspace-layout'});
        //this._layout.set_psuedo_style_class('workspace-layout');
        this.menu.addActor(this._layout);

        // Create the Text Entry
        this._entry = new St.Entry({ style_class: 'workspace-entry' });
        this._layout.add(this._entry);

        // Set the label to be responsive to <ESC> and <CR>
        this._entry.clutter_text.connect('key-press-event', Lang.bind(this, this._onKeyPressEvent));

        // When we lose focus: Close the editing window
        this._entry.clutter_text.connect('key-focus-out', Lang.bind(this, this.close));

        // Add the label to the center of the Top Bar / Panel
        Main.panel._centerBox.add(this.actor, { x_fill: true, y_fill: true } );

        // Hook up to workspace modification events
        global.screen.connect_after('workspace-added', Lang.bind(this, this._updateOnAdd));
        global.screen.connect_after('workspace-removed', Lang.bind(this, this._updateOnRemove));
        global.screen.connect_after('workspace-switched', Lang.bind(this, this._updateOnSwitch));

        // Destroy when necessary
        this.actor.connect_after('destroy', Lang.bind(this, this._onDestroy));

        // Initialize our focus references
        this._lastFocus = undefined;
        this._lastFocusMode = undefined;

        // Sync our labels with the workspace
        this._syncLabel();

    },

    _syncLabel: function() {
        /*
         * Match the workspace label with the displayed workspace.
         */

        // Figure out which workspace we are in.
        let curIndex = global.screen.get_active_workspace().index();

        // Update the label
        this._label.set_text(this.labels[curIndex]);
    },

    _setLabel: function(newText) {
        /*
         * Set the label text so it is stored in our little database.
         */
        // Figure out which workspace we are in.
        let curIndex = global.screen.get_active_workspace().index();

        // Save it in our database
        this.labels[curIndex] = newText;

        // Set the label to the new text
        this._label.set_text(newText);
    },

    _onButtonPress: function(actor, event) {
        this.toggle();
        return true;
    },

    _onKeyPressEvent: function(actor, event) {
        if ( (event.get_key_symbol() == Clutter.Escape) ||
             (event.get_key_symbol() == Clutter.Return) ) {
            this.close();
            return true;
        }

        // Make the entry text match the label text
        let newText = this._entry.get_text();
        this._setLabel(newText);

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

        // Save the focus state
        this._lastFocus = global.stage.get_key_focus();
        this._lastFocusMode = global.stage_input_mode;
        
        // Redirect the focus
        global.stage_input_mode = Shell.StageInputMode.FOCUSED;
        this._entry.grab_key_focus();
        global.stage.set_key_focus(this._entry);

        // Now open up the menu.
        this.menu.open();
    },

    close: function() {
        // Make the entry text match the label text
        let newText = this._entry.get_text();
        this._setLabel(newText);

        // Restore the old focus state
        // ToDo: This doesn't work!?
        global.stage.set_key_focus(this._lastFocus);
        global.stage_input_mode = this._lastFocusMode;

        // Tell the menu to close back up.
        this.menu.close();
    },

    _updateOnSwitch: function() {
        global.log("Workspace Switch");
        this._syncLabel();
        return false;
    },

    _updateOnRemove: function() {
        global.log("Workspace Remove");
        return false;
    },

    _updateOnAdd: function() {
        global.log("Workspace Add");

        // Figure out how many workspaces there are.
        totalWorkspaces = global.screen.n_workspaces;
        this.labels[totalWorkspaces] = "Workspace " + (totalWorkspaces+1).toString();
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
