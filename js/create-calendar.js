const today = new Date();

let thisMonth, thisYear;

if (window.location.search) {

    const values = window.location.search.substr(1).split("&").reduce((result, item) => {

        [k, v] = item.split("=");
        return Object.assign(result, { [k]: v });
    }, {});

    thisMonth = values.m - 0;
    thisYear = values.y - 0;

} else {

    thisMonth = today.getMonth();
    thisYear = today.getYear() + 1900;
}

const months = [
    "January",
    "February",
    "March",
    "April", 
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"]

const daysInMonth = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
];

const weekends = {
    mon: [ 6, 7, 13, 14, 20, 21, 27, 28 ],
    tue: [ 5, 6, 12, 13, 19, 20, 26, 27 ],
    wed: [ 4, 5, 11, 12, 18, 19, 25, 26 ],
    thu: [ 3, 4, 10, 11, 17, 18, 24, 25, 31 ],
    fri: [ 2, 3, 9, 10, 16, 17, 23, 24, 30, 31 ],
    sat: [ 1, 2, 8, 9, 15, 16, 22, 23, 29, 30 ],
    sun: [ 1, 7, 8, 14, 15, 21, 22, 28, 29 ],
};

const holidays = [
    "Bank Holiday",
    "Boxing Day",
    "Christmas Day",
    "New Year",
    "Vacation"
].map(x => "#" + x);

/**
 * Create the day labels for the calendar
 */
const addDayNames = calendar => {

    [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ].forEach(label => {

        const day = document.createElement("div");
        day.textContent = label;

        day.classList.add("name-of-day");
        if (label.substr(0, 1) === "S") {
            day.classList.add("weekend");
        }

        calendar.appendChild(day);
    });
};

/**
 * Add the days to the calendar
 */
const addDays = calendar => {

    [...Array(daysInMonth[thisMonth])].map((_, i) => i + 1).forEach(label => {

        // The cell for the day
        const day = document.createElement("div");
        day.classList.add("day");

        // The label for the day number
        const dayNumber = document.createElement("div");
        dayNumber.textContent = label;
        dayNumber.classList.add("day-number");
        day.appendChild(dayNumber);

        // Need to identify the first day of the month, so we know where to
        // start displaying the cells
        const firstDayOfMonth = (new Date(thisYear, thisMonth, 1)).toString().split(" ")[0].toLowerCase();
        if (label === 1) {
            day.classList.add("month-starts-on-" + firstDayOfMonth);
        }

        if (weekends[firstDayOfMonth].includes(label)) {
            day.classList.add("weekend");
        }

        if (label === today.getDate() && thisMonth === today.getMonth() && thisYear === today.getYear() + 1900) {
            day.classList.add("today");
        }

        calendar.appendChild(day);
    });
};

/**
 * Get the list of appointments and add them to the calendar
 */
const addAppointments = () => {

    [...document.getElementsByTagName("li")].forEach(appt => {

        const matches = appt.innerHTML
                            .replace(/^<p>/, "").replace(/<\/p>$/, "")
                            .match(/([0-9]+)\/([0-9]+)\/([0-9*]+) +(.+)/);
        if (matches) {

            // Break down the appointment data
            const [_, day, month, year, entry] = matches;
            const happensThisMonth = thisMonth === month - 1;
            const happensThisYear = thisYear === year - 0;
            const happensEveryYear = year === "*";

            // If it's this month and this year, include it
            if (happensThisMonth && ( happensThisYear || happensEveryYear )) {

                // Which cell are we looking at?
                const dayCell = [...document.getElementsByClassName("day")][day - 1];

                // Create a container for this entry and add it to the cell
                const elem = document.createElement("div");
                elem.innerHTML = entry;
                dayCell.appendChild(elem);

                // If the entry is a tag, add the appropriate class
                if (entry.substr(0, 1) === "#") {
                    elem.classList.add("label");
                    elem.innerHTML = entry.substr(1);

                    // If the tag is for a holiday, add a class to the cell
                    // too, so we can style it appropriately
                    if (holidays.includes(entry)) {
                        dayCell.classList.add("holiday");
                    }
                }

                // If it's a yearly event, add an "annual" class to it
                if (year === "*") {
                    elem.classList.add("annual");
                }

                // If the entry has a start time, mark it as a timed event
                if (entry.match(/^[0-9]+\.[0-9]+ /)) {
                    elem.classList.add("has-start-time");

                // Otherwise mark it as all day
                } else {
                    elem.classList.add("all-day");
                }
            }
        }
    });

    document.getElementsByTagName("ul")[0].style.display = "none";
};

/**
 * Create the calendar grid
 */
const createCalendar = () => {

    const calendar = document.createElement("div");
    calendar.classList.add("calendar");
    addDayNames(calendar);
    addDays(calendar);

    return calendar;
};

/**
 * Generate a query string for next month
 */
const nextMonthQuery = () => {

    if (thisMonth === 11) {
        return "?m=0&y=" + (thisYear + 1);
    }

    return "?m=" + (thisMonth + 1) + "&y=" + thisYear;
};

/**
 * Generate a query string for next month
 */
const prevMonthQuery = () => {

    if (thisMonth === 0) {
        return "?m=11&y=" + (thisYear - 1);
    }

    return "?m=" + (thisMonth - 1) + "&y=" + thisYear;
};

/**
 * Add in navigation
 */
const createNavigation = () => {

    const nav = document.createElement("nav");

    const current = document.createElement("a");
    current.textContent = "Current Month";
    current.setAttribute("href", window.location.toString().split("?")[0]);
    nav.appendChild(current);

    const sep1 = document.createElement("span");
    sep1.classList.add("separator");
    sep1.textContent = "//";
    nav.appendChild(sep1);

    const prevArrow = document.createElement("span");
    prevArrow.textContent = "< ";
    nav.appendChild(prevArrow);

    const prev = document.createElement("a");
    prev.textContent = months[(thisMonth + 11) % 12];
    prev.setAttribute("href", window.location.toString().split("?")[0] + prevMonthQuery());
    nav.appendChild(prev);

    const sep2 = document.createElement("span");
    sep2.textContent = " | ";
    nav.appendChild(sep2);

    const next = document.createElement("a");
    next.textContent = months[(thisMonth + 1) % 12];
    next.setAttribute("href", window.location.toString().split("?")[0] + nextMonthQuery());
    nav.appendChild(next);

    const nextArrow = document.createElement("span");
    nextArrow.textContent = " >";
    nav.appendChild(nextArrow);

    return nav;
};

document.getElementsByTagName("h1")[0].textContent = months[thisMonth] + " " + thisYear;
document.getElementById("content").appendChild(createNavigation());
document.getElementById("content").appendChild(createCalendar());
addAppointments();
