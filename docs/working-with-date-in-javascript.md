---
title: 'Working With Date object In Javascript'
date: '2024-03-06'
excerpt: 'Hey, developers! Dealing with Date objects in JavaScript can be a bit like navigating a maze with shifting walls. It"s easy to feel a bit lost, even if you"ve been around the block a few times. But don"t worry, I"ve got some handy tips and tricks to share in this article that will help you get comfortable with Date objects in JavaScript.'
github: https://github.com/vespaiach/personal_website/blob/main/docs/working-with-date-in-javascript.md
tags: javascript, date
layout: default
---

Hey, developers! Dealing with Date objects in JavaScript can be a bit like navigating a maze with shifting walls. It's easy to feel a bit lost, even if you've been around the block a few times. But don't worry, I've got some handy tips and tricks to share in this article that will help you get comfortable with Date objects in JavaScript.

### Let's Start with the Basics

First, here's a straightforward and truthful statement about the value 0 in JavaScript's Date object: `The value 0 in JavaScript's Date object represents the precise moment of midnight at the beginning of January 1st, 1970.`

So, JavaScript doesn't have a date data type, but it gives us the Date object instead. This little guy is like a time traveler, counting the milliseconds that have passed since the dawn of January 1, 1970, in UTC time.

```js
new Date(0); // Boom! January 1, 1970, UTC
new Date(negative milliseconds); // Time before January 1, 1970, UTC
```

### Getting Timey-Wimey with UTC and Local Time

Now, here's the cool part. While Date objects are all about that UTC life, they like to dress up in your local timezone when you create them. So, if you make a Date with new Date(0), it might look different depending on where you are. Let's try these in your browser console:

```js
new Date(0); // Looks different on your local machine
new Date(0).toUTCString(); // Get the date-time string in good ol' UTC
```

### Playing with Dates and Times

Creating Date objects is pretty straightforward. You can go traditional with milliseconds (Milliseconds seem like a lot to me; I occasionally encounter them in my projects.)

```js
new Date(milliseconds); // Milliseconds? Time for a little dance!
new Date(1000 * 60 * 60 * 24); // That's a day in JavaScript land
new Date(); // Get the current time on your local machine
```

Or spice it up with years, months, and all that jazz:

```js
new Date(year, month, date, hours, minutes, seconds, ms); // Date with all the fixings
new Date(2022, 5, 20, 0, 0, 0, 0); // A delicious Date for your code cravings
```

And hey, remember this quirk:

 - Months start the party from 0 (0: January - 11: December).

```js
new Date(datestring); // JavaScript gets datestrings too!
new Date('Thu Jan 01 1970 19:00:00 GMT-0500 (Eastern Standard Time)');
new Date('2022-05-05');
```

### Making Clones of Your Date Buds

Need to clone a Date object? No problemo! JavaScript's got your back:

```js
const curr = new Date();
const copy = new Date(curr);
const anotherCopy = new Date(curr.getTime());
```

### Dating Across Systems

Sending a Date object to the server? Just convert it to a string! The popular kid in datetime formats is ISO8601, and JavaScript's got a trick up its sleeve with toISOString():

```js
new Date().toISOString(); // Look at that ISO charm!
```

### Comparing Dates Like a Boss

When comparing dates, you've got options. You can compare them directly or let JavaScript do the magic:

```js
const date1 = new Date();
const date2 = new Date();

if (date1 > date2) {
  // Your code here
}

if (date1.getTime() > date2.getTime()) {
  // This one's got style and performance!
}
```

Just remember, you can't compare Date objects directly like besties:

```js
const date1 = new Date();
const date2 = new Date();

if (date1 == date2) {
  // Nope, these two are not twins
}
```

### Looping Through Time

JavaScript's Date constructor is pretty chill. If you mess up the date, no worries! It'll correct itself, which is handy for looping:

```js
// Loop through a date range
const fromDate = new Date(2022, 0, 1);
const currDate = new Date();
while (fromDate < currDate) {
  // Your loop magic here
  fromDate.setDate(fromDate.getDate() + 1);
}

// Loop through a month range
const fromDate = new Date(2022, 0, 1);
const currDate = new Date();
while (fromDate < currDate) {
  // More loop wizardry here
  fromDate.setMonth(fromDate.getMonth() + 1);
}
```

### Getting Cozy with Dates

Want to know the first date of the month? Just set the date to 1:

```js
const date = new Date();
date.setDate(1);
```

And to find the last date of the month? Jump to the next month and then go back by one day:

```js
const date = new Date();
date.setMonth(date.getMonth() + 1);
date.setDate(-1);
```

### Crunching Numbers... with Dates

Need to calculate date differences? No problemo! JavaScript's got you:

```js
const date1 = new Date(2022, 1, 1);
const date2 = new Date(2022, 5, 1);

Math.trunc(((date2 - date1) / 1000) * 60 * 60 * 24); // Returns the full-date differences in between
Math.ceil(((date2 - date1) / 1000) * 60 * 60 * 24); // Counts every millisecond as a date
```

### Checking If It's Daylight Saving Time

Wanna know if it's Daylight Saving Time? JavaScript can help with that too! Here's a neat little trick:

```js
const currDate = new Date();

// Is DST applied? Let's find out!
const isDSTApplied =
    currDate.getTimezoneOffset() > new Date(currDate.getFullYear(), 0, 1).getTimezoneOffset() ||
    currDate.getTimezoneOffset() > new Date(currDate.getFullYear(), 5, 1).getTimezoneOffset();
```

### Leap into Leap Years

Ah, the leap year! Remember the Earth's 365.25-day dance around the Sun? JavaScript does! Check if it's a leap year with this code:

```js
const date = new Date();
const years = date.getFullYear();
const isLeapYear = years % 4 === 0 && years % 100 !== 0 && years % 400 === 0;
```

### Just Dates, no time please

Sometimes, all you need is the date without any fuss about time. You can create Date objects with just the date part, omitting the time:

```js
const justDate = new Date('2022-03-05');
```

For today's date but without the time, we just need to reset that clock to midnight:

```js
const today = new Date();
today.setHours(0, 0, 0, 0);
```

When comparing dates without considering time, let's make sure to strip the clocks from both dates first:

```js
const date1 = new Date('2022-03-05');
const date2 = new Date('2022-03-06');

// Let's take the time out of the equation
date1.setHours(0, 0, 0, 0);
date2.setHours(0, 0, 0, 0);

// Now let's compare!
if (date1.getTime() === date2.getTime()) {
  console.log('These dates are totally vibing together!');
} else {
  console.log('Whoa, these dates are dancing to different beats.');
}
```

### You're all set

There you have it! Date objects in JavaScript don't have to be a headache. With these tips, you'll be waltzing through time and dates like a seasoned pro. Happy coding, time travelers! 🚀