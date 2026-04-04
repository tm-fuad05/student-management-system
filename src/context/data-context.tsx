"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  initialActivities,
  initialAttendance,
  initialCourses,
  initialDepartments,
  initialEnrollments,
  initialPayments,
  initialResults,
  initialSections,
  initialSemesters,
  initialStudents,
  initialTeachers,
} from "@/lib/mock-data";
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
} from "@/lib/types";

function uid() {
  return crypto.randomUUID();
}

type DataContextValue = {
  departments: Department[];
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  semesters: Semester[];
  sections: Section[];
  enrollments: Enrollment[];
  attendance: Attendance[];
  results: Result[];
  payments: Payment[];
  activities: ActivityItem[];
  log: (
    label: string,
    type?: ActivityItem["type"],
    meta?: { student_id?: string },
  ) => void;
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  setResults: React.Dispatch<React.SetStateAction<Result[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [courses, setCourses] = useState(initialCourses);
  const [semesters, setSemesters] = useState(initialSemesters);
  const [sections, setSections] = useState(initialSections);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [results, setResults] = useState(initialResults);
  const [payments, setPayments] = useState(initialPayments);
  const [activities, setActivities] = useState(initialActivities);

  const log = useCallback(
    (
      label: string,
      type: ActivityItem["type"] = "info",
      meta?: { student_id?: string },
    ) => {
      const item: ActivityItem = {
        id: uid(),
        label,
        time: new Date().toISOString(),
        type,
        ...(meta?.student_id ? { student_id: meta.student_id } : {}),
      };
      setActivities((prev) => [item, ...prev].slice(0, 50));
    },
    [],
  );

  const value = useMemo(
    () => ({
      departments,
      students,
      teachers,
      courses,
      semesters,
      sections,
      enrollments,
      attendance,
      results,
      payments,
      activities,
      log,
      setDepartments,
      setStudents,
      setTeachers,
      setCourses,
      setSemesters,
      setSections,
      setEnrollments,
      setAttendance,
      setResults,
      setPayments,
    }),
    [
      departments,
      students,
      teachers,
      courses,
      semesters,
      sections,
      enrollments,
      attendance,
      results,
      payments,
      activities,
      log,
    ],
  );

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
