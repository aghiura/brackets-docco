/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, node: true */
/*global brackets */

(function () {
    "use strict";
    
    var domainManager = null,
		output = "",
		exec = require("child_process").exec;
    
    function runDocco(srcFullPath, outputFullPath) {
				
		var cmd = 'docco ' + srcFullPath + ' -o ' + outputFullPath + 'docs/',
			docco = exec(cmd);
		
		console.log("Running Docco, please wait...");
        console.log(cmd);
        
		docco.stdout.on('data', function (data) {
		});
		
		docco.stderr.on('data', function (data) {
		});
		
		docco.on('close', function (code) {
		});
    }
    
    function init(dm) {
        domainManager = dm;
        
        if (!domainManager.hasDomain("docco")) {
            domainManager.registerDomain("docco", {major: 0, minor: 1});
        }
        
        domainManager.registerCommand(
            "docco",								// domain name
            "runDocco",								// command name
            runDocco,								// command handler
            true,
            "Runs Docco on a specific file and generates an html id docs dir",
            ["file", "output"],						// parameters
            [{name: "result",
                type: "string",
                description: "The result of the execution"}]
        );
        
        domainManager.registerEvent(
            "docco",
            "complete",
            [{name: "data", type: "string"}]
        );
    }
    
    exports.init = init;
    
}());