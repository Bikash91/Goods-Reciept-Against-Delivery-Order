sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/upl/GRADeliveryorder/model/models",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("com.sap.upl.GRADeliveryorder.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var oModel = new JSONModel({
				busy: false,
				enablePo: true,
				visiblePoData: false,
				editablePOData: true,
				enablePost: false,
				enableAddLineItem: false,
				enableDeleteLineItem: false,
				batchVisible: false,
				lineItemData: []
			});
			this.setModel(oModel, "settingsModel");
			this.getModel("settingsModel").refresh();
			this.getModel("settingsModel").updateBindings();

			var deliveryData = new JSONModel({
				DONUMBER: "",
				DOITEMNUM: "",
				PLANT: "",
				STORAGELOC: "",
				QUANTITY: "",
				UNIT: "",
				SOURCEBIN: "",
				BATCH: "",
				ITEMCODE: "",
				WAREHOUSE: ""
			});
			this.setModel(deliveryData, "deliveryModel");
			this.getModel("deliveryModel").refresh();
			this.getModel("deliveryModel").updateBindings();

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});