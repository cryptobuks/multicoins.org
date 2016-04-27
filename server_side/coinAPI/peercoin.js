'use strict';

const utils = require('../utils.js');
const alerts = require('../alerts');
const $ = require('jquery');

const urlAPI = "https://ppc.blockr.io/api/v1/address/";
const urlAPIpush = "https://multicoins.org/api/v1/tx/push/ppc";

exports.netID = 0;
exports.name = "peercoin";
exports.Shortname = "PPC";
exports.fee = 0.01;

exports.getBalance = function(arrayAddr, callback)
{
    console.log('get balance ' + urlAPI + "balance/" + arrayAddr.toString() + "?confirmations=0");
    $.getJSON( urlAPI + "balance/" + arrayAddr.toString() + "?confirmations=0", function(data) {
        callback(data);
    })
      .fail(function() {
          callback(utils.JSONreturn('false', 'error'));
      });      
};

exports.pushTransaction = function(hexTX)
{
    console.log('pushTransaction' + hexTX);
    $.post( urlAPIpush, { "hex": hexTX })
      .done(function( data ) {
        //alert( "Data Loaded: " + JSON.stringify(data) );
        alerts.OnTransactionSent(JSON.parse(data));
      })
      .fail(function(e) {
        //alert( "error " + JSON.stringify(e));
        alerts.OnTransactionSent(e);
      });   

};

exports.getTransactions = function(arrayAddr, callback)
{
    $.getJSON( urlAPI  + "txs/" + arrayAddr.toString(), function(data) {
        callback(exports.netID, data.data);
        
        $.getJSON( urlAPI + "unconfirmed/" + arrayAddr.toString(), function(data2) {
            callback(exports.netID, data2.data);
        }).fail(function() {
            callback(exports.netID, utils.JSONreturn(false, 'error'));
        });      
    }).fail(function() {
        callback(exports.netID, utils.JSONreturn(false, 'error'));
    });   
    
}

exports.getUnspentTransactions = function(arrayAddr, callback)
{
    console.log('getUnspentTransactions: ' + urlAPI + "unspent/" + arrayAddr.toString());
    $.getJSON( urlAPI + "unspent/" + arrayAddr.toString(), function(data) {
        callback(exports.netID, data);
    })
      .fail(function(e) {
          console.log("getUnspentTransactions fail e=" + (e?JSON.stringify(e):'null'));
          callback(exports.netID, utils.JSONreturn('false', 'error'));
      });      
}

exports.CheckFee = function(hexTX, fee, callback)
{
    var bRet = false;
    const fRecommended = Math.max(exports.fee, exports.fee/(1+hexTX.length/(2*1024)));
    if (parseFloat(fee) < fRecommended)
    {
        alerts.Alert(
            'Warning', 
            'Your transaction fee is too small (recommended "'+exports.fee +'")<BR>Push transaction anyway (press OK button) ?', 
            function() {callback(true);},
            function() {callback(false);});
    }
    else 
        callback(true);
}


exports.CheckHexTransaction = function(hex) {return hex;};
exports.GetOutTxAmount = function(amount) {return parseInt(parseFloat(amount)/0.000001);};