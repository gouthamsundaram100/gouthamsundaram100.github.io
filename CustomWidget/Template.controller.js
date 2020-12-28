	sap.ui.define([
    	      "jquery.sap.global",
    	      "sap/ui/core/mvc/Controller",
    	      "sap/ui/model/json/JSONModel",
    	      "sap/m/MessageToast",
    	      "sap/ui/core/library",
    	      "sap/ui/core/Core",
    	      'sap/ui/model/Filter',
    	      'sap/m/library',
    	      'sap/m/MessageBox',
    	      'sap/ui/unified/DateRange',
    	      'sap/ui/core/format/DateFormat',
    	      'sap/ui/model/BindingMode',
    	      'sap/ui/core/Fragment',
    	      'sap/m/Token',
    	      'sap/ui/model/FilterOperator',
    	      'sap/ui/model/odata/ODataModel',
    	      'sap/m/BusyDialog'
    	    ], function(jQuery, Controller, JSONModel, MessageToast, coreLibrary, Core, Filter, mobileLibrary, MessageBox, DateRange, DateFormat, BindingMode, Fragment, Token, FilterOperator, ODataModel, BusyDialog) {
    	      "use strict";

    	      var busyDialog = (busyDialog) ? busyDialog : new BusyDialog({});

    	      return Controller.extend("CustomWidget.Template", {

    	        onInit: function() {
    	          console.log(that._export_settings.title);
    	          console.log("widgetName:" + that.widgetName);

    	          if (that._firstConnection === 0) {
    	            that._firstConnection = 1;
    	          }
    	        },
    	        
    	        onValidate: function(e) {

    	          var fU = this.getView().byId("idfileUploader");
    	          var domRef = fU.getFocusDomRef();
    	          var file = domRef.files[0];
    	          var this_ = this;

    	          var oModel = new JSONModel();
    	          oModel.setData({
    	            result_final: null
    	          });

    	          var reader = new FileReader();
    	          reader.onload = async function(e) {
    	            var strCSV = e.target.result;

    	            var workbook = XLSX.read(strCSV, {
    	              type: 'binary'
    	            });

    	            var result_final = [];
    	            var result = [];
    	            var correctsheet = false;

    	            workbook.SheetNames.forEach(function(sheetName) {
    	              if (sheetName === "Sheet1") {
    	                correctsheet = true;
    	                var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    	                if (csv.length) {
    	                  result.push(csv);
    	                }
    	                result = result.join("[$@~!~@$]")
    	              }
    	            });

    	            if (correctsheet) {
    	              var lengthfield = result.split("[$@~!~@$]")[0].split("[#@~!~@#]").length;
    	              console.log("lengthfield: " + lengthfield);

    	              var total = this_.getView().byId("total");
    	              var rec_count = 0;

    	              var len = 0;
    	              if (lengthfield === 9) {
    	                for (var i = 1; i < result.split("[$@~!~@$]").length; i++) {
    	                  if (result.split("[$@~!~@$]")[i].length > 0) {

    	                    var rec = result.split("[$@~!~@$]")[i].split("[#@~!~@#]");
    	                    if (rec.length > 0) {
    	                      len = rec[0].trim().length + rec[1].trim().length + rec[2].trim().length + rec[3].trim().length + rec[4].trim().length + rec[
    	                        5].trim().length + rec[6].trim().length + rec[7].trim().length + rec[8].trim().length;
    	                      if (len > 0) {
    	                        rec_count = rec_count + 1;
    	                        result_final.push({
    	                          'ID': i,
    	                          'DATE': rec[0].trim(),
    	                          'COUNTRY_CODE': rec[1].trim(),
    	                          'COMPANY_CODE': rec[2].trim(),
    	                          'TYPE': rec[3].trim(),
    	                          'VALUE_DATE': rec[4].trim(),
    	                          'AMOUNT': rec[5].trim().replace(/[,]/g, ""),
    	                          'CURRENCY': rec[6].trim(),
    	                          'COMMENTS': rec[7].trim().replace(/["'\n\r]/g, ""),
    	                          'LOCK_FLAG': rec[8].trim(),
    	                        });
    	                      }
    	                    }
    	                  }
    	                }

    	                if (result_final.length === 0) {
    	                  fU.setValue("");
    	                  MessageToast.show("There is no record to be uploaded");
    	                } else if (result_final.length >= 2001) {
    	                  fU.setValue("");
    	                  MessageToast.show("Maximum records are 2000.");
    	                } else {
    	                  // Bind the data to the Table
    	                  oModel = new JSONModel();
    	                  oModel.setSizeLimit("5000");
    	                  oModel.setData({
    	                    result_final: result_final
    	                  });

    	                  var oModel1 = new sap.ui.model.json.JSONModel();
    	                  oModel1.setData({
    	                    fname: file.name,
    	                  });
    	                  console.log(oModel);

    	                  _result = JSON.stringify(result_final);

    	                  that._firePropertiesChanged();
    	                  this.settings = {};
    	                  this.settings.result = "";

    	                  that.dispatchEvent(new CustomEvent("onStart", {
    	                    detail: {
    	                      settings: this.settings
    	                    }
    	                  }));

    	                  this_.runNext();
    	                  fU.setValue("");
    	                }
    	              } else {
    	                fU.setValue("");
    	                MessageToast.show("Please upload the correct file");
    	              }
    	            } else {
    	              console.log("Error: wrong xlsx template");
    	              MessageToast.show("Please upload the correct file");
    	            }
    	          };

    	          if (typeof file !== 'undefined') {
    	            reader.readAsBinaryString(file);
    	          }
    	        },
				
    	        wasteTime: function() {
    	          busyDialog.open();
    	        },

    	        runNext: function() {
    	          busyDialog.close();
    	        },

    	      });//end of controller extension
    	    });