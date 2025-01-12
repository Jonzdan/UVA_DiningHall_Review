const { DiningHallDataParser } = require('./scraper');
class NewcombDataParser extends DiningHallDataParser {
    getDiningHallTimeFrame(date, time) {
        if (date == 6) {
            return "Closed";
        }
        if (date == 5 && (time >= 1400 || time < 700)) {
            return "Unavailable";
        }
        if (date == 0 && time >= 1000 && time < 1400) {
            return "Brunch (10am-2pm)";
        }
        if (time >= 700 && time < 1030) {
            return "Breakfast (7am-10:30am)";
        }
        else if (time >= 1100 && time < 1400) {
            return "Lunch (11am-2pm)";
        }
        else if (time >= 1400 && time < 1700) {
            return "Afternoon Snack (2pm-5pm)";
        }
        else if (time >= 1700 && time < 2000 ) {
            return "Dinner (5pm-8pm)";
        }
        else {
            return "Unavailable";
        }
    }
}

module.exports = { NewcombDataParser };