# Inline Countdown Timer
Obsidian Plugin that shows live countdowns and elapsed time in notes with [!TIMELEFT] and [!TIMEPASSED]. Only renders in Reading Mode.

# USAGE
##### **TWO MAIN EXPRESSIONS:**
[!TIMELEFT, START:]
[!TIMEPASSED, START:]

TIMELEFT is for how much time left before reaching the date. You must put a date and time in the ***future***. If that date is in the past, or has been met, it will show "⏰ Time Expired".

TIMEPASSED is for how much time has passed since a date. You must put a date and time in the ***past***. This time will continue for as long as you have the obsidian vault.

##### **DATE FORMAT OPTIONS**
[!TIMELEFT, START: 16/07/2025] = DD/MM/YYYY
[!TIMELEFT, START: 07/16/2025] = MM/DD/YYYY

Date Month-name Year also works, 
[!TIMELEFT, START: 02 November 2025] = 3 months, 18 days, 6 hours, 1 minutes, 25 seconds left
[!TIMEPASSED, START: 02 January 2025]
[!TIMEPASSED, START: January 02 2025]
= 6 months 15 days 18 hours 5 minutes 22 seconds passed
##### TIME FORMAT OPTIONS
[!TIMEPASSED, START: 16 July 2025 4am]
[!TIMEPASSED, START: 16 July 2025 0400]
[!TIMEPASSED, START: 16 July 2025 04:00]
[!TIMEPASSED, START: 16 July 2025 4am]
[!TIMEPASSED, START: 16 July 2025 - 4am]
= 14 hours 7 minutes passed 2 Seconds passed

# CUSTOMIZATION:
##### SHORTENED FORMAT:
2 hour, 12 minutes, 04 seconds = 2h, 12m, 04s
##### UNITS SEPARATOR:
Unit Separator = ,
12 minutes, 10 seconds / 12m, 10s

Unit Separator =  -
12 minutes - 10 seconds / 12m - 10s

Unit Separator =  
12 minutes 10 seconds / 12m 10s
##### SHOW: YEAR / MONTH / WEEK / DATE / MINUTES / SECONDS
For example,
**Show Month ENABLED**
4 Month, 12 days, 2 weeks...
**Show Month DISABLED**
132 days, 2 weeks...

##### TIME EXPIRED TEXT
When a date in the ***past*** is selected for TIMELEFT, it will show
= ⏰ Time Expired

You can change it to anything like:
= Oh nooooo, time's over :(
= How dare you leave me...?
= Time is fleeting.
= no more.

##### SUFFIXES
###### TIMELEFT:
2 minutes left can be turned into
= 2 minutes ago
= 2 minutes away
by changing the Left Suffix to ago or away.
(Note that then ***all*** TIMELEFT will have whatever you set at the end.)

And if you don't want that,
You can leave the Left Suffix blank or with a space.
= 2 minutes (and you can type whatever you want after the expression.)

EXAMPLE: 2 minutes until dinner (If Left Suffix is blank, or has a space.)

###### TIMEPASSED
and 7 hours passed can be turned into:
= 7 hours ago
= 7 hours back 
or you can leave it blank in the Passed Suffix and type whatever you want after the expression.
EXAMPLE: 8 hours have gone since I last cried.

##### DOES NOT WORK IN LIVE PREVIEW
Yes, I know that's a bummer but I was having trouble implementing the Countdown in Live Preview Mode. I kept breaking Obsidian.
