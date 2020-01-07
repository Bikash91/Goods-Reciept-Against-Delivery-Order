sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"com/sap/upl/GRADeliveryorder/controller/scanner"
], function (Controller, MessageBox, JSONModel, Device) {
	"use strict";

	return Controller.extend("com.sap.upl.GRADeliveryorder.controller.GRDeliveryorder", {
		onInit: function () {
			this.onlyNumber(this.byId("donumber"));
			this.path = "/sap/fiori/zgradeliveryorder/" + this.getOwnerComponent().getModel("soundModel").sServiceUrl +
				"/SoundFileSet('sapmsg1.mp3')/$value";
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("warehouse").focus();
			});
		},

		onAfterRendering: function () {
			this.onlyNumber(this.byId("donumber"));
			this.path = "/sap/fiori/zgradeliveryorder/" + this.getOwnerComponent().getModel("soundModel").sServiceUrl +
				"/SoundFileSet('sapmsg1.mp3')/$value";
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("warehouse").focus();
			});
		},

		handleValueHelpRequest: function (oEvent) {
			this.sInputValue = oEvent.getSource();
			this.inputIdMat = oEvent.getSource().getId().split("--")[1];
			var oPath = oEvent.getSource().getBindingInfo("suggestionItems").path;
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"com.sap.upl.GRADeliveryorder.fragments.SearchHelp",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			this._setListBinding(oPath, this.inputIdMat);
			this._valueHelpDialog.open();
		},

		_setListBinding: function (oPath, idInput) {

			switch (idInput) {
			case "storageBin":
				this.id = "storageBin";
				this.title = "BIN";
				this.desc = "WAREHOUSE";
				this.text = "BIN";
				break;
			default:
				return;
			}
			var oTemplate = new sap.m.StandardListItem({
				title: "{" + this.title + "}",
				description: "{" + this.desc + "}"
			});

			var aTempFlter = [];
			aTempFlter.push(new sap.ui.model.Filter([
					new sap.ui.model.Filter("WAREHOUSE", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/WAREHOUSE"))
				],
				true));
			this._valueHelpDialog.bindAggregation("items", oPath, oTemplate);
			this._valueHelpDialog.getBinding("items").filter(aTempFlter);

			this._valueHelpDialog.setTitle(this.text);
		},

		onOk: function (oEvent) {
			debugger;
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.sKey = oSelectedItem.getTitle();
				if (this.id === "storageBin") {
					this.getOwnerComponent().getModel("deliveryModel").setProperty(
						"/SOURCEBIN", this.sKey);
					jQuery.sap.delayedCall(400, this, function () {
						document.activeElement.blur();
					});
				}
			}
			this.sInputValue.setValueStateText("");
			this.sInputValue.setValueState("None");

			if (this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/WAREHOUSE") != "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/PLANT") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/ITEMCODE") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/BATCH") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/QUANTITY") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/SOURCEBIN") !== "") {
				this.checkField();
			}
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = [];
			if (sValue) {
				oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("WAREHOUSE", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
							"/WAREHOUSE")),
						new sap.ui.model.Filter(this.title, sap.ui.model.FilterOperator.Contains, sValue)
					],
					true));
				evt.getSource().getBinding("items").filter(oFilter);
			} else {
				oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("WAREHOUSE", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
							"/WAREHOUSE"))
					],
					true));
				evt.getSource().getBinding("items").filter(oFilter);
			}

		},

		onlyNumber: function (element) {
			element.attachBrowserEvent("keydown", (function (e) {
				var isModifierkeyPressed = (e.metaKey || e.ctrlKey || e.shiftKey);
				var isCursorMoveOrDeleteAction = ([46, 8, 37, 38, 39, 40, 9].indexOf(e.keyCode) !== -1);
				var isNumKeyPressed = (e.keyCode >= 48 && e.keyCode <= 58) || (e.keyCode >= 96 && e.keyCode <= 105);
				var vKey = 86,
					cKey = 67,
					aKey = 65;
				switch (true) {
				case isCursorMoveOrDeleteAction:
				case isModifierkeyPressed === false && isNumKeyPressed:
				case (e.metaKey || e.ctrlKey) && ([vKey, cKey, aKey].indexOf(e.keyCode) !== -1):
					break;
				default:
					e.preventDefault();
				}
			}));
		},

		onChange: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
			if (oEvt.getSource().getName() == "DONumber") {
				this.onGetDeliveryItem(oEvt);
			} else if (oEvt.getSource().getName() == "Batch") {
				this.onCheckFieldBatch(oEvt);
			} else if (oEvt.getSource().getName() == "warehouse") {
				this.warehouseno = this.byId("warehouse").getValue().toUpperCase();
				this.onCheckFieldWareHouse(oEvt);
				if (this.getOwnerComponent().getModel("deliveryModel").getProperty("/WAREHOUSE") != "" && this.getOwnerComponent().getModel(
						"deliveryModel").getProperty("/ITEMCODE") != "") {
					this.checkItemWareThenBatch();
				}
			} else if (oEvt.getSource().getName() == "storageBin") {
				this.getOwnerComponent().getModel("deliveryModel").setProperty("/SOURCEBIN", oEvt.getSource().getValue().toUpperCase());
				this.getOwnerComponent().getModel("deliveryModel").refresh();
				jQuery.sap.delayedCall(400, this, function () {
					document.activeElement.blur();
				});

			} else if (oEvt.getSource().getName() == "Quantity") {
				this.onAddQuantity(oEvt);
			}

			if (this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/WAREHOUSE") != "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/PLANT") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/ITEMCODE") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/BATCH") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/QUANTITY") !== "" &&
				this.getOwnerComponent().getModel("deliveryModel").getProperty(
					"/SOURCEBIN") !== "") {
				this.checkField();
			}
		},

		onGetDeliveryItem: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			} else {
				var audio = new Audio(this.path);
				audio.play();
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
				jQuery.sap.delayedCall(5000, this, function () {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("provideDoNumber"));
				});
				return;
			}
			this.donumber = this.byId("donumber").getValue();
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().read("/DOHEADERSet(DONUMBER='" + this.donumber + "')", {
				urlParameters: {
					$expand: 'DOHEADERTOITEM'
				},
				success: function (oData, oResponse) {
					debugger;
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					jQuery.sap.delayedCall(400, this, function () {
						$('.itemnumber input').focus();
					});
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/DOITEMNUM", "");
					this.byId("itemnumber").setSelectedKey("");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/ITEMCODE", "");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", "");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/PLANT", "");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/STORAGELOC", "");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/UNIT", "");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/SOURCEBIN", "");
					// this.getOwnerComponent().getModel("deliveryModel").setProperty("/WAREHOUSE", "");

					/*if (oData.DOHEADERTOITEM.results.length > 0) {
						for (var i = 0; i < oData.DOHEADERTOITEM.results.length; i++) {
							oData.DOHEADERTOITEM.results[i].ITEMCODE = oData.DOHEADERTOITEM.results[i].ITEMCODE.replace(/^0+/, '');
						}
					}*/

					this.getOwnerComponent().getModel("deliveryModel").refresh();
					this.getOwnerComponent().getModel("deliveryModel").updateBindings();
					this.deliveryData = oData.DOHEADERTOITEM.results;
					var model = new JSONModel({
						results: this.deliveryData
					});

					this.getView().setModel(model, "itemModel");
					this.getView().getModel("itemModel").refresh();
					this.getView().getModel("itemModel").updateBindings();

					var tableItem = new JSONModel({
						results: []
					});
					this.getView().setModel(tableItem, "doItemData");
					this.getView().getModel("doItemData").refresh();
					this.getView().getModel("doItemData").updateBindings();

				}.bind(this),
				error: function (error) {
					debugger;
					var audio = new Audio(this.path);
					audio.play();
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/batchVisible", false);
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						var model = new JSONModel({
							results: []
						});
						this.getView().setModel(model, "itemModel");
						this.getView().getModel("itemModel").refresh();
						this.getView().getModel("itemModel").updateBindings();
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/DOITEMNUM", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/DONUMBER", "");
						this.byId("itemnumber").setSelectedKey("");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/ITEMCODE", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/PLANT", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/STORAGELOC", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/UNIT", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/SOURCEBIN", "");
						// this.getOwnerComponent().getModel("deliveryModel").setProperty("/WAREHOUSE", "");
						this.getOwnerComponent().getModel("deliveryModel").refresh();
						this.getOwnerComponent().getModel("deliveryModel").updateBindings();
						var tableItem = new JSONModel({
							results: []
						});
						this.getView().setModel(tableItem, "doItemData");
						this.getView().getModel("doItemData").refresh();
						this.getView().getModel("doItemData").updateBindings();
						if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
							var x = JSON.parse(error.responseText).error.innererror.errordetails;
							var details = '<ul>';
							var y = '';
							if (x.length > 1) {
								for (var i = 0; i < x.length - 1; i++) {
									y = '<li>' + x[i].message + '</li>' + y;
								}
							}
							details = details + y + "</ul>";

							MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletogetDelItem"), {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								details: details,
								contentWidth: "100px",
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										jQuery.sap.delayedCall(400, this, function () {
											this.byId("donumber").focus();
										});
									}
								}.bind(this)
							});
						} else {
							MessageBox.error(JSON.parse(error.responseText).error.message.value, {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								contentWidth: "100px",
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										jQuery.sap.delayedCall(400, this, function () {
											this.byId("donumber").focus();
										});
									}
								}.bind(this)
							});
						}
					});
				}.bind(this)
			});
		},

		getBatchmanaged: function (value) {
			if (value == "X") {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/batchVisible", true);
				this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", "");
				jQuery.sap.delayedCall(400, this, function () {
					this.byId("batch").focus();
				});
			} else {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/batchVisible", false);
				this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", "");
				jQuery.sap.delayedCall(400, this, function () {
					this.byId("quant").focus();
				});
			}
		},
		checkItemWareThenBatch: function () {
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			jQuery.sap.delayedCall(5000, this, function () {
				var path = "/MANAGEBATCHSet(WAREHOUSE='" + this.getOwnerComponent().getModel("deliveryModel").getProperty("/WAREHOUSE") +
					"',ITEMCODE='" + this.getOwnerComponent().getModel("deliveryModel").getProperty("/ITEMCODE") + "',PLANT='" + this.getOwnerComponent()
					.getModel("deliveryModel").getProperty("/PLANT") + "')";
				this.getOwnerComponent().getModel().read(path, {
					success: function (odata, oresponse) {
						if (odata.ERROR_INDICATOR == "E") {
							var audio = new Audio(this.path);
							audio.play();
							jQuery.sap.delayedCall(5000, this, function () {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
								MessageBox.error(odata.MESSAGE, {
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											var id;
											if (odata.ERROR_TYPE == 'WHN') {
												this.getOwnerComponent().getModel("deliveryModel").setProperty("/WAREHOUSE", "");
												id = "warehouse";
											}
											jQuery.sap.delayedCall(400, this, function () {
												this.byId(id).focus();
											});
										}
									}.bind(this)
								});
							});

						} else {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							this.getBatchmanaged(odata.BATCHINDICATOR);
						}
					}.bind(this),
					error: function (error) {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					}.bind(this)
				});
			});

		},
		checkItemNumber: function (oEvt) {
			var isExit = false;
			var matchNumber;
			if (oEvt.getSource().getValue() != "") {
				for (var i = 0; i < this.deliveryData.length; i++) {
					if (oEvt.getSource().getValue() == this.deliveryData[i].DOITEMNUM) {
						isExit = true;
						matchNumber = i;
						break;
					}
				}
				if (isExit) {
					oEvt.getSource().setValueState("None");
					this.byId("batch").setValueState("None");
					this.byId("storageBin").setValueState("None");
					this.byId("itemCode").setValueState("None");

					this.getOwnerComponent().getModel("deliveryModel").setProperty("/DOITEMNUM", this.deliveryData[matchNumber].DOITEMNUM);
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/ITEMCODE", this.deliveryData[matchNumber].ITEMCODE);
					// this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", this.deliveryData[matchNumber].BATCH);
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/PLANT", this.deliveryData[matchNumber].PLANT);
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/STORAGELOC", this.deliveryData[matchNumber].STORAGELOC);
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/UNIT", this.deliveryData[matchNumber].UNIT);
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/SOURCEBIN", "");
					this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
					this.getOwnerComponent().getModel("deliveryModel").refresh();
					this.getOwnerComponent().getModel("deliveryModel").updateBindings();

					if (this.getOwnerComponent().getModel("deliveryModel").getProperty("/WAREHOUSE") != "" && this.getOwnerComponent().getModel(
							"deliveryModel").getProperty("/ITEMCODE") != "") {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
						this.checkItemWareThenBatch();
					}

					/*jQuery.sap.delayedCall(400, this, function () {
						$('.itemnumber input').blur();
					});*/
				} else {
					var audio = new Audio(this.path);
					audio.play();
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("itemNotExist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/DOITEMNUM", "");
									this.byId("itemnumber").setSelectedKey("");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/ITEMCODE", "");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", "");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/PLANT", "");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/STORAGELOC", "");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/UNIT", "");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/SOURCEBIN", "");
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/WAREHOUSE", "");
									this.getOwnerComponent().getModel("deliveryModel").refresh();
									this.getOwnerComponent().getModel("deliveryModel").updateBindings();
									jQuery.sap.delayedCall(400, this, function () {
										$('.itemnumber input').focus();
									});
								}
							}.bind(this)
						});
					});
					return;
				}
			}
		},
		onDeleteLineItem: function (oEvent) {
			this.getView().getModel("doItemData").getProperty("/results").splice(oEvent.getSource().getId().split("-")[oEvent.getSource()
				.getId().split("-").length - 1], 1);
			this.getView().getModel("doItemData").refresh();
			jQuery.sap.delayedCall(400, this, function () {
				$('.itemnumber input').focus();
			});
			this.byId("itemnumber").setSelectedKey("");
			if (this.getView().getModel("doItemData").getProperty("/results").length > 0) {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
				this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" + this.getView()
					.getModel("doItemData").getData().results.length + ")");
			} else {
				this.getView().getModel("settingsModel").setProperty("/enablePost", false);
				this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
			}
		},
		onCheckFieldBatch: function (oEvt) {
			this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", oEvt.getSource().getValue().toUpperCase());
			this.getOwnerComponent().getModel("deliveryModel").refresh();
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("quant").focus();
			});

		},

		onCheckFieldWareHouse: function (oEvt) {
			this.getOwnerComponent().getModel("deliveryModel").setProperty("/WAREHOUSE", oEvt.getSource().getSelectedKey());
			this.getOwnerComponent().getModel("deliveryModel").refresh();
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("donumber").focus();
			});
		},

		checkField: function () {
			var InputFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("WAREHOUSE", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/WAREHOUSE")),
					new sap.ui.model.Filter("PLANT", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/PLANT")),
					new sap.ui.model.Filter("ITEMCODE", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/ITEMCODE")),
					new sap.ui.model.Filter("BATCH", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/BATCH")),
					new sap.ui.model.Filter("QUANTITY", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/QUANTITY")),
					new sap.ui.model.Filter("SOURCEBIN", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/SOURCEBIN"))
				],
				and: true
			});

			var filter = new Array();
			filter.push(InputFilter);
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().read("/CHECKFIELDSSet", {
				filters: filter,
				success: function (odata, oresponse) {
					debugger;
					var data = odata.results[0];
					if (data.ERROR_INDICATOR == 'E') {
						var audio = new Audio(this.path);
						audio.play();
						jQuery.sap.delayedCall(5000, this, function () {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							MessageBox.error(data.MESSAGE, {
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										var id;
										if (data.ERROR_TYPE == 'WHN') {
											this.getOwnerComponent().getModel("deliveryModel").setProperty("/WAREHOUSE", "");
											id = "warehouse";
										} else if (data.ERROR_TYPE == 'SBI') {
											this.getOwnerComponent().getModel("deliveryModel").setProperty("/SOURCEBIN", "");
											id = "storageBin";
										} else if (data.ERROR_TYPE == 'BCH') {
											this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", "");
											id = "batch";
										} else if (data.ERROR_TYPE == 'MAT') {
											this.getOwnerComponent().getModel("deliveryModel").setProperty("/ITEMCODE", "");
											jQuery.sap.delayedCall(400, this, function () {
												$('.itemnumber input').focus();
											});
										}
										if (data.ERROR_TYPE == "WHN" || data.ERROR_TYPE == "SBI" || data.ERROR_TYPE == "BCH") {
											jQuery.sap.delayedCall(400, this, function () {
												this.byId(id).focus();
											});
										}
										this.getOwnerComponent().getModel("deliveryModel").refresh();
									}
								}.bind(this)
							});
						});

					} else {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						this.addLineItem(data.AVAILABLESTOCK);
					}
				}.bind(this),
				error: function (error) {
					var audio = new Audio(this.path);
					audio.play();
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					});
					if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
						var x = JSON.parse(error.responseText).error.innererror.errordetails;
						var details = '<ul>';
						var y = '';
						if (x.length > 1) {
							for (var i = 0; i < x.length - 1; i++) {
								y = '<li>' + x[i].message + '</li>' + y;
							}
						}
						details = details + y + "</ul>";

						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletoCheckField"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {

								}
							}.bind(this)
						});
					} else {
						MessageBox.error(JSON.parse(error.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {

								}
							}.bind(this)
						});
					}
				}.bind(this)
			});
		},

		onAddQuantity: function (oEvt) {
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("storageBin").focus();
			});
			/*var count = this.getFormField(this.byId("idDeliveryItem").getContent());
			if (count > 0) {
				MessageBox.error("Please fill all the Mandatory fields.");
				return;
			} else {
				var path = "/AvailableQuantitySet(ITEMCODE='" + this.getOwnerComponent().getModel("deliveryModel").getProperty("/ITEMCODE") +
					"',BATCH='" + this.getOwnerComponent().getModel("deliveryModel").getProperty("/BATCH") + "',PLANT='" + this.getOwnerComponent().getModel(
						"deliveryModel").getProperty("/PLANT") + "',WAREHOUSE='" + this.getOwnerComponent().getModel("deliveryModel").getProperty(
						"/WAREHOUSE") +
					"',SOURCEBIN='" + this.getOwnerComponent().getModel("deliveryModel").getProperty("/SOURCEBIN") + "')";
				this.callService(path);
			}*/
		},
		addLineItem: function (value) {
			debugger;
			var deliveryData = null;
			var count = this.getFormField(this.byId("idDeliveryItem").getContent());
			if (count > 0) {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("fillMandotory"));
				return;
			}

			var ITEMCODE = this.getOwnerComponent().getModel("deliveryModel").getProperty("/ITEMCODE");
			var DOITEMNUM = this.getOwnerComponent().getModel("deliveryModel").getProperty("/DOITEMNUM");
			var BATCH = this.getOwnerComponent().getModel("deliveryModel").getProperty("/BATCH");
			var SOURCEBIN = this.getOwnerComponent().getModel("deliveryModel").getProperty("/SOURCEBIN");
			var QUANTITY = this.getOwnerComponent().getModel("deliveryModel").getProperty("/QUANTITY");

			if (this.getView().getModel("doItemData").getProperty("/results").length > 0) {
				this.totalquan = 0;
				for (var i = 0; i < this.deliveryData.length; i++) {
					if (ITEMCODE == this.deliveryData[i].ITEMCODE) {
						this.totalquan = parseFloat(this.deliveryData[i].QUANTITY);
					}
				}

				this.tablequnatity = 0;

				for (var i = 0; i < this.getView().getModel("doItemData").getProperty("/results").length; i++) {
					if (ITEMCODE == this.getView().getModel("doItemData").getProperty(
							"/results")[i].ITEMCODE &&
						DOITEMNUM == this.getView().getModel("doItemData").getProperty(
							"/results")[i].DOITEMNUM &&
						SOURCEBIN == this.getView().getModel("doItemData").getProperty(
							"/results")[i].SOURCEBIN &&
						BATCH == this.getView().getModel("doItemData").getProperty(
							"/results")[i].BATCH) {
						this.tablequnatity = this.tablequnatity + parseFloat(this.getView().getModel("doItemData").getProperty("/results")[i].QUANTITY);
					}
				}

				this.tablequnatity = this.tablequnatity + parseFloat(QUANTITY);

				if (this.tablequnatity > parseFloat(value)) {
					var audio = new Audio(this.path);
					audio.play();
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanstock") + " " + SOURCEBIN + " " +
							this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("forMat") + " " + ITEMCODE + this.getOwnerComponent().getModel(
								"i18n").getResourceBundle().getText("andbatch") + " " +
							BATCH, {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								contentWidth: "100px",
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
										jQuery.sap.delayedCall(400, this, function () {
											this.byId("quant").focus();
										});
									}
								}.bind(this)
							});
					});
					return;
				} else if (this.tablequnatity > this.totalquan) {
					var audio = new Audio(this.path);
					audio.play();
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanExeedingPoQuan") + " " + DOITEMNUM, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("quant").focus();
									});
								}
							}.bind(this)
						});
					});

					return;
				} else {
					for (var i = 0; i < this.getView().getModel("doItemData").getProperty("/results").length; i++) {
						if (ITEMCODE == this.getView().getModel("doItemData").getProperty("/results")[i].ITEMCODE &&
							DOITEMNUM == this.getView().getModel("doItemData").getProperty("/results")[i].DOITEMNUM &&
							BATCH == this.getView().getModel("doItemData").getProperty("/results")[i].BATCH &&
							SOURCEBIN == this.getView().getModel("doItemData").getProperty("/results")[i].SOURCEBIN
						) {
							this.getView().getModel("doItemData").getData().results[i].QUANTITY = this.tablequnatity.toString();
							deliveryData = new JSONModel({
								DONUMBER: this.donumber,
								DOITEMNUM: "",
								PLANT: "",
								STORAGELOC: "",
								QUANTITY: "",
								UNIT: "",
								SOURCEBIN: "",
								BATCH: "",
								ITEMCODE: "",
								WAREHOUSE: this.warehouseno
							});
							this.getOwnerComponent().setModel(deliveryData, "deliveryModel");
							this.getOwnerComponent().getModel("deliveryModel").refresh();
							this.getView().getModel("doItemData").refresh();
							this.getView().getModel("doItemData").updateBindings();
							if (this.getView().getModel("doItemData").getProperty("/results").length > 0) {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
								this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" + this.getView()
									.getModel("doItemData").getData().results.length + ")");

							} else {
								this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
								this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
							}
							this.getOwnerComponent().getModel("settingsModel").setProperty("/batchVisible", false);

							this.byId("itemnumber").setSelectedKey("");
							jQuery.sap.delayedCall(400, this, function () {
								$('.itemnumber input').focus();
							});
							return;
						}
					}

					for (var i = 0; i < this.getView().getModel("doItemData").getProperty("/results").length; i++) {
						if (ITEMCODE != this.getView().getModel("doItemData").getProperty("/results")[i].ITEMCODE ||
							DOITEMNUM != this.getView().getModel("doItemData").getProperty("/results")[i].DOITEMNUM ||
							BATCH != this.getView().getModel("doItemData").getProperty("/results")[i].BATCH ||
							SOURCEBIN != this.getView().getModel("doItemData").getProperty("/results")[i].SOURCEBIN
						) {
							this.getView().getModel("doItemData").getData().results.push(this.getOwnerComponent().getModel("deliveryModel").getData());
							deliveryData = new JSONModel({
								DONUMBER: this.donumber,
								DOITEMNUM: "",
								PLANT: "",
								STORAGELOC: "",
								QUANTITY: "",
								UNIT: "",
								SOURCEBIN: "",
								BATCH: "",
								ITEMCODE: "",
								WAREHOUSE: this.warehouseno
							});
							this.getOwnerComponent().setModel(deliveryData, "deliveryModel");
							this.getOwnerComponent().getModel("deliveryModel").refresh();
							this.getView().getModel("doItemData").refresh();
							this.getView().getModel("doItemData").updateBindings();
							if (this.getView().getModel("doItemData").getProperty("/results").length > 0) {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
								this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" + this.getView()
									.getModel("doItemData").getData().results.length + ")");

							} else {
								this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
								this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
							}
							this.getOwnerComponent().getModel("settingsModel").setProperty("/batchVisible", false);
							this.byId("itemnumber").setSelectedKey("");
							jQuery.sap.delayedCall(400, this, function () {
								$('.itemnumber input').focus();
							});
							return;
						}
					}

				}

			} else {

				for (var i = 0; i < this.deliveryData.length; i++) {
					if (this.getOwnerComponent().getModel("deliveryModel").getData().ITEMCODE == this.deliveryData[i].ITEMCODE) {
						this.totalquan = this.deliveryData[i].QUANTITY;
					}
				}
				if (parseFloat(QUANTITY) > parseFloat(value)) {
					var audio = new Audio(this.path);
					audio.play();
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);

						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanstock") + " " + SOURCEBIN + " " +
							this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("forMat") + " " + ITEMCODE + this.getOwnerComponent().getModel(
								"i18n").getResourceBundle().getText("andbatch") + " " +
							BATCH, {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								contentWidth: "100px",
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
										jQuery.sap.delayedCall(400, this, function () {
											this.byId("quant").focus();
										});
									}
								}.bind(this)
							});
						return;
					});

				} else if (parseFloat(QUANTITY) > this.totalquan) {
					var audio = new Audio(this.path);
					audio.play();
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanExeedingPoQuan") + " " + DOITEMNUM, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("quant").focus();
									});
								}
							}.bind(this)
						});
					});
					return;
				} else {
					this.getView().getModel("doItemData").getData().results.push(this.getOwnerComponent().getModel("deliveryModel").getData());
					deliveryData = new JSONModel({
						DONUMBER: this.donumber,
						DOITEMNUM: "",
						PLANT: "",
						STORAGELOC: "",
						QUANTITY: "",
						UNIT: "",
						SOURCEBIN: "",
						BATCH: "",
						ITEMCODE: "",
						WAREHOUSE: this.warehouseno
					});
					this.getOwnerComponent().setModel(deliveryData, "deliveryModel");
					this.getOwnerComponent().getModel("deliveryModel").refresh();
					this.getView().getModel("doItemData").refresh();
					this.getView().getModel("doItemData").updateBindings();
					if (this.getView().getModel("doItemData").getProperty("/results").length > 0) {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
						this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items") + " (" + this.getView()
							.getModel("doItemData").getData().results.length + ")");

					} else {
						this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
						this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
					}
					this.getOwnerComponent().getModel("settingsModel").setProperty("/batchVisible", false);
					this.byId("itemnumber").setSelectedKey("");
					jQuery.sap.delayedCall(400, this, function () {
						$('.itemnumber input').focus();
					});
				}

			}
		},

		onPressPost: function () {
			var sData = {
				WAREHOUSE: "",
				DONUMBER: "",
				GIHEADERTOITEM: []
			};

			sData["WAREHOUSE"] = this.getOwnerComponent().getModel("deliveryModel").getProperty("/WAREHOUSE");
			sData["DONUMBER"] = this.getOwnerComponent().getModel("deliveryModel").getProperty("/DONUMBER");
			sData["GIHEADERTOITEM"] = this.getView().getModel("doItemData").getData().results;

			for (var i = 0; i < sData.GIHEADERTOITEM.length; i++) {
				if (sData.GIHEADERTOITEM[i].WAREHOUSE != undefined) {
					delete sData.GIHEADERTOITEM[i].WAREHOUSE;
				}
			}
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().create("/GIHEADERSet", sData, {
				success: function (odata, oresponse) {
					MessageBox.success(odata.MESSAGE, {
						icon: MessageBox.Icon.SUCCESS,
						title: "Success",
						contentWidth: "100px",
						onClose: function (oAction) {
							if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE" || oAction === null) {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
								this.byId("tableTitle").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("items"));
								this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
								for (var key in this.getOwnerComponent().getModel("deliveryModel").getData()) {
									this.getOwnerComponent().getModel("deliveryModel").getData()[key] = "";
								}
								this.getOwnerComponent().getModel("deliveryModel").refresh();
								this.getOwnerComponent().getModel("deliveryModel").updateBindings();
								this.getView().getModel("doItemData").getData().results = [];
								this.getView().getModel("doItemData").refresh();
								this.getView().getModel("doItemData").updateBindings();
								this.byId("itemnumber").setSelectedKey("");
								jQuery.sap.delayedCall(400, this, function () {
									this.byId("warehouse").focus();
									this.byId("warehouse").setSelectedKey("");
								});
							}
						}.bind(this)
					});
				}.bind(this),
				error: function (error) {

					var audio = new Audio(this.path);
					audio.play();
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						this.getOwnerComponent().getModel("settingsModel").setProperty("/batchVisible", false);
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/DOITEMNUM", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/ITEMCODE", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/BATCH", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/PLANT", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/STORAGELOC", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/QUANTITY", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/UNIT", "");
						this.getOwnerComponent().getModel("deliveryModel").setProperty("/SOURCEBIN", "");

						this.byId("itemnumber").setSelectedKey("");
						this.getOwnerComponent().getModel("deliveryModel").refresh();
						this.getOwnerComponent().getModel("deliveryModel").updateBindings();
					});

					if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
						var x = JSON.parse(error.responseText).error.innererror.errordetails;
						var details = '<ul>';
						var y = '';
						if (x.length > 1) {
							for (var i = 0; i < x.length - 1; i++) {
								y = '<li>' + x[i].message + '</li>' + y;
							}
						}
						details = details + y + "</ul>";

						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletopost"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {}
							}.bind(this)
						});
					} else {
						MessageBox.error(JSON.parse(error.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {}
							}.bind(this)
						});
					}

				}.bind(this)
			});
		},

		getFormField: function (oFormContent) {
			var c = 0;
			for (var i = 0; i < oFormContent.length; i++) {
				if (oFormContent[i].getMetadata()._sClassName === "sap.m.Input" || oFormContent[i].getMetadata()
					._sClassName === "sap.m.ComboBox" && oFormContent[i].getVisible() === true) {
					if (oFormContent[i].getValue() == "") {
						oFormContent[i].setValueState("Error");
						oFormContent[i].setValueStateText(oFormContent[i - 1].getText() + " is Mandatory Field.");
						oFormContent[i].focus();
						c++;
						return c;
					}
				}
			}
		}

	});

});