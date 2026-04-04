import type {
  ActivityItem,
  Attendance,
  Course,
  Department,
  Enrollment,
  Payment,
  Result,
  Section,
  Semester,
  Student,
  Teacher,
} from "./types";

export const initialDepartments: Department[] = [
  {
    dept_id: "D001",
    dept_name: "Computer Science",
    office_room: "ENG-201",
    phone: "+1 555-0101",
  },
  {
    dept_id: "D002",
    dept_name: "Mathematics",
    office_room: "SCI-105",
    phone: "+1 555-0102",
  },
  {
    dept_id: "D003",
    dept_name: "Business Administration",
    office_room: "BUS-310",
    phone: "+1 555-0103",
  },
];

export const initialStudents: Student[] = [
  {
    student_id: "S1001",
    student_name: "Aisha Rahman",
    gender: "Female",
    date_of_birth: "2003-04-12",
    phone: "+1 555-2001",
    email: "aisha.r@student.edu",
    address: "12 Oak St, Cityville",
    admission_date: "2024-09-01",
    dept_id: "D001",
  },
  {
    student_id: "S1002",
    student_name: "Marcus Chen",
    gender: "Male",
    date_of_birth: "2002-11-30",
    phone: "+1 555-2002",
    email: "marcus.c@student.edu",
    address: "88 Pine Ave, Cityville",
    admission_date: "2023-09-01",
    dept_id: "D001",
  },
  {
    student_id: "S1003",
    student_name: "Elena Petrova",
    gender: "Female",
    date_of_birth: "2004-01-22",
    phone: "+1 555-2003",
    email: "elena.p@student.edu",
    address: "5 River Rd, Cityville",
    admission_date: "2024-09-01",
    dept_id: "D002",
  },
  {
    student_id: "S1004",
    student_name: "James Okonkwo",
    gender: "Male",
    date_of_birth: "2003-07-08",
    phone: "+1 555-2004",
    email: "james.o@student.edu",
    address: "40 Hill Ln, Cityville",
    admission_date: "2022-09-01",
    dept_id: "D003",
  },
];

export const initialTeachers: Teacher[] = [
  {
    teacher_id: "T501",
    teacher_name: "Dr. Sarah Mitchell",
    designation: "Professor",
    phone: "+1 555-3001",
    email: "s.mitchell@faculty.edu",
    hire_date: "2018-08-15",
    dept_id: "D001",
  },
  {
    teacher_id: "T502",
    teacher_name: "Mr. David Kumar",
    designation: "Lecturer",
    phone: "+1 555-3002",
    email: "d.kumar@faculty.edu",
    hire_date: "2020-01-10",
    dept_id: "D001",
  },
  {
    teacher_id: "T503",
    teacher_name: "Dr. Priya Nair",
    designation: "Associate Professor",
    phone: "+1 555-3003",
    email: "p.nair@faculty.edu",
    hire_date: "2017-03-01",
    dept_id: "D002",
  },
];

export const initialCourses: Course[] = [
  {
    course_id: "C401",
    course_code: "CS101",
    course_title: "Introduction to Programming",
    credit: 3,
    dept_id: "D001",
  },
  {
    course_id: "C402",
    course_code: "CS201",
    course_title: "Data Structures",
    credit: 4,
    dept_id: "D001",
  },
  {
    course_id: "C403",
    course_code: "MATH110",
    course_title: "Calculus I",
    credit: 3,
    dept_id: "D002",
  },
  {
    course_id: "C404",
    course_code: "BUS210",
    course_title: "Financial Accounting",
    credit: 3,
    dept_id: "D003",
  },
];

export const initialSemesters: Semester[] = [
  {
    semester_id: "SEM01",
    semester_name: "Fall 2025",
    start_date: "2025-09-01",
    end_date: "2025-12-15",
  },
  {
    semester_id: "SEM02",
    semester_name: "Spring 2026",
    start_date: "2026-01-15",
    end_date: "2026-05-20",
  },
];

export const initialSections: Section[] = [
  {
    section_id: "SEC01",
    section_name: "CS101-A",
    room_no: "LAB-1",
    schedule_time: "Mon/Wed 10:00–11:30",
    course_id: "C401",
    teacher_id: "T501",
    semester_id: "SEM02",
  },
  {
    section_id: "SEC02",
    section_name: "CS201-B",
    room_no: "ROOM-204",
    schedule_time: "Tue/Thu 14:00–15:30",
    course_id: "C402",
    teacher_id: "T502",
    semester_id: "SEM02",
  },
  {
    section_id: "SEC03",
    section_name: "MATH110-A",
    room_no: "ROOM-101",
    schedule_time: "Mon/Wed/Fri 09:00–10:00",
    course_id: "C403",
    teacher_id: "T503",
    semester_id: "SEM02",
  },
];

export const initialEnrollments: Enrollment[] = [
  {
    enrollment_id: "E7001",
    enroll_date: "2026-01-20",
    status: "Active",
    student_id: "S1001",
    section_id: "SEC01",
  },
  {
    enrollment_id: "E7002",
    enroll_date: "2026-01-20",
    status: "Active",
    student_id: "S1002",
    section_id: "SEC01",
  },
  {
    enrollment_id: "E7003",
    enroll_date: "2026-01-21",
    status: "Active",
    student_id: "S1001",
    section_id: "SEC02",
  },
  {
    enrollment_id: "E7004",
    enroll_date: "2026-01-22",
    status: "Completed",
    student_id: "S1003",
    section_id: "SEC03",
  },
];

export const initialAttendance: Attendance[] = [
  {
    attendance_id: "A9001",
    attendance_date: "2026-02-01",
    attendance_status: "Present",
    enrollment_id: "E7001",
  },
  {
    attendance_id: "A9002",
    attendance_date: "2026-02-01",
    attendance_status: "Late",
    enrollment_id: "E7002",
  },
  {
    attendance_id: "A9003",
    attendance_date: "2026-02-03",
    attendance_status: "Absent",
    enrollment_id: "E7002",
  },
];

export const initialResults: Result[] = [
  {
    result_id: "R5001",
    marks: 88,
    grade: "A",
    result_publish_date: "2026-03-01",
    enrollment_id: "E7004",
  },
  {
    result_id: "R5002",
    marks: 76,
    grade: "B",
    result_publish_date: "2026-03-15",
    enrollment_id: "E7001",
  },
];

export const initialPayments: Payment[] = [
  {
    payment_id: "P6001",
    payment_date: "2026-01-10",
    amount: 2500,
    payment_type: "Tuition Fee",
    payment_status: "Paid",
    student_id: "S1001",
  },
  {
    payment_id: "P6002",
    payment_date: "2026-01-12",
    amount: 500,
    payment_type: "Registration Fee",
    payment_status: "Paid",
    student_id: "S1002",
  },
  {
    payment_id: "P6003",
    payment_date: "2026-02-01",
    amount: 1200,
    payment_type: "Lab Fee",
    payment_status: "Partial",
    student_id: "S1001",
  },
];

export const initialActivities: ActivityItem[] = [
  {
    id: "act1",
    label: "System seeded with demo records",
    time: new Date().toISOString(),
    type: "info",
  },
  {
    id: "act2",
    label: "Enrollment E7001 marked active",
    time: new Date().toISOString(),
    type: "create",
  },
];

export function nextId(prefix: string, existing: string[]): string {
  const nums = existing
    .map((id) => {
      const m = id.match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
