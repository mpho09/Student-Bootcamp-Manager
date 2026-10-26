"use strict";
function isValidMark(mark) {
  return typeof mark === "number" && Number.isFinite(mark) && mark >= 0 && mark <= 100;
}


function describeValue(value) {
  return typeof value === "string" ? `"${value}"` : String(value);
}


const AppConfig = (function () {
  const bootcampName = "Melsoft JavaScript Bootcamp"; 
  const version = "1.0.0"; 
  let passingMark = 50; 

  return {
    getBootcampName: () => bootcampName,
    getVersion: () => version,
    getPassingMark: () => passingMark,
    setPassingMark(newMark) {
      if (!isValidMark(newMark)) {
        console.warn(`  Passing mark not changed: ${describeValue(newMark)} is not a number from 0 to 100.`);
        return false;
      }
      passingMark = newMark;
      return true;
    },
  };
})();


function* createStudentIdGenerator(prefix = "STU", startAt = 1) {
  let nextNumber = startAt;
  while (true) {
    yield `${prefix}-${String(nextNumber).padStart(3, "0")}`;
    nextNumber++;
  }
}

const studentIds = createStudentIdGenerator();


function createCounter() {
  let count = 0; 
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

const processedCounter = createCounter();

const students = [];

function registerStudent(name, course = "Full-Stack Web Development", ...marks) {
  if (typeof name !== "string" || name.trim() === "") {
    console.error(` Registration failed: name must be text (received ${describeValue(name)}).`);
    return null;
  }

  const validMarks = marks.filter(isValidMark); 
  const rejectedMarks = marks.filter((mark) => !isValidMark(mark));

  if (rejectedMarks.length > 0) {
    console.warn(`  ${name.trim()}: ignored invalid mark(s): ${rejectedMarks.map(describeValue).join(", ")}`);
  }

  const student = {
    id: studentIds.next().value, 
    name: name.trim(),
    course,
    marks: [...validMarks],
    average: null,
    status: "PENDING",
    processed: false,
  };

  students.push(student);
  return student;
}

function findStudent(studentId) {
  return students.find((student) => student.id === studentId) ?? null;
}

function addMarks(studentId, ...newMarks) {
  const student = findStudent(studentId);
  if (!student) {
    console.error(` Cannot add marks: student "${studentId}" does not exist.`);
    return false;
  }
  student.marks = [...student.marks, ...newMarks.filter(isValidMark)];
  return true;
}


function calculateAverage(marks) {
  if (!Array.isArray(marks) || marks.length === 0) return null;
  const total = marks.reduce((sum, mark) => sum + mark, 0);
  return Math.round((total / marks.length) * 100) / 100; 
}


function determineStatus(average, passingMark = AppConfig.getPassingMark()) {
  if (average === null) return "INCOMPLETE";
  return average >= passingMark ? "PASS" : "FAIL";
}

const averageFormatters = {
  percentage: (value) => (value === null ? "N/A" : `${value.toFixed(1)}%`),
  letterGrade: (value) => {
    if (value === null) return "N/A";
    if (value >= 80) return "A";
    if (value >= 70) return "B";
    if (value >= 60) return "C";
    if (value >= 50) return "D";
    return "F";
  },
};

const hasPassed = (student) => student.status === "PASS";
const hasFailed = (student) => student.status === "FAIL";
const isIncomplete = (student) => student.status === "INCOMPLETE";


function selectStudents(studentList, predicate) {
  return studentList.filter(predicate);
}


function formatAverage(value, formatter = averageFormatters.percentage) {
  return formatter(value);
}


const bootcamp = {
  name: AppConfig.getBootcampName(),
  version: AppConfig.getVersion(),
  roster: students,
  describe() {
    return `${this.name} v${this.version} — ${this.roster.length} registered students`;
  },
  announceCompletion() {
    console.log(`\n🎓 ${this.name}: processing complete for ${processedCounter.getCount()} students.`);
  },
};


function getStudentLabel(separator = " | ") {
  return [this.id, this.name, this.course].join(separator);
}


function getMarkRange(label, decimals) {
  if (this.marks.length === 0) return `${label}: no marks`;
  const highest = Math.max.apply(null, this.marks); 
  const lowest = Math.min(...this.marks); 
  return `${label}: highest ${highest.toFixed(decimals)}, lowest ${lowest.toFixed(decimals)}`;
}

const announceCompletion = bootcamp.announceCompletion.bind(bootcamp);


function processStudent(studentId, onComplete, delayMs = 600) {
  if (typeof onComplete !== "function") {
    console.error(" processStudent needs a callback function.");
    return;
  }
  if (typeof studentId !== "string") {
    onComplete(new Error(`Invalid student ID: ${describeValue(studentId)}`), null);
    return;
  }

  const student = findStudent(studentId);
  if (!student) {
    onComplete(new Error(`Student "${studentId}" does not exist.`), null);
    return;
  }

  console.log(`⏳ Started:  ${getStudentLabel.call(student, " • ")}`); // call()

 
  setTimeout(() => {
    student.average = calculateAverage(student.marks);
    student.status = determineStatus(student.average);
    student.processed = true;
    processedCounter.increment(); 
    onComplete(null, student); 
  }, delayMs);
}


function processAllStudents(studentList, onAllComplete) {
  let index = 0;

  function processNext() {
    if (index >= studentList.length) {
      onAllComplete();
      return;
    }
    const current = studentList[index];
    index++;

    processStudent(current.id, (error, student) => {
      if (error) {
        console.error(` ${error.message}`);
      } else {
        console.log(
          ` Finished: ${student.name} — average ${formatAverage(student.average)} ` +
            `(grade ${formatAverage(student.average, averageFormatters.letterGrade)}) → ${student.status}`
        );
      }
      processNext(); 
    });
  }

  processNext();
}

const pad = (value, width) => String(value).padEnd(width);


function main() {
  console.log("=".repeat(60));
  console.log(`  ${AppConfig.getBootcampName()} — Student Bootcamp Manager`);
  console.log(`  Version ${AppConfig.getVersion()} · Passing mark ${AppConfig.getPassingMark()}%`);
  console.log("=".repeat(60));

 
  console.log("\n REGISTERING STUDENTS");
  registerStudent("Thabo Mokoena", "Full-Stack Web Development", 78, 85, 92, 88);
  registerStudent("Lerato Dlamini", "Data Science", 45, 52, 38);
  const defaultCourseStudent = registerStudent("Sipho Nkosi", undefined, 66, 71);
  registerStudent("Ayesha Patel", "UI/UX Design", 91); // only one mark
  const invalidMarksStudent = registerStudent("Johan van Wyk", "Cybersecurity", 40, 150, "fifty", 35);
  registerStudent("Naledi Khumalo", "Cloud Computing"); // no marks yet

 
  addMarks("STU-002", 61, 55);
  addMarks("STU-404", 80); 

  students.forEach((student) => console.log(`   • ${getStudentLabel.call(student)}`)); // call()
  console.log(`\n   ${bootcamp.describe()}`);

  runTests(defaultCourseStudent, invalidMarksStudent);

 
  console.log("\n  PROCESSING STUDENTS (asynchronous)");
  processAllStudents(students, () => {
    printReport(students);
    
    setTimeout(announceCompletion, 300);
  });


  console.log(" This message prints right away: JavaScript keeps going while the first student is still processing.\n");
}

main();
