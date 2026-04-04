import type {
  ActivityItem,
  Attendance,
  Course,
  Enrollment,
  Payment,
  Result,
  Section,
  Semester,
  Student,
} from "./types";

export type PaymentSummary = {
  totalPaid: number;
  totalPending: number;
  totalPartial: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
  byType: Record<string, number>;
};

export function summarizePaymentsForStudent(
  studentId: string,
  payments: Payment[],
): PaymentSummary {
  const mine = payments.filter((p) => p.student_id === studentId);
  let totalPaid = 0;
  let totalPending = 0;
  let totalPartial = 0;
  let pendingCount = 0;
  let partialCount = 0;
  let paidCount = 0;
  const byType: Record<string, number> = {};

  for (const p of mine) {
    byType[p.payment_type] = (byType[p.payment_type] ?? 0) + p.amount;
    if (p.payment_status === "Paid") {
      paidCount += 1;
      totalPaid += p.amount;
    } else if (p.payment_status === "Pending") {
      pendingCount += 1;
      totalPending += p.amount;
    } else {
      partialCount += 1;
      totalPartial += p.amount;
    }
  }

  return {
    totalPaid,
    totalPending,
    totalPartial,
    pendingCount,
    partialCount,
    paidCount,
    byType,
  };
}

export type TimelineEntry = {
  sortKey: string;
  label: string;
  detail: string;
  kind: string;
};

export function buildStudentTimeline(
  student: Student,
  enrollments: Enrollment[],
  payments: Payment[],
  attendance: Attendance[],
  results: Result[],
  sections: Section[],
  courses: Course[],
  semesters: Semester[],
  activities: ActivityItem[],
): TimelineEntry[] {
  const sid = student.student_id;
  const rows: TimelineEntry[] = [];

  rows.push({
    sortKey: `${student.admission_date}T00:00:00.000Z`,
    label: "Admission recorded",
    detail: `Department placement · ${student.admission_date}`,
    kind: "admission",
  });

  for (const e of enrollments.filter((x) => x.student_id === sid)) {
    const sec = sections.find((s) => s.section_id === e.section_id);
    const c = sec ? courses.find((co) => co.course_id === sec.course_id) : undefined;
    const sem = sec ? semesters.find((sm) => sm.semester_id === sec.semester_id) : undefined;
    rows.push({
      sortKey: `${e.enroll_date}T12:00:00.000Z`,
      label: `Enrollment · ${e.status}`,
      detail: `${sec?.section_name ?? e.section_id}${c ? ` · ${c.course_code}` : ""}${sem ? ` · ${sem.semester_name}` : ""}`,
      kind: "enrollment",
    });
  }

  for (const p of payments.filter((x) => x.student_id === sid)) {
    rows.push({
      sortKey: `${p.payment_date}T12:00:00.000Z`,
      label: `Payment · ${p.payment_type}`,
      detail: `$${p.amount.toLocaleString()} · ${p.payment_status}`,
      kind: "payment",
    });
  }

  const enIds = new Set(
    enrollments.filter((x) => x.student_id === sid).map((x) => x.enrollment_id),
  );
  for (const a of attendance.filter((x) => enIds.has(x.enrollment_id))) {
    rows.push({
      sortKey: `${a.attendance_date}T${a.attendance_id}`,
      label: `Attendance · ${a.attendance_status}`,
      detail: `Enrollment ${a.enrollment_id} · ${a.attendance_date}`,
      kind: "attendance",
    });
  }

  for (const r of results.filter((x) => {
    const en = enrollments.find((e) => e.enrollment_id === x.enrollment_id);
    return en?.student_id === sid;
  })) {
    rows.push({
      sortKey: `${r.result_publish_date}T12:00:00.000Z`,
      label: "Result published",
      detail: `Marks ${r.marks} · Grade ${r.grade}`,
      kind: "result",
    });
  }

  for (const act of activities) {
    if (act.student_id === sid) {
      rows.push({
        sortKey: act.time,
        label: act.label,
        detail: `Activity log · ${act.type}`,
        kind: "activity",
      });
    }
  }

  rows.sort((a, b) => (a.sortKey < b.sortKey ? 1 : a.sortKey > b.sortKey ? -1 : 0));

  return rows;
}

export function attendanceRowsForStudent(
  studentId: string,
  enrollments: Enrollment[],
  attendance: Attendance[],
  sections: Section[],
  courses: Course[],
): {
  attendance_id: string;
  date: string;
  status: string;
  courseLabel: string;
  enrollment_id: string;
}[] {
  const enIds = new Set(
    enrollments.filter((e) => e.student_id === studentId).map((e) => e.enrollment_id),
  );
  return attendance
    .filter((a) => enIds.has(a.enrollment_id))
    .map((a) => {
      const en = enrollments.find((e) => e.enrollment_id === a.enrollment_id);
      const sec = en
        ? sections.find((s) => s.section_id === en.section_id)
        : undefined;
      const c = sec
        ? courses.find((co) => co.course_id === sec.course_id)
        : undefined;
      return {
        attendance_id: a.attendance_id,
        date: a.attendance_date,
        status: a.attendance_status,
        courseLabel: c ? `${c.course_code} · ${sec?.section_name}` : a.enrollment_id,
        enrollment_id: a.enrollment_id,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
