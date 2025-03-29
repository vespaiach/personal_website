---
title: 'Working With Javascript Date Object'
date: '2022-06-20'
excerpt: 'Learn how to effectively work with the Javascript Date object. This guide covers essential tips, examples, and best practices to simplify handling dates and times in your projects.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/working-with-javascript-date-object.md
tags: javascript, date
---

Javascript doesn't have a date data type, instead it introduces Date object which is an integer number representing the number of milliseconds passed since midnight at the beginning of 01 January, 1970 UTC. Put in other words, Javascript Date objects use a time value that is an offset in milliseconds since 1970-01-01T00:00:00Z (UTC).

The moment of midnight at the beginning of January First, 1970 is represented by the value 0.

```javascript
new Date(0); // 01 January, 1970 UTC
new Date(negative milliseconds); // Time before midnight of 01 January, 1970 UTC
```

## UTC and local time

From its definition, the Date object uses UTC time, but when created, it defaults to the local timezone and offset. For instance:

```javascript
new Date(0); // May show different time on your local machine
new Date(0).toUTCString(); // To get date time string in UTC format
```

## Convert between date representation and timestamp

Create a Date object by using the Date constructor.

**new Date(milliseconds)**: Unlike other systems, timestamp in Javascript is measured in milliseconds, not seconds.

```javascript
new Date(1000 * 60 * 60 * 24);
new Date(); // Returns the current time on your local machine
```

**new Date(year, month, date, hours, minutes, seconds, ms)**:

```javascript
new Date(2022, 5, 20, 0, 0, 0, 0);
```

_Note_:

-   Year is four digits.
-   Month begins from 0 (0: January - 11: December).

**new Date(datestring)**: The logic of parsing datestring is the same as the logic of the `Date.parse` method.

```javascript
new Date('Thu Jan 01 1970 19:00:00 GMT-0500 (Eastern Standard Time)');
new Date('2022-05-05');
```

Get timestamp from Date object by using the `getTime` method.

```javascript
new Date().getTime(); // Milliseconds
```

## Clone/Create a copy of Date object

A quick way to clone Date objects is to pass it to the Date constructor.

```javascript
const curr = new Date();
const copy = new Date(curr);
const anotherCopy = new Date(curr.getTime());
```

#E Exchange Date with other systems

For example, we want to send a Date object to the server for saving, and before doing that, we can convert that Date object to a string representation. The most common datetime format is [ISO8601](https://en.wikipedia.org/wiki/ISO_8601), and Javascript has a function that allows us to convert to ISO format: `toISOString`.

```javascript
new Date().toISOString();
```

## Compare two dates

Simply convert them to timestamps (in milliseconds) and compare them, or let Javascript do the type conversion.

```javascript
const date1 = new Date();
const date2 = new Date();

if (date1 > date2) {
}

if (date1.getTime() > date2.getTime()) {
} // This one has better performance
```

_Note:_ We can't do equality comparisons of two Date objects.

```javascript
const date1 = new Date();
const date2 = new Date();

if (date1 == date2) {
} // This will always be false, two objects can't be equality checked like this
```

## Loop through date range or month range

In the Date constructor, what if we put a wrong date in, for instance `new Date(2022, 12, 32)`? Javascript will automatically correct them, which is very handy in this case. We can leverage this autocorrection to loop through the date range.

```javascript
// Loop through date range
const fromDate = new Date(2022, 0, 1);
const currDate = new Date();
while (fromDate < currDate) {
    ...
    fromDate.setDate(fromDate.getDate() + 1);
}
```

```javascript
// Loop through month range
const fromDate = new Date(2022, 0, 1);
const currDate = new Date();
while (fromDate < currDate) {
    ...
    fromDate.setMonth(fromDate.getMonth() + 1);
}
```

## Get the first date of the month

If we are given a Date object, we can get the first date of its month by setting its date to 1.

```javascript
const date = new Date();
date.setDate(1);
```

## Get the last date of the month

If we are given a Date object, we can get the last date of its month by setting it to the next month and then setting its date to -1.

```javascript
const date = new Date();
date.setMonth(date.getMonth() + 1);
date.setDate(-1);
```

## Count date differences

Disregarding different timezones, we can use similar code below to calculate the differences.

```javascript
const date1 = new Date(2022, 1, 1);
const date2 = new Date(2022, 5, 1);

Math.trunc(((date2 - date1) / 1000) * 60 * 60 * 24); // Returns the full-date differences in between
Math.ceil(((date2 - date1) / 1000) * 60 * 60 * 24); // Difference in every millisecond is counted as a date
```

To calculate for different timezones, we need to find the different offset between two timezones and then subtract the result by that difference before converting it to date difference. (Here is the code from [DayJs](https://github.com/iamkun/dayjs/blob/8e6d11d053393d97bee1ba411adb2d82de1a58c4/src/index.js#L317))

## Count month differences

The `getMonth()` method returns the current month of Date (remember that months begin from 0). We can use it to count the differences by subtracting them.

```javascript
const date1 = new Date(2022, 1, 1);
const date2 = new Date(2022, 5, 1);

const diff = -date1.getMonth() + (date2.getFullYear() - date1.getFullYear()) * 12 + date2.getMonth();
// Subtract out-of-range month--^^^^^^^^^^^^^^^^
// Get total diff month in between years------------^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Add months left------------------------------------------------------------------------------------^^^^^^^^^^^^^^^^^
```

Check out the sample code of [diffMonth from here](https://github.com/vespaiach/calendar-react/blob/main/src/utils.ts#L11).

## Check if Daylight Saving Time is applied for a Date

We base this on the idea that during DST time, Javascript's `getTimezoneOffset` method will return a greater value than in standard time, and no country observes DST time for more than six months.

```javascript
const currDate = new Date();

const isDSTApplied =
    currDate.getTimezoneOffset() > new Date(currDate.getFullYear(), 0, 1).getTimezoneOffset() ||
    currDate.getTimezoneOffset() > new Date(currDate.getFullYear(), 5, 1).getTimezoneOffset();
```

Check out the code from [moment.js](https://github.com/moment/moment/blob/e96809208c9d1b1bbe22d605e76985770024de42/src/lib/units/offset.js#L210).

## Check if leap year

To check it, we only use math and not anything related to Date objects.

When I was a kid, I was taught the Earth orbits around the sun every 365.25 days, and that's why we have a leap year every 4 years. But that is rounding for easier to remember. In fact, the Earth takes 365 days 5 hours 48 minutes and 46 seconds to go around the Sun. So every year, we have a remainder of `6h - (5h 48m 46s) = 11m 14s`, and every 400 years, we have a remainder of `11m 14s * 400 years = 7486h = 3 days`. So the formula to check leap year is:

```javascript
const date = new Date();
const years = date.getFullYear();
const isLeapYear = years % 4 === 0 && (years % 100 !== 0 || years % 400 === 0);
```
