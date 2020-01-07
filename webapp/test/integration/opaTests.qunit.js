/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/sap/upl/GRADeliveryorder/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});