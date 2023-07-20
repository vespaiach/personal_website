---
title: 'Working With Date object In Javascript'
date: '2022-06-20'
excerpt: 'Working with Date is not always straightforward, sometimes it may overwhelm developers, even seasoned ones. In this article, I will share my experience that will help you to deal with Date in Javascript.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/working-with-date-in-javascript.md
tags: javascript, date
layout: default
---

# Definition

Javascript doesn't date data type, instead it introduces Date object which is an integer number representing the number of milliseconds passed since midnight at the beginning of 01 January, 1970 UTC. Put in other words, Javascript Date objects use a time value that is an offset in milliseconds since 1970-01-01T00:00:00Z (UTC).

The moment of midnight at the beginning of January First, 1970 is represented by the value 0

```js
new Date(0) //01 January, 1970 UTC
new Date(negative milliseconds) //time before midnight of 01 January, 1970 UTC
```

# UTC and local time

It is worth noting that, from the definition, Date object is using UTC time but when creating, it always uses local timezone and offset. For instance, let’s create a date using new Date(0), it may show different than 01 January 1970 UTC and it depends on your local timezone.

```js
new Date(0); //May show different time on you local machine
new Date(0).toUTCString(); //To get date time string in UTC format
```

# Convert between date representing and timestamp

Create a Date object by using Date constructor.

**new Date(milliseconds)**: unlike other systems, timestamp in Javascript measures by milliseconds not seconds

```js
new Date(1000 * 60 * 60 * 24);
new Date(); // Return the current time on you local machine
```

**new Date(year, month, date, hours, minutes, seconds, ms)**:

```js
new Date(2022, 5, 20, 0, 0, 0, 0);
```

_Note_:

-   Year is four digits
-   Month begins from 0 (0: January - 11: December)

**new Date(datestring)**: the logic of parsing datestring is the same as the logic of `Date.parse` method

```js
new Date('Thu Jan 01 1970 19:00:00 GMT-0500 (Eastern Standard Time)');
new Date('2022-05-05');
```

Get timestamp from Date object by using getTime method

```js
new Date().getTime(); // milliseconds
```

# Clone/Create a copy of Date object

A quick way to clone Date objects is to put it in Date constructor.

```js
const curr = new Date();
const copy = new Date(curr);
const anotherCopy = new Date(curr.getTime());
```

# Exchange Date with other systems

For example, we want to send a Date object to the server for saving and before doing that, we can convert that Date object to a string representation. The most common datetime format is [ISO8601](https://en.wikipedia.org/wiki/ISO_8601), and Javascript have a function that allow us to convert to ISO format `toISOString`

```js
new Date().toISOString();
```

# Compare two dates

Simply convert them to timestamp (in milliseconds) and compare them, or let Javascript do the type conversion.

```js
const date1 = new Date();
const date2 = new Date();

if (date1 > date2) {
}

if (date1.getTime() > date2.getTime()) {
} // this one has better performance
```

_Note:_ we can't do equality compares of two Date objects

```js
const date1 = new Date();
const date2 = new Date();

if (date1 == date2) {
} // this will always be false, two objects can be equality checked like this
```

# Loop through date range or month range

In Date constructor, what if we put a wrong date in, for instance new Date(2022, 12, 32), Javascript will automatically correct them which is very handy in this case. We can leverage this autocorection to loop through the date range.

```js
// Loop through date range
const fromDate = new Date(2022, 0, 1)
const currDate = new Date()
while(fromDate < currDate) {
    ....
    fromDate.setDate(fromDate.getDate() + 1)
}
```

```js
// Loop through month range
const fromDate = new Date(2022, 0, 1)
const currDate = new Date()
while(fromDate < currDate) {
    ....
    fromDate.setMonth(fromDate.getMonth() + 1)
}
```

# Get the first date of month

If we are given a Date object, we can get the first date of its month by setting it date to 1

```js
const date = new Date();
date.setDate(1);
```

# Get the last date of month

If we are given a Date object, we can get the last date of its month by setting it the next month and then setting its date by -1

```js
const date = new Date();
date.setMonth(date.getMonth() + 1);
date.setDate(-1);
```

# Count date differences

Disregard different timezone, we can use similar code below to calculate the differences.

```js
const date1 = new Date(2022, 1, 1);
const date2 = new Date(2022, 5, 1);

Math.trunc(((date2 - date1) / 1000) * 60 * 60 * 24); // return the full-date differences in between
Math.ceil(((date2 - date1) / 1000) * 60 * 60 * 24); // difference in every miliseconds is counting as a date
```

To calculate for different timezones, we need to find the different offset between two timezones and then subtract the result by that difference before converting it to date difference. (here is the code from [DayJs](https://github.com/iamkun/dayjs/blob/8e6d11d053393d97bee1ba411adb2d82de1a58c4/src/index.js#L317))

# Count month differences

`getMonth()` method returns the current month of Date (remember that, month begins from 0). We can use it to count the differences by substracting them.

```js
const date1 = new Date(2022, 1, 1);
const date2 = new Date(2022, 5, 1);

const diff = -date1.getMonth() + (date2.getFullYear() - date1.getFullYear()) * 12 + date2.getMonth();
//subtract out of range month--^^^^^^^^^^^^^^^^
//get total diff month in between years------------^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//add months left------------------------------------------------------------------------------------^^^^^^^^^^^^^^^^^
```

Check out the sample code of [diffMonth from here](https://github.com/vespaiach/calendar-react/blob/main/src/utils.ts#L11)

# Check if Daylight Saving Time is applied for a Date

We base on the idea that in DST time Javascript `getTimezoneOffset` method will return greater value than in standard time and no country observe DST time more than six months.

```js
const currDate = new Date();

const isDSTApplied =
    currDate.getTimezoneOffset() > new Date(currDate.getFullYear(), 0, 1).getTimezoneOffset() ||
    currDate.getTimezoneOffset() > new Date(currDate.getFullYear(), 5, 1).getTimezoneOffset();
```

Check out the code from [moment.js](https://github.com/moment/moment/blob/e96809208c9d1b1bbe22d605e76985770024de42/src/lib/units/offset.js#L210)

# Check if leap year

To check it, we only use math and not anything related to Date objects.

When I was a kid, I was taught the Earth orbits around the sun every 365.25 days, and that's why we have a leap year every 4 years. But that is rounding for easier to remember. In fact, the Earth takes 365 days 5 hours 48 minutes and 46 seconds to go around the Sun. So every year, we have remain `6h - (5h 48m 46s) = 11m 14s` and every 400 years, we have the remain of `11m 14s * 400 years = 7486h = 3 dates`. So the formula to check leap year is:

```js
const date = new Date();
const years = date.getFullYear();
const isLeapYear = years % 4 === 0 && years % 100 !== 0 && years % 400 === 0;
```
