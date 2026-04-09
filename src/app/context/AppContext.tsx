import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Course,
  Student,
  Registration,
  coursesConflict,
} from '../data/mockData';

export type UserRole = 'admin' | 'student';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
}

export interface CurrentUser {
  role: UserRole;
  student?: Student;
  admin?: AdminAccount;
}

interface AuthResponse {
  role: string;
  student?: Student;
  admin?: AdminAccount;
}

interface AppContextType {
  currentUser: CurrentUser | null;
  courses: Course[];
  registrations: Registration[];
  students: Student[];

  loginByEmail: (
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ success: boolean; message: string }>;
  signupStudent: (data: {
    name: string;
    email: string;
    password: string;
    major: string;
    year: number;
  }) => Promise<{ success: boolean; message: string }>;
  signupAdmin: (data: {
    name: string;
    email: string;
    password: string;
    accessCode: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  login: (role: UserRole, studentId?: string) => void;

  registerCourse: (courseId: string) => Promise<{ success: boolean; message: string }>;
  dropCourse: (courseId: string) => Promise<void>;

  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  updateRegistrationStatus: (
    regId: string,
    status: Registration['status']
  ) => Promise<void>;
  dropRegistrationAdmin: (regId: string) => Promise<void>;

  getStudentRegistrations: (studentId: string) => Registration[];
  getEnrolledCourses: (studentId: string) => Course[];
  getConflictsForStudent: (studentId: string) => Array<{ courseA: Course; courseB: Course }>;
  getAllConflicts: () => Array<{ student: Student; courseA: Course; courseB: Course }>;
}

const AppContext = createContext<AppContextType | null>(null);

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: string };
    if (j?.message && typeof j.message === 'string') return j.message;
  } catch {
    /* plain text */
  }
  return text || res.statusText || 'Request failed';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const loadCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) return;
      const data = (await res.json()) as Course[];
      setCourses(data);
    } catch {
      /* keep existing */
    }
  }, []);

  const fetchRegistrationsForUser = useCallback(async (u: CurrentUser) => {
    try {
      if (u.role === 'admin') {
        const res = await fetch('/api/registrations');
        if (res.ok) setRegistrations((await res.json()) as Registration[]);
        return;
      }
      if (u.role === 'student' && u.student) {
        const res = await fetch(`/api/registrations/student/${u.student.id}`);
        if (res.ok) setRegistrations((await res.json()) as Registration[]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const loadStudentsForAdmin = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) setStudents((await res.json()) as Student[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (!currentUser) {
      setRegistrations([]);
      return;
    }
    void fetchRegistrationsForUser(currentUser);
  }, [currentUser, fetchRegistrationsForUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setStudents([]);
      return;
    }
    void loadStudentsForAdmin();
  }, [currentUser, loadStudentsForAdmin]);

  const loginByEmail = useCallback(async (email: string, password: string, role: UserRole) => {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Please fill in all fields.' };
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role }),
      });
      const text = await res.text();
      if (!res.ok) {
        return { success: false, message: text || 'Login failed.' };
      }
      const data = JSON.parse(text) as AuthResponse;
      if (data.role === 'student' && data.student) {
        setCurrentUser({ role: 'student', student: data.student });
        return { success: true, message: `Welcome back, ${data.student.name}!` };
      }
      if (data.role === 'admin' && data.admin) {
        setCurrentUser({ role: 'admin', admin: data.admin });
        return { success: true, message: `Welcome back, ${data.admin.name}!` };
      }
      return { success: false, message: 'Unexpected login response.' };
    } catch {
      return {
        success: false,
        message: 'Cannot reach the server. Start MySQL, run the Spring Boot backend, then retry.',
      };
    }
  }, []);

  const signupStudent = useCallback(
    async (data: { name: string; email: string; password: string; major: string; year: number }) => {
      try {
        const res = await fetch('/api/auth/register/student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            password: data.password,
            major: data.major,
            year: data.year,
          }),
        });
        const text = await res.text();
        if (!res.ok) {
          return { success: false, message: text || 'Signup failed.' };
        }
        const body = JSON.parse(text) as AuthResponse;
        if (body.student) {
          setCurrentUser({ role: 'student', student: body.student });
          return { success: true, message: `Account created! Welcome, ${body.student.name}!` };
        }
        return { success: false, message: 'Unexpected signup response.' };
      } catch {
        return {
          success: false,
          message: 'Cannot reach the server. Start MySQL and the backend, then retry.',
        };
      }
    },
    []
  );

  const signupAdmin = useCallback(
    async (data: { name: string; email: string; password: string; accessCode: string }) => {
      try {
        const res = await fetch('/api/auth/register/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            password: data.password,
            accessCode: data.accessCode,
          }),
        });
        const text = await res.text();
        if (!res.ok) {
          return { success: false, message: text || 'Signup failed.' };
        }
        const body = JSON.parse(text) as AuthResponse;
        if (body.admin) {
          setCurrentUser({ role: 'admin', admin: body.admin });
          return { success: true, message: `Admin account created! Welcome, ${body.admin.name}!` };
        }
        return { success: false, message: 'Unexpected signup response.' };
      } catch {
        return {
          success: false,
          message: 'Cannot reach the server. Start MySQL and the backend, then retry.',
        };
      }
    },
    []
  );

  const login = useCallback(
    (role: UserRole, studentId?: string) => {
      if (role === 'admin') {
        setCurrentUser({
          role: 'admin',
          admin: { id: '0', name: 'Administrator', email: 'admin@university.edu' },
        });
      } else if (role === 'student' && studentId) {
        const student = students.find((s) => s.id === studentId);
        if (student) setCurrentUser({ role: 'student', student });
      }
    },
    [students]
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  const getStudentRegistrations = useCallback(
    (studentId: string) =>
      registrations.filter((r) => r.studentId === studentId && r.status !== 'dropped'),
    [registrations]
  );

  const getEnrolledCourses = useCallback(
    (studentId: string) => {
      const regs = registrations.filter((r) => r.studentId === studentId && r.status === 'enrolled');
      return regs.map((r) => courses.find((c) => c.id === r.courseId)).filter(Boolean) as Course[];
    },
    [registrations, courses]
  );

  const getConflictsForStudent = useCallback(
    (studentId: string) => {
      const enrolled = getEnrolledCourses(studentId);
      const conflicts: Array<{ courseA: Course; courseB: Course }> = [];
      for (let i = 0; i < enrolled.length; i++) {
        for (let j = i + 1; j < enrolled.length; j++) {
          if (coursesConflict(enrolled[i], enrolled[j])) {
            conflicts.push({ courseA: enrolled[i], courseB: enrolled[j] });
          }
        }
      }
      return conflicts;
    },
    [getEnrolledCourses]
  );

  const getAllConflicts = useCallback(() => {
    const result: Array<{ student: Student; courseA: Course; courseB: Course }> = [];
    for (const student of students) {
      const conflicts = getConflictsForStudent(student.id);
      for (const c of conflicts) {
        result.push({ student, courseA: c.courseA, courseB: c.courseB });
      }
    }
    return result;
  }, [students, getConflictsForStudent]);

  const registerCourse = useCallback(
    async (courseId: string): Promise<{ success: boolean; message: string }> => {
      if (!currentUser?.student) return { success: false, message: 'Not logged in.' };
      const course = courses.find((c) => c.id === courseId);
      try {
        const res = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: currentUser.student.id, courseId }),
        });
        if (!res.ok) {
          const msg = await readErrorMessage(res);
          return { success: false, message: msg };
        }
        const reg = (await res.json()) as Registration;
        await loadCourses();
        if (currentUser) await fetchRegistrationsForUser(currentUser);
        const msg =
          reg.status === 'enrolled'
            ? `Successfully enrolled in ${course?.code ?? 'course'}!`
            : `Added to waitlist for ${course?.code ?? 'course'}.`;
        return { success: true, message: msg };
      } catch {
        return { success: false, message: 'Network error.' };
      }
    },
    [currentUser, courses, loadCourses, fetchRegistrationsForUser]
  );

  const dropCourse = useCallback(
    async (courseId: string) => {
      if (!currentUser?.student) return;
      const studentId = currentUser.student.id;
      try {
        const res = await fetch(`/api/registrations/student/${studentId}/courses/${courseId}`, {
          method: 'DELETE',
        });
        if (!res.ok && res.status !== 204) return;
        await loadCourses();
        await fetchRegistrationsForUser(currentUser);
      } catch {
        /* ignore */
      }
    },
    [currentUser, loadCourses, fetchRegistrationsForUser]
  );

  const addCourse = useCallback(
    (courseData: Omit<Course, 'id'>) => {
      void (async () => {
        try {
          const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...courseData, enrolled: courseData.enrolled ?? 0 }),
          });
          if (!res.ok) return;
          await loadCourses();
        } catch {
          /* ignore */
        }
      })();
    },
    [loadCourses]
  );

  const updateCourse = useCallback(
    (course: Course) => {
      void (async () => {
        try {
          const res = await fetch(`/api/courses/${course.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course),
          });
          if (!res.ok) return;
          await loadCourses();
        } catch {
          /* ignore */
        }
      })();
    },
    [loadCourses]
  );

  const deleteCourse = useCallback(
    (courseId: string) => {
      void (async () => {
        try {
          const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 204) return;
          await loadCourses();
          if (currentUser) await fetchRegistrationsForUser(currentUser);
          if (currentUser?.role === 'admin') await loadStudentsForAdmin();
        } catch {
          /* ignore */
        }
      })();
    },
    [loadCourses, currentUser, fetchRegistrationsForUser, loadStudentsForAdmin]
  );

  const updateRegistrationStatus = useCallback(
    async (regId: string, status: Registration['status']) => {
      if (status === 'dropped') return;
      try {
        const res = await fetch(`/api/registrations/${regId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) return;
        await loadCourses();
        if (currentUser) await fetchRegistrationsForUser(currentUser);
      } catch {
        /* ignore */
      }
    },
    [loadCourses, currentUser, fetchRegistrationsForUser]
  );

  const dropRegistrationAdmin = useCallback(
    async (regId: string) => {
      try {
        const res = await fetch(`/api/registrations/${regId}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) return;
        await loadCourses();
        if (currentUser) await fetchRegistrationsForUser(currentUser);
      } catch {
        /* ignore */
      }
    },
    [loadCourses, currentUser, fetchRegistrationsForUser]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        courses,
        registrations,
        students,
        loginByEmail,
        signupStudent,
        signupAdmin,
        logout,
        login,
        registerCourse,
        dropCourse,
        addCourse,
        updateCourse,
        deleteCourse,
        updateRegistrationStatus,
        dropRegistrationAdmin,
        getStudentRegistrations,
        getEnrolledCourses,
        getConflictsForStudent,
        getAllConflicts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
