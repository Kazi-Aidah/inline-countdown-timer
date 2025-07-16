# 📅 Inline Countdown Timer

An Obsidian plugin that renders **live countdowns** and **elapsed time** inside your notes using `[!TIMELEFT]` and `[!TIMEPASSED]` tags.
🛈 **Only works in Reading Mode.**

---

## 🚀 Usage

### 🔹 Two Main Expressions

```markdown
[!TIMELEFT, START: <date>]
[!TIMEPASSED, START: <date>]
```

* **`TIMELEFT`** → Counts *time remaining* until a future date.
  If the date is in the past, it will display:
  `⏰ Time Expired`

* **`TIMEPASSED`** → Shows *time elapsed* since a past date.
  The timer will keep running continuously.

---

## 📅 Date Format Options

Both numeric and written date formats are supported:

| Example Expression                      | Format Type     |
| --------------------------------------- | --------------- |
| `[!TIMELEFT, START: 16/07/2025]`        | `DD/MM/YYYY`    |
| `[!TIMELEFT, START: 07/16/2025]`        | `MM/DD/YYYY`    |
| `[!TIMELEFT, START: 02 November 2025]`  | `DD Month YYYY` |
| `[!TIMEPASSED, START: January 02 2025]` | `Month DD YYYY` |

---

## ⏰ Time Format Options

You can include the time in various formats:

```markdown
[!TIMEPASSED, START: 16 July 2025 4am]
[!TIMEPASSED, START: 16 July 2025 04:00]
[!TIMEPASSED, START: 16 July 2025 0400]
[!TIMEPASSED, START: 16 July 2025 - 4am]
```
= 14 hours 7 minutes passed 2 seconds passed

---

## ⚙️ Customization

### 🔸 Shortened Format

* `2 hours, 12 minutes, 4 seconds` → `2h, 12m, 4s`

### 🔸 Units Separator

| Separator | Example Output            |
| --------- | ------------------------- |
| `,`       | `12 minutes, 10 seconds`  |
| `-`       | `12 minutes - 10 seconds` |
| (space)   | `12 minutes 10 seconds`   |

### 🔸 Show/Hide Units

You can choose to **enable or disable** any of the following time units:

* Years
* Months
* Weeks
* Days
* Hours
* Minutes
* Seconds

**Examples:**

* **With "Months" enabled**: `4 months, 12 days`
* **With "Months" disabled**: `132 days`

### 🔸 Time Expired Text

When `TIMELEFT` reaches the past, the plugin displays:

```
⏰ Time Expired
```

But you can change it to anything you want, like:

* `⛔ Deadline Missed`
* `😢 Oh nooooo, time's over :(`
* `⌛ Time is fleeting.`
* `💀 no more.`

---

## 🔄 Custom Suffixes

### `TIMELEFT` Suffix

* Default: `left`
* Customizable to: `ago`, `away`, `remaining`, etc.
* Or leave it **blank** to write your own context.

> **Example:**
> `[!TIMELEFT, START: ...]` → `2 minutes` (then *you* can write "until dinner")

### `TIMEPASSED` Suffix

* Default: `passed`
* Customizable to: `ago`, `back`, `elapsed`, etc.
* Or leave blank and write your own.

> **Example:**
> `8 hours have gone since I last cried.`

---

## ⚠️ Limitations

### ❌ Not available in Live Preview mode

This plugin only renders in **Reading Mode**.
Live Preview support caused instability and will be added in a future release (hopefully!).

