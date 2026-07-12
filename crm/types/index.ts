export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: "admin" | "teacher" | "student";
  phone?: string;
}

export interface Student {
  id: number;
  user: User;
  birth_date?: string;
  address?: string;
  enrolled_at: string;
}

export interface Teacher {
  id: number;
  user: User;
  subject?: string;
  salary?: number;
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  duration_months: number;
  price: number;
}

export interface Group {
  id: number;
  course: Course;
  teacher: Teacher;
  name: string;
  start_date: string;
  end_date?: string;
  status: "active" | "finished" | "pending";
}

export interface Assignment {
  id: number;
  group: Group;
  teacher: Teacher;
  title: string;
  description?: string;
  due_date: string;
  created_at: string;
}

export interface Payment {
  id: number;
  student: Student;
  group: Group;
  amount: number;
  payment_date: string;
  status: "paid" | "pending" | "overdue";
  note?: string;
  created_at: string;
}

export interface DashboardStats {
  overview: {
    total_students: number;
    total_teachers: number;
    total_groups: number;
    total_courses: number;
  };
  groups: {
    active: number;
    finished: number;
  };
  payments: {
    total_paid: number;
    total_pending: number;
    total_overdue: number;
    total_debtors: number;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    attendance_rate: string;
  };
  assignments: {
    total: number;
    submissions: number;
    graded: number;
  };
  notifications: {
    unread: number;
  };
}