
/**
 * Parse the day, and factor that into the date for the created event
 * @param {Date} date A date object describing the date of the event
 * @param {string} day a string indicating the day we want to set the event for
 * @param {string} time the time in string format
 * @param {string} am_pm the 12hour indicator of AM or PM
 */
function parseDate(date, day, time, am_pm) {

	const dayInt = parseInt(day);

	var pm = true;

	if (am_pm) {
		am_pm.toLowerCase();
		if (am_pm === 'am') {
			pm = false;
		} else if (am_pm === 'pm') {
			//pm already true
		} else {
			//invalid AM/PM
			console.log(`Invalid string for AM/PM: ${am_pm}`);
		}
	}




	/*
	 * Parse the day given by the user
	 */
	if (isNaN(dayInt)) {

		//The current day of the week, indexed at 1 for sunday ... 7 for saturday
		const dayOfWeek = date.getDay() + 1;

		//the name of the day, lowercase
		day = day.toLowerCase();

		//difference in the day number
		var diff;

		switch (day) {

			case 'today':
				diff = 0;
				break;

			case 'tomorrow':
			case 'tom':
				diff = 1;
				break;

			case 'sunday':
			case 'sun':
				diff = 7 - dayOfWeek + 1;
				break;

			case 'monday':
			case 'mon':
				diff = (dayOfWeek > 2 ? 7 - dayOfWeek + 2 : 2 - dayOfWeek);
				console.log(diff);
				break;

			case 'tuesday':
			case 'tues':
				diff = (dayOfWeek > 3 ? 7 - dayOfWeek + 3 : 3 - dayOfWeek);
				break;

			case 'wednesday':
			case 'wed':
				diff = (dayOfWeek > 4 ? 7 - dayOfWeek + 4 : 4 - dayOfWeek);
				break;

			case 'thursday':
			case 'thurs':
			case 'thu':
				diff = (dayOfWeek > 5 ? 7 - dayOfWeek + 5 : 5 - dayOfWeek);
				break;

			case 'friday':
			case 'fri':
				diff = (dayOfWeek > 6 ? 7 - dayOfWeek + 6 : 6 - dayOfWeek);
				break;

			case 'saturday':
			case 'sat':
				diff = 7 - dayOfWeek;
				break;
		}

		date.setDate(date.getDate() + diff);

	} else if (dayInt < 0 || dayInt > 30) {
		console.log(`Invalid date ${dayInt} given`);
		return;
	} else {
		date.setDate(date.getDate() + dayInt);
	}

	if (time) {

		const splitTime = time.split(':', 3);

		const timeInt = parseInt(time);

		if (splitTime.length > 1) {

			if (splitTime.length > 3) {
				console.log(`Invalid time ${time} given.`);
				return;
			} else if (splitTime.length > 1) {

				var hours = parseInt(splitTime.shift());
				const minutes = parseInt(splitTime.shift());
				const seconds = parseInt(splitTime.shift());

				//AM/PM check
				if (hours && am_pm) {

					if (pm && hours != 12) {
						hours += 12;
					}

					if (!pm && hours === 12) {
						hours = 0;
					}
				}

				/*
				 * Set hours, minutes, and seconds, based on the following factors:
				 * existence of the argument; validity of the argument;
				 * presence of AM/PM argument
				 */
				date.setHours(
					(((hours) && hours <= 23 || hours >= 0) ? hours : date.getHours()),
					(((minutes) && minutes <= 59 || minutes > 0) ? minutes : 0),
					(((seconds) && seconds <= 59 || seconds > 0) ? seconds : 0)
				);

				/**

				if (minutes) {
					if (minutes > 59 || minutes < 0) {
						console.log(`Invalid minutes ${minutes} given.`);
						return;
					} else {
						date.setMinutes(minutes);
					}
				}

				if (hours) {
					if (hours > 12 || hours < 0) {
						console.log(`Invalid hour ${hours} given.`);
						return;
					} else {
						date.setHours(hours);
					}
				}

				if (seconds) {
					if (seconds > 59 || seconds < 0) {
						console.log(`Invalid seconds ${seconds} given.`);
						return;
					} else {
						date.setSeconds(seconds);
					}
				}*/
			} else if (isNaN(timeInt)) {

			} else {

			}


		} else if (timeInt < 0 || timeInt > 2359) {
			console.log(`Invalid time ${timeInt} given.`);
			return;
		} else {

		}
	}

	return date;

}

module.exports = parseDate;