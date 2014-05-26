/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global $, define, brackets */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit             = brackets.getModule("utils/AppInit"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        FileIndexManager    = brackets.getModule("project/FileIndexManager"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        Menus               = brackets.getModule("command/Menus"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem"),
        NodeConnection      = brackets.getModule("utils/NodeConnection"),
		NodeDomain			= brackets.getModule("utils/NodeDomain"),
        ProjectManager      = brackets.getModule("project/ProjectManager");
    
    var nodeConnection,
		domain = new NodeDomain('docco', ExtensionUtils.getModulePath(module, "node/DoccoDomain"));
    
    var contextMenu     = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
		selectedEntry	= null,
        menuItems       = [],
        buildMenuItem   = null,
		RUN_DOCCO_CMD	= "run.docco";
    
    // Helper function that chains a series of promise-returning
    // functions together via their done callbacks.
    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        if (functions.length > 0) {
            var firstFunction = functions.shift();
            var firstPromise = firstFunction.call();
            firstPromise.done(function () {
                chain.apply(null, functions);
            });
        }
    }
	
	function runHandler() {
		
		domain.exec("runDocco", selectedEntry.fullPath, ProjectManager.getProjectRoot().fullPath)
			.fail(function (err) {
				console.error("[brackets-docco] failed to run docco", err);
			})
			.done(function (result) {
				console.log("[brackets-docco] done.");
			});
	}
    
    AppInit.appReady(function () {
        
        nodeConnection = new NodeConnection();
        
        // Helper function that tries to connect to node
        function connect() {
            var connectionPromise = nodeConnection.connect(true);
            
            connectionPromise.fail(function () {
                console.error("[brackets-docco] failed to connect to node");
            });
            
            return connectionPromise;
        }
        
        // Helper function that loads our domain into the node server
        function loadDoccoDomain() {
            var path        = ExtensionUtils.getModulePath(module, "node/DoccoDomain"),
                loadPromise = nodeConnection.loadDomains([path], true);
            
            loadPromise.fail(function () {
                console.log("[brackets-docco] failed to load docco domain");
            });
            
            return loadPromise;
        }
        
        $(nodeConnection).on("docco.complete", function (evt, data) {
            console.log("Docco command complete with success.");
        });
		
		$(nodeConnection).on("docco.failed", function (evt, data) {
            console.log("Docco command failed.");
        });

        chain(connect, loadDoccoDomain);
		
    });
        
    $(contextMenu).on("beforeContextMenuOpen", function (evt) {
        selectedEntry = ProjectManager.getSelectedItem();
	});

	CommandManager.register("Run Docco", RUN_DOCCO_CMD, runHandler);
	
	contextMenu.addMenuItem(RUN_DOCCO_CMD, "", Menus.LAST);
});