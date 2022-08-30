/**
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * Licensed under the Amazon Software License  http://aws.amazon.com/asl/
**/

/**
 * For local testing, search for text localTesting
 * To run - node celebFunc.js
 * When copying.. must have 13 columns - 2,4,5,7,9,11 indexes are the prayer times. Starting from index 0
 * Copy prayer time from - https://www.hounslowmasjid.co.uk/prayer/
 * Add a date representing the correct month in the A1 Cell.
 * Date column (1st column) should be just numbers from 1-30 or 31.
 */

 var https = require('https');
//  const axios = require('axios');
//let itemList; //localTest uncomment
 
 const readData = function(handlerInput) {
   const today = new Date();
   const day = today.getDate();
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); //localTest comment
   
   
   var url = '';
 
   https.get(url, function(res){
       var body = '';
   
       res.on('data', function(chunk){
           body += chunk;
       });
   
       res.on('end', function(){
           var resp = JSON.parse(body);
           var values = resp.values;

           // Verify reading the correct month
           const dateFormatted = new Date(values[0][0]);
           if(today.getMonth() !== dateFormatted.getMonth()){
              console.log("Incorrect month: "+values[0][0]);
              sessionAttributes.prayer_list_status = false; //localTest comment
              return;
           }
           
           values.forEach(function(item){
             if(Number(item[0]) === day){
               // assign
              sessionAttributes.prayer_list = item; //localTest comment
              // itemList = item; //localTest uncomment
             }
           });
       });
   }).on('error', function(e){
         console.log("Got an error: ", e);
   });
 }
 
 
/* const readData = function(handlerInput) {
   const today = new Date();
   const day = today.getDate();
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); //localTest comment
   
   
   var url = 'https://sheets.googleapis.com/v4/spreadsheets/1do3RlJJynQNBWdJUWPnsokBSip4r3n0YeSGaKzHMo70/values/Sheet1?key=AIzaSyAWKoMx8MOgR_DGU1yCt_vtjEysSbQk8RU';
 
   (async () => {
  try {
    const response = await axios.get(url)
    console.log(response.data.url);
    console.log("this is explanation OOOO: "+response.data);
    
    
    var resp = JSON.parse(response.data);
          var values = resp.values;

          // Verify reading the correct month
          const dateFormatted = new Date(values[0][0]);
          if(today.getMonth() !== dateFormatted.getMonth()){
              console.log("Incorrect month: "+values[0][0]);
              sessionAttributes.prayer_list_status = false; //localTest comment
              return;
          }
           
          values.forEach(function(item){
             if(Number(item[0]) === day){
              // assign
              sessionAttributes.prayer_list = item; //localTest comment
              // itemList = item; //localTest uncomment
             }
          });
    
    
  } catch (error) {
    console.log("Got an error: ", error.response.body);
  }
})();


 }*/
 
 
 
 
 const getPrayerTime = function(prayer,arr) {
   if(arr.length < 13){
      console.log("ERROR: array length is too short. Should have 14 columns! "+arr);
      return null;
   }
   
   prayer = prayer.toUpperCase();
   
   switch(prayer) {
     case "SUBAH":
     case "SUBHA":
     case "SUMMER":
       return arr[2];
     case "SUN RISE":
     case "SUNRISE":
       return arr[4];
     case "ZUHAR":
     case "ZUHR":
       return arr[5];
     case "ASAR":
     case "ASR":
       return arr[7];
     case "MAGRIB":
     case "MAGHRIB":
       return arr[9];
     case "ISHA":
       return arr[11];
     default:
       return null;
   }
 }
 
 const getPrayerTimeTo12hr = function(timeString) {
   if(timeString.length === 4){
     timeString = '0'+timeString;
   }
   timeString += ':00';
   console.log("timeString after conversion: "+timeString);
 
   const timeString12hr = new Date('1970-01-01T' + timeString + 'Z')
     .toLocaleTimeString('en-US',
       {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
     );
   console.log("timeString after conversion: "+timeString12hr);
 
   return timeString12hr;
 }
 
 module.exports = {
   readData,
   getPrayerTime,
   getPrayerTimeTo12hr
 };
 
 // localTest uncomment
/*const sleep = ms => new Promise(r => setTimeout(r, ms));

 // This async function is to add PM AM string into the time  if  not present.
   readData("")
  await sleep(5000);
   var timeString = getPrayerTime("ASAR",itemList);
   console.log("timeString: "+timeString);
 
   if(timeString.length === 4){
     timeString = '0'+timeString;
   }
   timeString += ':00';
   console.log(timeString);
   const timeString12hr = new Date('1970-01-01T' + timeString + 'Z')
     .toLocaleTimeString('en-US',
       {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
     );
  console.log("Time: "+timeString12hr);
 
   
}
 
mainFunc();*/