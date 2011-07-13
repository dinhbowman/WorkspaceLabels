#!/usr/bin/python
#
# Copyright (c) 2011 Finnbarr P. Murphy
#
# This utility is free software. You can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 2 of
# the License, or (at your option) any later version.
#
# This utility is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# See <http://www.gnu.org/licenses/> for full text of the license.
#
 
import os.path
import json
 
from gi.repository import Gio
from gi.repository import GLib
 
state = { 1:"enabled", 2:"disabled", 3:"error", 4:"out of date"}
type  = { 1:"system", 2:"per user"}
 
class GnomeShell:
 
    def __init__(self):
        d = Gio.bus_get_sync(Gio.BusType.SESSION, None)
        self._proxy = Gio.DBusProxy.new_sync(
                            d, 0, None,
                            'org.gnome.Shell',
                            '/org/gnome/Shell',
                            'org.gnome.Shell',
                            None)
 
    def execute_javascript(self, js):
        result, output = self._proxy.Eval('(s)', js)
        if not result:
            raise Exception(output)
        return output
 
    def list_extensions(self):
        out = self.execute_javascript('const ExtensionSystem = imports.ui.extensionSystem; ExtensionSystem.extensionMeta')
        return json.loads(out)
 
    def get_shell_version(self):
        out = self.execute_javascript('const Config = imports.misc.config; version = Config.PACKAGE_VERSION')
        return out
 
    def get_gjs_version(self):
        out = self.execute_javascript('const Config = imports.misc.config; version = Config.GJS_VERSION')
        return out
 
if __name__ == "__main__":
    s = GnomeShell()
 
    print
    print "Shell Version:", s.get_shell_version()
    print "  GJS Version:",  s.get_gjs_version()
    print
 
    l = s.list_extensions()
    for k, v in l.iteritems():
        print 'Extension: %s' % k
        print "-" * (len(k) + 11)
        for k1, v1 in v.iteritems():
            if k1 == 'state':
                print '%15s: %s (%s)' % (k1, v1, state[v1])
            elif k1 == 'type':
                print '%15s: %s (%s)' % (k1, v1, type[v1])
            elif k1 == 'shell-version':
                print '%15s:' % k1,
                print ", ".join(v1)
            else:
                print '%15s: %s' % (k1, v1)
        print

