export const ENDPOINTS = {
  auth: {
    login: "/auth/login/",
    refresh: "/auth/refresh/",
    me: "/auth/me/",
  },
  dashboard: "/dashboard/",
  students: {
    list: "/students/",
    detail: (id: number | string) => `/students/${id}/`,
  },
  teachers: {
    list: "/teachers/",
    detail: (id: number | string) => `/teachers/${id}/`,
  },
  courses: {
    list: "/courses/",
    detail: (id: number | string) => `/courses/${id}/`,
  },
  groups: {
    list: "/groups/",
    detail: (id: number | string) => `/groups/${id}/`,
  },
  assignments: {
    list: "/assignments/",
    detail: (id: number | string) => `/assignments/${id}/`,
    submit: (id: number | string) => `/assignments/${id}/submit/`,
  },
  payments: {
    list: "/payments/",
    debtors: "/payments/debtors/",
  },
  notifications: {
    list: "/notifications/",
  },
} as const;