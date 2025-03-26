const { DiningHallDataParser } = require('./scraper');
class RunkDataParser extends DiningHallDataParser {
    getDiningHallTimeFrame(date, time) {
        if (date == 0 || date == 6) {
            if (time >= 1000 && date < 1600) {
                return "Brunch";
            }
            
            if (time >= 1600 && time < 2000) {
                return "Dinner";
            }
        }

        if (time >= 700 && time < 1100) {
            return "Breakfast";
        }

        if (time >= 1100 && time < 1600) {
            return "Lunch";
        }

        if (time >= 1600 && time < 2000) {
            return "Dinner";
        }

        if (time >= 2000 && time < 2300) {
            return "Late Night";
        }

        return "Unavailable"
    }
} 

module.exports = { RunkDataParser };