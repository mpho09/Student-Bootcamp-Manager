# Student Bootcamp Manager

## Project Description

A console-based JavaScript application that registers bootcamp students, stores their courses and marks, gives each student a unique ID, calculates averages, decides PASS or FAIL against a configurable passing mark, processes students asynchronously and prints a final class report.

## Features

- Register students with a name, course and any number of marks
- Default course when no course is given
- Invalid marks (e.g. `150`, `"fifty"`) are rejected and reported
- Unique student IDs (`STU-001`, `STU-002`, …) produced by a generator
- Average calculation and PASS / FAIL / INCOMPLETE status
- Configurable passing mark (default 50), protected inside an IIFE
- Processing counter protected inside a closure
- Asynchronous, one-by-one student processing with `setTimeout()` and callbacks
- Final report: ID, name, course, marks, average, status, plus total / processed / passed / failed
- Built-in tests for normal and edge cases (25 checks)
- Bonus: class average, top performer, highest and lowest mark per student, letter grades

## Technologies

- JavaScript (ES6+)
- Node.js or a web browser console

## How to Run

**Option 1 — Node.js**

```bash
node app.js
```

**Option 2 — Browser**

Open `index.html` in a browser, press **F12** and go to the **Console** tab.


### Quick explanations

- **call vs apply vs bind:** `call()` and `apply()` both run the function immediately with a chosen `this`. `call()` takes arguments one by one; `apply()` takes them as one array. `bind()` does not run the function — it returns a new function with `this` locked in, to run later.
- **Why the "👀" message appears before any "✅ Finished" message:** `setTimeout()` only schedules work. JavaScript continues with the next line straight away, and the scheduled code runs later once the delay has passed and the call stack is empty.

## Challenges

1. **Default parameter followed by a rest parameter.** Because `course` comes before `...marks`, I could not simply leave the course out — the first mark would have been taken as the course.
2. **Losing `this` in `setTimeout`.** Passing `bootcamp.announceCompletion` straight to `setTimeout()` made `this` undefined, so `this.name` crashed.
3. **Processing students in order.** Starting every `setTimeout` at once made the output messy and the report printed before processing had finished.

## Solutions

1. Pass `undefined` for the course (`registerStudent("Sipho Nkosi", undefined, 66, 71)`). Default parameters only apply when the value is `undefined`.
2. Use `bind(bootcamp)` to create a version of the method whose `this` is always the bootcamp object.
3. Process students one at a time: each student's callback starts the next student, and the final callback prints the report.