export type UserRole = "admin" | "academic_staff" | "teacher";

export interface AuthUser {
  username: string;
  role: UserRole;
}

export interface Department {
  dept_id: string;
  dept_name: string;
  office_room: string;
  phone: string;
}

export interface Student {
  student_id: string;
  student_name: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  admission_date: string;
  dept_id: string;
}

export interface Teacher {
  teacher_id: string;
  teacher_name: string;
  designation: string;
  phone: string;
  email: string;
  hire_date: string;
  dept_id: string;
}

export interface Course {
  course_id: string;
  course_code: string;
  course_title: string;
  credit: number;
  dept_id: string;
}

export interface Semester {
  semester_id: string;
  semester_name: string;
  start_date: string;
  end_date: string;
}

export type EnrollmentStatus = "Active" | "Dropped" | "Completed";

export interface Enrollment {
  enrollment_id: string;
  enroll_date: string;
  status: EnrollmentStatus;
  student_id: string;
  section_id: string;
}

export interface Section {
  section_id: string;
  section_name: string;
  room_no: string;
  schedule_time: string;
  course_id: string;
  teacher_id: string;
  semester_id: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Late";

export interface Attendance {
  attendance_id: string;
  attendance_date: string;
  attendance_status: AttendanceStatus;
  enrollment_id: string;
}

export interface Result {
  result_id: string;
  marks: number;
  grade: string;
  result_publish_date: string;
  enrollment_id: string;
}

export type PaymentType = "Tuition Fee" | "Registration Fee" | "Lab Fee";
export type PaymentRecordStatus = "Paid" | "Pending" | "Partial";

export interface Payment {
  payment_id: string;
  payment_date: string;
  amount: number;
  payment_type: PaymentType;
  payment_status: PaymentRecordStatus;
  student_id: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  time: string;
  type: "create" | "update" | "delete" | "info";
}

export type ModuleKey =
  | "dashboard"
  | "departments"
  | "students"
  | "teachers"
  | "courses"
  | "semesters"
  | "sections"
  | "enrollments"
  | "attendance"
  | "results"
  | "payments"
  | "reports";
