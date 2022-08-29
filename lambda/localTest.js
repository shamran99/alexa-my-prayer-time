// node localTest.js

const arr = ['29',      'Mon',
              '4:27 AM', '5:00 AM',
              '6:09 AM', '1:02 PM',
              '1:30 PM', '5:46 PM',
              '6:15 PM', '7:55 PM',
              '7:57 PM', '9:26 PM',
              '9:45 PM'];

const getTime = time => new Date(2022, 8, 28, time.substring(0, 2), time.substring(3, 5), 0, 0);

const convertTime12to24 = function(time12h){
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  if (modifier === "AM") {
      hours = 0+hours;
    }

  return `${hours}:${minutes}`;
};

const getCurrentTime = function(){
    let currentDate = new Date();
    let currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();
    return currentTime;
}

const myElement = arr.find((element) => element === 2)
const indexInclusionList = [2,4,5,7,9,11]

var arr2 = new Map(); let i = 0;
const convertTo24HourClock = function(arr){
    arr.forEach(element => {
        const tm = convertTime12to24(element);
        const curtm  = getCurrentTime();

        // Adds to list only of the prayer time is fo azan. Hence one of the index in indexInclusionList and a future time.
        if(indexInclusionList.includes(i) && getTime(tm) > getTime(curtm)){
            arr2.set(i,tm);
        }
        i++;
    });
}

convertTo24HourClock(arr);
console.log(arr2);