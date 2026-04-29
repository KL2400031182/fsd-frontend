import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  Course,
  Student,
  Registration,
  coursesConflict,
  INITIAL_COURSES,
  INITIAL_REGISTRATIONS,
  MOCK_STUDENTS,
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
  isMockMode: boolean;

  loginByEmail: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  requestAdminOtp: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyAdminOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  signupStudent: (data: { name: string; email: string; password: string; major: string; year: number }) => Promise<{ success: boolean; message: string }>;
  signupAdmin: (data: { name: string; email: string; password: string; accessCode: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  login: (role: UserRole, studentId?: string) => void;

  registerCourse: (courseId: string) => Promise<{ success: boolean; message: string }>;
  dropCourse: (courseId: string) => Promise<void>;

  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  updateRegistrationStatus: (regId: string, status: Registration['status']) => Promise<void>;
  dropRegistrationAdmin: (regId: string) => Promise<void>;

  getStudentRegistrations: (studentId: string) => Registration[];
  getEnrolledCourses: (studentId: string) => Course[];
  getConflictsForStudent: (studentId: string) => Array<{ courseA: Course; courseB: Course }>;
  getAllConflicts: () => Array<{ student: Student; courseA: Course; courseB: Course }>;
}

const AppContext = createContext<AppContextType | null>(null);

// ─── Mock in-memory store ────────────────────────────────────────────────────
// Seeded from existing mock data; mutated in place when in mock mode.
let mockStudents: Student[] = [...MOCK_STUDENTS];
let mockCourses: Course[] = INITIAL_COURSES.map((c) => ({ ...c }));
let mockRegistrations: Registration[] = [...INITIAL_REGISTRATIONS];
// Demo password map: email → password (plain, demo only)
const mockPasswords: Record<string, string> = {
  'emma.wilson@university.edu': 'demo',
  'james.chen@university.edu': 'demo',
  'sofia.rodriguez@university.edu': 'demo',
  'admin@university.edu': 'Admin@123',
};
const ADMIN_ACCESS_CODE = 'ADMIN2026';
let nextId = 1000;
function uid() { return String(++nextId); }

async function canReachBackend(): Promise<boolean> {
  try {
    const res = await fetch('/api/courses', { signal: AbortSignal.timeout(2500) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: string };
    if (j?.message && typeof j.message === 'string') return j.message;
  } catch { /* plain text */ }
  return text || res.statusText || 'Request failed';
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);
  const backendChecked = useRef(false);
  const mockMode = useRef(false);

  // ── Backend probe on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const alive = await canReachBackend();
      mockMode.current = !alive;
      setIsMockMode(!alive);
      backendChecked.current = true;

      if (!alive) {
        // Seed UI from mock data
        setCourses(mockCourses.map((c) => ({ ...c })));
        setRegistrations([...mockRegistrations]);
      } else {
        // Load from real backend
        try {
          const res = await fetch('/api/courses');
          if (res.ok) setCourses((await res.json()) as Course[]);
        } catch { /* ignore */ }
      }
    })();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const syncMockCourses = () => setCourses(mockCourses.map((c) => ({ ...c })));
  const syncMockRegs = () => setRegistrations([...mockRegistrations]);

  const loadCoursesReal = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) setCourses((await res.json()) as Course[]);
    } catch { /* ignore */ }
  }, []);

  const fetchRegsReal = useCallback(async (u: CurrentUser) => {
    try {
      if (u.role === 'admin') {
        const res = await fetch('/api/registrations');
        if (res.ok) setRegistrations((await res.json()) as Registration[]);
      } else if (u.student) {
        const res = await fetch(`/api/registrations/student/${u.student.id}`);
        if (res.ok) setRegistrations((await res.json()) as Registration[]);
      }
    } catch { /* ignore */ }
  }, []);

  const loadStudentsReal = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) setStudents((await res.json()) as Student[]);
    } catch { /* ignore */ }
  }, []);

  // ── React to user changes ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) { setRegistrations([]); return; }
    if (mockMode.current) {
      if (currentUser.role === 'student' && currentUser.student) {
        setRegistrations(mockRegistrations.filter((r) => r.studentId === currentUser.student!.id && r.status !== 'dropped'));
      } else {
        setRegistrations([...mockRegistrations]);
      }
    } else {
      void fetchRegsReal(currentUser);
    }
  }, [currentUser, fetchRegsReal]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') { setStudents([]); return; }
    if (mockMode.current) {
      setStudents([...mockStudents]);
    } else {
      void loadStudentsReal();
    }
  }, [currentUser, loadStudentsReal]);

  // ── Auth: loginByEmail ─────────────────────────────────────────────────────
  const loginByEmail = useCallback(async (email: string, password: string, role: UserRole) => {
    if (!email.trim() || !password.trim()) return { success: false, message: 'Please fill in all fields.' };

    if (mockMode.current) {
      const stored = mockPasswords[email.trim().toLowerCase()];
      if (!stored || stored !== password) return { success: false, message: 'Invalid email or password.' };
      if (role === 'admin') {
        const isAdmin = email.trim().toLowerCase() === 'admin@university.edu';
        if (!isAdmin) return { success: false, message: 'This account is not an admin.' };
        setCurrentUser({ role: 'admin', admin: { id: 'a1', name: 'Administrator', email: email.trim() } });
        return { success: true, message: 'Welcome back, Administrator!' };
      }
      const student = mockStudents.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
      if (!student) return { success: false, message: 'Student account not found.' };
      setCurrentUser({ role: 'student', student });
      return { success: true, message: `Welcome back, ${student.name}!` };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role }),
      });
      const text = await res.text();
      if (!res.ok) return { success: false, message: text || 'Login failed.' };
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
      return { success: false, message: 'Cannot reach the server.' };
    }
  }, []);

  // ── Auth: requestAdminOtp ──────────────────────────────────────────────────
  const requestAdminOtp = useCallback(async (email: string, password: string) => {
    if (mockMode.current) {
      const stored = mockPasswords[email.trim().toLowerCase()];
      if (!stored || stored !== password) return { success: false, message: 'Invalid credentials.' };
      if (email.trim().toLowerCase() !== 'admin@university.edu') return { success: false, message: 'Not an admin account.' };
      // In mock mode, OTP is always "123456"
      return { success: true, message: 'OTP sent! In demo mode, use: 123456' };
    }
    try {
      const res = await fetch('/api/auth/admin/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const text = await res.text();
      if (!res.ok) return { success: false, message: text || 'Failed to send OTP.' };
      return { success: true, message: 'OTP sent! Check the backend console for your OTP (demo mode).' };
    } catch {
      return { success: false, message: 'Cannot reach the server.' };
    }
  }, []);

  // ── Auth: verifyAdminOtp ───────────────────────────────────────────────────
  const verifyAdminOtp = useCallback(async (email: string, otp: string) => {
    if (mockMode.current) {
      if (otp.trim() !== '123456') return { success: false, message: 'Invalid OTP. Demo OTP is 123456.' };
      setCurrentUser({ role: 'admin', admin: { id: 'a1', name: 'Administrator', email: email.trim() } });
      return { success: true, message: 'Welcome, Administrator!' };
    }
    try {
      const res = await fetch('/api/auth/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const text = await res.text();
      if (!res.ok) return { success: false, message: text || 'OTP verification failed.' };
      const data = JSON.parse(text) as AuthResponse;
      if (data.role === 'admin' && data.admin) {
        setCurrentUser({ role: 'admin', admin: data.admin });
        return { success: true, message: `Welcome, ${data.admin.name}!` };
      }
      return { success: false, message: 'Unexpected response from server.' };
    } catch {
      return { success: false, message: 'Cannot reach the server.' };
    }
  }, []);

  // ── Auth: signupStudent ────────────────────────────────────────────────────
  const signupStudent = useCallback(async (data: { name: string; email: string; password: string; major: string; year: number }) => {
    if (mockMode.current) {
      const emailLower = data.email.trim().toLowerCase();
      if (mockStudents.some((s) => s.email.toLowerCase() === emailLower)) {
        return { success: false, message: 'An account with this email already exists.' };
      }
      const initials = data.name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
      const student: Student = {
        id: `s${uid()}`,
        name: data.name.trim(),
        email: emailLower,
        studentId: `STU-2026-${uid()}`,
        major: data.major,
        year: data.year,
        initials,
      };
      mockStudents = [...mockStudents, student];
      mockPasswords[emailLower] = data.password;
      setCurrentUser({ role: 'student', student });
      return { success: true, message: `Account created! Welcome, ${student.name}!` };
    }

    try {
      const res = await fetch('/api/auth/register/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name.trim(), email: data.email.trim(), password: data.password, major: data.major, year: data.year }),
      });
      const text = await res.text();
      if (!res.ok) return { success: false, message: text || 'Signup failed.' };
      const body = JSON.parse(text) as AuthResponse;
      if (body.student) {
        setCurrentUser({ role: 'student', student: body.student });
        return { success: true, message: `Account created! Welcome, ${body.student.name}!` };
      }
      return { success: false, message: 'Unexpected signup response.' };
    } catch {
      return { success: false, message: 'Cannot reach the server. Start MySQL and the backend, then retry.' };
    }
  }, []);

  // ── Auth: signupAdmin ──────────────────────────────────────────────────────
  const signupAdmin = useCallback(async (data: { name: string; email: string; password: string; accessCode: string }) => {
    if (mockMode.current) {
      if (data.accessCode.trim() !== ADMIN_ACCESS_CODE) {
        return { success: false, message: 'Invalid access code. Demo code: ADMIN2026' };
      }
      const emailLower = data.email.trim().toLowerCase();
      mockPasswords[emailLower] = data.password;
      const admin: AdminAccount = { id: `a${uid()}`, name: data.name.trim(), email: emailLower };
      setCurrentUser({ role: 'admin', admin });
      return { success: true, message: `Admin account created! Welcome, ${admin.name}!` };
    }

    try {
      const res = await fetch('/api/auth/register/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name.trim(), email: data.email.trim(), password: data.password, accessCode: data.accessCode }),
      });
      const text = await res.text();
      if (!res.ok) return { success: false, message: text || 'Signup failed.' };
      const body = JSON.parse(text) as AuthResponse;
      if (body.admin) {
        setCurrentUser({ role: 'admin', admin: body.admin });
        return { success: true, message: `Admin account created! Welcome, ${body.admin.name}!` };
      }
      return { success: false, message: 'Unexpected signup response.' };
    } catch {
      return { success: false, message: 'Cannot reach the server.' };
    }
  }, []);

  const login = useCallback((role: UserRole, studentId?: string) => {
    if (role === 'admin') {
      setCurrentUser({ role: 'admin', admin: { id: '0', name: 'Administrator', email: 'admin@university.edu' } });
    } else if (role === 'student' && studentId) {
      const student = mockStudents.find((s) => s.id === studentId);
      if (student) setCurrentUser({ role: 'student', student });
    }
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  // ── Course ops ─────────────────────────────────────────────────────────────
  const registerCourse = useCallback(async (courseId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser?.student) return { success: false, message: 'Not logged in.' };
    const course = (mockMode.current ? mockCourses : courses).find((c) => c.id === courseId);

    if (mockMode.current) {
      const studentId = currentUser.student.id;
      const existing = mockRegistrations.find((r) => r.studentId === studentId && r.courseId === courseId && r.status !== 'dropped');
      if (existing) return { success: false, message: 'Already registered for this course.' };
      const courseIdx = mockCourses.findIndex((c) => c.id === courseId);
      if (courseIdx === -1) return { success: false, message: 'Course not found.' };
      const c = mockCourses[courseIdx];
      const status: Registration['status'] = c.enrolled < c.capacity ? 'enrolled' : 'waitlisted';
      if (status === 'enrolled') mockCourses[courseIdx] = { ...c, enrolled: c.enrolled + 1 };
      const reg: Registration = { id: `r${uid()}`, studentId, courseId, status, registeredAt: new Date().toISOString() };
      mockRegistrations = [...mockRegistrations, reg];
      syncMockCourses();
      setRegistrations(mockRegistrations.filter((r) => r.studentId === studentId && r.status !== 'dropped'));
      const msg = status === 'enrolled' ? `Successfully enrolled in ${course?.code ?? 'course'}!` : `Added to waitlist for ${course?.code ?? 'course'}.`;
      return { success: true, message: msg };
    }

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentUser.student.id, courseId }),
      });
      if (!res.ok) return { success: false, message: await readErrorMessage(res) };
      const reg = (await res.json()) as Registration;
      await loadCoursesReal();
      await fetchRegsReal(currentUser);
      const msg = reg.status === 'enrolled' ? `Successfully enrolled in ${course?.code ?? 'course'}!` : `Added to waitlist for ${course?.code ?? 'course'}.`;
      return { success: true, message: msg };
    } catch {
      return { success: false, message: 'Network error.' };
    }
  }, [currentUser, courses, loadCoursesReal, fetchRegsReal]);

  const dropCourse = useCallback(async (courseId: string) => {
    if (!currentUser?.student) return;
    const studentId = currentUser.student.id;

    if (mockMode.current) {
      const regIdx = mockRegistrations.findIndex((r) => r.studentId === studentId && r.courseId === courseId && r.status !== 'dropped');
      if (regIdx === -1) return;
      const wasEnrolled = mockRegistrations[regIdx].status === 'enrolled';
      mockRegistrations = mockRegistrations.map((r, i) => i === regIdx ? { ...r, status: 'dropped' } : r);
      if (wasEnrolled) {
        const cIdx = mockCourses.findIndex((c) => c.id === courseId);
        if (cIdx !== -1) mockCourses[cIdx] = { ...mockCourses[cIdx], enrolled: Math.max(0, mockCourses[cIdx].enrolled - 1) };
        // Promote first waitlisted
        const waitIdx = mockRegistrations.findIndex((r) => r.courseId === courseId && r.status === 'waitlisted');
        if (waitIdx !== -1) {
          mockRegistrations[waitIdx] = { ...mockRegistrations[waitIdx], status: 'enrolled' };
          if (cIdx !== -1) mockCourses[cIdx] = { ...mockCourses[cIdx], enrolled: mockCourses[cIdx].enrolled + 1 };
        }
      }
      syncMockCourses();
      setRegistrations(mockRegistrations.filter((r) => r.studentId === studentId && r.status !== 'dropped'));
      return;
    }

    try {
      const res = await fetch(`/api/registrations/student/${studentId}/courses/${courseId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      await loadCoursesReal();
      await fetchRegsReal(currentUser);
    } catch { /* ignore */ }
  }, [currentUser, loadCoursesReal, fetchRegsReal]);

  const addCourse = useCallback((courseData: Omit<Course, 'id'>) => {
    if (mockMode.current) {
      const course: Course = { ...courseData, id: `c${uid()}`, enrolled: courseData.enrolled ?? 0 };
      mockCourses = [...mockCourses, course];
      syncMockCourses();
      return;
    }
    void (async () => {
      try {
        const res = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...courseData, enrolled: courseData.enrolled ?? 0 }) });
        if (res.ok) await loadCoursesReal();
      } catch { /* ignore */ }
    })();
  }, [loadCoursesReal]);

  const updateCourse = useCallback((course: Course) => {
    if (mockMode.current) {
      mockCourses = mockCourses.map((c) => c.id === course.id ? { ...course } : c);
      syncMockCourses();
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/api/courses/${course.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(course) });
        if (res.ok) await loadCoursesReal();
      } catch { /* ignore */ }
    })();
  }, [loadCoursesReal]);

  const deleteCourse = useCallback((courseId: string) => {
    if (mockMode.current) {
      mockCourses = mockCourses.filter((c) => c.id !== courseId);
      mockRegistrations = mockRegistrations.filter((r) => r.courseId !== courseId);
      syncMockCourses();
      if (currentUser?.role === 'admin') setRegistrations([...mockRegistrations]);
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) return;
        await loadCoursesReal();
        if (currentUser) await fetchRegsReal(currentUser);
      } catch { /* ignore */ }
    })();
  }, [currentUser, loadCoursesReal, fetchRegsReal]);

  const updateRegistrationStatus = useCallback(async (regId: string, status: Registration['status']) => {
    if (status === 'dropped') return;
    if (mockMode.current) {
      mockRegistrations = mockRegistrations.map((r) => r.id === regId ? { ...r, status } : r);
      setRegistrations([...mockRegistrations]);
      return;
    }
    try {
      const res = await fetch(`/api/registrations/${regId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) return;
      await loadCoursesReal();
      if (currentUser) await fetchRegsReal(currentUser);
    } catch { /* ignore */ }
  }, [currentUser, loadCoursesReal, fetchRegsReal]);

  const dropRegistrationAdmin = useCallback(async (regId: string) => {
    if (mockMode.current) {
      mockRegistrations = mockRegistrations.filter((r) => r.id !== regId);
      setRegistrations([...mockRegistrations]);
      return;
    }
    try {
      const res = await fetch(`/api/registrations/${regId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      await loadCoursesReal();
      if (currentUser) await fetchRegsReal(currentUser);
    } catch { /* ignore */ }
  }, [currentUser, loadCoursesReal, fetchRegsReal]);

  // ── Derived selectors ──────────────────────────────────────────────────────
  const getStudentRegistrations = useCallback(
    (studentId: string) => registrations.filter((r) => r.studentId === studentId && r.status !== 'dropped'),
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
      for (let i = 0; i < enrolled.length; i++)
        for (let j = i + 1; j < enrolled.length; j++)
          if (coursesConflict(enrolled[i], enrolled[j]))
            conflicts.push({ courseA: enrolled[i], courseB: enrolled[j] });
      return conflicts;
    },
    [getEnrolledCourses]
  );

  const getAllConflicts = useCallback(() => {
    const result: Array<{ student: Student; courseA: Course; courseB: Course }> = [];
    for (const student of students) {
      for (const c of getConflictsForStudent(student.id))
        result.push({ student, courseA: c.courseA, courseB: c.courseB });
    }
    return result;
  }, [students, getConflictsForStudent]);

  return (
    <AppContext.Provider
      value={{
        currentUser, courses, registrations, students, isMockMode,
        loginByEmail, requestAdminOtp, verifyAdminOtp,
        signupStudent, signupAdmin, logout, login,
        registerCourse, dropCourse,
        addCourse, updateCourse, deleteCourse,
        updateRegistrationStatus, dropRegistrationAdmin,
        getStudentRegistrations, getEnrolledCourses,
        getConflictsForStudent, getAllConflicts,
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
