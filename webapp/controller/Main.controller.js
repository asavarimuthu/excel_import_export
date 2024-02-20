    sap.ui.define([
        'sap/ui/core/mvc/Controller',
        'sap/ui/core/util/MockServer',
        'sap/ui/export/library',
        'sap/ui/export/Spreadsheet',
        'sap/ui/model/odata/v2/ODataModel',
        'sap/ui/model/json/JSONModel',
        '../library/jszip',
        '../library/xlsx'
    ], function(Controller, MockServer, exportLibrary, Spreadsheet, ODataModel,JSONModel,jszip,xlsx) {
        'use strict';
    
        var EdmType = exportLibrary.EdmType;
    
        return Controller.extend('com.sap.excelexportimport.controller.Main', {

       
    
            onInit: function() {
                var oModel, oView, sServiceUrl;
    
                /* Export requires an absolute path */
               sServiceUrl = "https://port8080-workspaces-ws-wf492.us10.trial.applicationstudio.cloud.sap/localService/mockdata/Users.json";
    
              this._oMockServer = new MockServer({
                    rootUri: sServiceUrl
                });

            //   this._oMockServer = new MockServer({
             //       rootUri: sap.ui.require.toUrl("com/sap/excelexportimport") 
             //   });
    
    
                var sPath = sap.ui.require.toUrl('com/sap/excelexportimport/localService');
                this._oMockServer.simulate(sPath + '/metadata.xml', sPath + '/mockdata');
                this._oMockServer.start();

                var data={
                    "Users":[{
                        "UserID":"1",
                        "Name":"Savari",
                        "Age":"16"
                    },
                    {
                        "UserID":"2",
                        "Name":"Muthu",
                        "Age":"18"
                    },
                    {
                        "UserID":"3",
                        "Name":"Saga",
                        "Age":"20"
                    }]
                };
    
               // oModel = new ODataModel();
               this.oModel=new JSONModel();
                this.oModel.setData(data);
    
                oView = this.getView();
                oView.setModel(this.oModel);
            },
    
            createColumnConfig: function() {
                var aCols = [];
    
                aCols.push({
                    label: 'UserID',
                    type: EdmType.Number,
                    property: 'UserID',
                    scale: 0
                });
                aCols.push({
                    label: 'Name',
                    property: 'Name',
                    type: EdmType.String,
                    template: '{0}, {1}'
                });
    
              
                aCols.push({
                    label: 'Age',
                    type: EdmType.Number,
                    property: 'Age',
                    scale: 0
                });
    
                return aCols;
            },
      
            onExport: function() {
                var aCols, oRowBinding, oSettings, oSheet, oTable;
    
                if (!this._oTable) {
                    this._oTable = this.byId('exportTable');
                }
    
                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();
    
                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'User.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };
    
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },

            onUpload: function (e) {
                this._import(e.getParameter("files") && e.getParameter("files")[0]);
            },
            _import: function (file) {
                var that = this;
                var excelData = {};
                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        workbook.SheetNames.forEach(function (sheetName) {
                            // Here is your object for every sheet in workbook
                            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    
                        });
                        // Setting the data to the local model 
                        that.oModel.setData({
                            Users: excelData
                        });
                        that.oModel.refresh(true);
                    };
                    reader.onerror = function (ex) {
                        console.log(ex);
                    };
                    reader.readAsBinaryString(file);
                }
            },
    
            onExit: function() {
                this._oMockServer.stop();
            }
        });
    });
    