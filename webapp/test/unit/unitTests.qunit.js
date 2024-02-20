/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsap/excel_export_import/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
