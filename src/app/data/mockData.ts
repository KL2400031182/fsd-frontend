export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  department: string;
  description: string;
  capacity: number;
  enrolled: number;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    room: string;
  };
  semester: string;
  prerequisites: string[];
  syllabus?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  major: string;
  year: number;
  initials: string;
}

export interface Registration {
  id: string;
  studentId: string;
  courseId: string;
  status: 'enrolled' | 'waitlisted' | 'dropped';
  registeredAt: string;
}

export const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'English',
  'History',
  'Business',
  'Chemistry',
];

export const DEPT_COLORS: Record<string, { bg: string; text: string; border: string; schedule: string }> = {
  'Computer Science': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', schedule: 'bg-blue-500' },
  'Mathematics':      { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', schedule: 'bg-purple-500' },
  'Physics':          { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', schedule: 'bg-orange-500' },
  'English':          { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', schedule: 'bg-emerald-500' },
  'History':          { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', schedule: 'bg-amber-500' },
  'Business':         { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', schedule: 'bg-teal-500' },
  'Chemistry':        { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', schedule: 'bg-rose-500' },
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Emma Wilson',
    email: 'emma.wilson@university.edu',
    studentId: 'STU-2024-001',
    major: 'Computer Science',
    year: 3,
    initials: 'EW',
  },
  {
    id: 's2',
    name: 'James Chen',
    email: 'james.chen@university.edu',
    studentId: 'STU-2024-002',
    major: 'Mathematics',
    year: 2,
    initials: 'JC',
  },
  {
    id: 's3',
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@university.edu',
    studentId: 'STU-2024-003',
    major: 'Physics',
    year: 1,
    initials: 'SR',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    instructor: 'Dr. Alice Johnson',
    credits: 3,
    department: 'Computer Science',
    description: 'Fundamentals of programming, algorithms, and computational thinking. No prior experience required.',
    capacity: 30,
    enrolled: 28,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '10:00', room: 'CS-101' },
    semester: 'Spring 2026',
    prerequisites: [],
  },
  {
    id: 'c2',
    code: 'CS201',
    name: 'Data Structures',
    instructor: 'Prof. Brian Lee',
    credits: 3,
    department: 'Computer Science',
    description: 'Study of fundamental data structures including arrays, linked lists, trees, graphs, and hash tables.',
    capacity: 25,
    enrolled: 22,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '11:00', endTime: '12:00', room: 'CS-201' },
    semester: 'Spring 2026',
    prerequisites: ['CS101'],
  },
  {
    id: 'c3',
    code: 'CS301',
    name: 'Algorithm Design',
    instructor: 'Dr. Carol Nguyen',
    credits: 3,
    department: 'Computer Science',
    description: 'Design and analysis of algorithms. Topics include divide and conquer, dynamic programming, and greedy algorithms.',
    capacity: 20,
    enrolled: 18,
    schedule: { days: ['Tue', 'Thu'], startTime: '14:00', endTime: '15:30', room: 'CS-301' },
    semester: 'Spring 2026',
    prerequisites: ['CS201'],
  },
  {
    id: 'c4',
    code: 'CS401',
    name: 'Machine Learning',
    instructor: 'Dr. David Kim',
    credits: 4,
    department: 'Computer Science',
    description: 'Introduction to machine learning algorithms, neural networks, and statistical learning methods.',
    capacity: 20,
    enrolled: 19,
    schedule: { days: ['Tue', 'Thu'], startTime: '10:00', endTime: '11:30', room: 'CS-401' },
    semester: 'Spring 2026',
    prerequisites: ['CS201', 'MATH201'],
  },
  {
    id: 'c5',
    code: 'CS350',
    name: 'Database Systems',
    instructor: 'Prof. Emily Zhao',
    credits: 3,
    department: 'Computer Science',
    description: 'Relational databases, SQL, query optimization, transactions, and database design principles.',
    capacity: 25,
    enrolled: 15,
    schedule: { days: ['Tue', 'Thu'], startTime: '16:00', endTime: '17:30', room: 'CS-350' },
    semester: 'Spring 2026',
    prerequisites: ['CS201'],
  },
  {
    id: 'c6',
    code: 'MATH101',
    name: 'Calculus I',
    instructor: 'Dr. Frank Miller',
    credits: 4,
    department: 'Mathematics',
    description: 'Limits, derivatives, integrals, and the fundamental theorem of calculus.',
    capacity: 35,
    enrolled: 35,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '10:00', room: 'MATH-101' },
    semester: 'Spring 2026',
    prerequisites: [],
  },
  {
    id: 'c7',
    code: 'MATH201',
    name: 'Linear Algebra',
    instructor: 'Prof. Grace Park',
    credits: 3,
    department: 'Mathematics',
    description: 'Vectors, matrices, linear transformations, eigenvalues, and applications.',
    capacity: 30,
    enrolled: 27,
    schedule: { days: ['Tue', 'Thu'], startTime: '10:00', endTime: '11:30', room: 'MATH-201' },
    semester: 'Spring 2026',
    prerequisites: ['MATH101'],
  },
  {
    id: 'c8',
    code: 'MATH301',
    name: 'Statistics & Probability',
    instructor: 'Dr. Henry Brown',
    credits: 3,
    department: 'Mathematics',
    description: 'Probability theory, random variables, distributions, hypothesis testing, and regression analysis.',
    capacity: 30,
    enrolled: 20,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '14:00', endTime: '15:00', room: 'MATH-301' },
    semester: 'Spring 2026',
    prerequisites: ['MATH101'],
  },
  {
    id: 'c9',
    code: 'PHYS101',
    name: 'Physics I: Mechanics',
    instructor: 'Dr. Isabel Torres',
    credits: 4,
    department: 'Physics',
    description: 'Classical mechanics including kinematics, Newtons laws, energy, momentum, and rotational motion.',
    capacity: 30,
    enrolled: 26,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '11:00', room: 'PHY-101' },
    semester: 'Spring 2026',
    prerequisites: [],
  },
  {
    id: 'c10',
    code: 'PHYS201',
    name: 'Physics II: Electromagnetism',
    instructor: 'Prof. Jack White',
    credits: 4,
    department: 'Physics',
    description: 'Electric fields, magnetic fields, Maxwells equations, and electromagnetic waves.',
    capacity: 25,
    enrolled: 22,
    schedule: { days: ['Tue', 'Thu'], startTime: '13:00', endTime: '14:30', room: 'PHY-201' },
    semester: 'Spring 2026',
    prerequisites: ['PHYS101'],
  },
  {
    id: 'c11',
    code: 'ENG101',
    name: 'English Composition',
    instructor: 'Dr. Karen Davis',
    credits: 3,
    department: 'English',
    description: 'Academic writing skills, argumentation, research methodology, and critical analysis of texts.',
    capacity: 25,
    enrolled: 24,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '13:00', endTime: '14:00', room: 'ENG-101' },
    semester: 'Spring 2026',
    prerequisites: [],
  },
  {
    id: 'c12',
    code: 'ENG201',
    name: 'Technical Writing',
    instructor: 'Prof. Liam Scott',
    credits: 3,
    department: 'English',
    description: 'Writing for technical and professional contexts including reports, proposals, and documentation.',
    capacity: 20,
    enrolled: 12,
    schedule: { days: ['Tue', 'Thu'], startTime: '15:30', endTime: '17:00', room: 'ENG-201' },
    semester: 'Spring 2026',
    prerequisites: ['ENG101'],
  },
  {
    id: 'c13',
    code: 'HIST101',
    name: 'World History',
    instructor: 'Dr. Mia Clark',
    credits: 3,
    department: 'History',
    description: 'Survey of major civilizations, events, and themes in world history from ancient times to the modern era.',
    capacity: 40,
    enrolled: 38,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '15:00', endTime: '16:00', room: 'HIST-101' },
    semester: 'Spring 2026',
    prerequisites: [],
  },
  {
    id: 'c14',
    code: 'BUS101',
    name: 'Business Fundamentals',
    instructor: 'Prof. Noah Adams',
    credits: 3,
    department: 'Business',
    description: 'Introduction to business concepts including management, marketing, finance, and entrepreneurship.',
    capacity: 35,
    enrolled: 32,
    schedule: { days: ['Tue', 'Thu'], startTime: '09:00', endTime: '10:30', room: 'BUS-101' },
    semester: 'Spring 2026',
    prerequisites: [],
  },
  {
    id: 'c15',
    code: 'BUS201',
    name: 'Marketing Principles',
    instructor: 'Dr. Olivia Martinez',
    credits: 3,
    department: 'Business',
    description: 'Core marketing concepts, consumer behavior, market research, and digital marketing strategies.',
    capacity: 30,
    enrolled: 25,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '11:00', endTime: '12:00', room: 'BUS-201' },
    semester: 'Spring 2026',
    prerequisites: ['BUS101'],
  },
  {
    id: 'c16',
    code: 'CHEM101',
    name: 'General Chemistry I',
    instructor: 'Dr. Peter Evans',
    credits: 4,
    department: 'Chemistry',
    description: 'Atomic structure, bonding, stoichiometry, thermodynamics, and introduction to organic chemistry.',
    capacity: 30,
    enrolled: 28,
    schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '10:00', endTime: '11:00', room: 'CHEM-101' },
    semester: 'Spring 2026',
    prerequisites: [],
  },
];

// Initial registrations — Sofia (s3) has a PHYS101 + CHEM101 conflict (both MWF 10-11)
export const INITIAL_REGISTRATIONS: Registration[] = [
  // Emma Wilson (s1): CS101, CS201, MATH301, ENG101
  { id: 'r1', studentId: 's1', courseId: 'c1', status: 'enrolled', registeredAt: '2026-01-10T09:00:00Z' },
  { id: 'r2', studentId: 's1', courseId: 'c2', status: 'enrolled', registeredAt: '2026-01-10T09:05:00Z' },
  { id: 'r3', studentId: 's1', courseId: 'c8', status: 'enrolled', registeredAt: '2026-01-10T09:10:00Z' },
  { id: 'r4', studentId: 's1', courseId: 'c11', status: 'enrolled', registeredAt: '2026-01-10T09:15:00Z' },
  // James Chen (s2): MATH101, CS301, PHYS101 (waitlisted — cap full), HIST101
  { id: 'r5', studentId: 's2', courseId: 'c6', status: 'enrolled', registeredAt: '2026-01-11T10:00:00Z' },
  { id: 'r6', studentId: 's2', courseId: 'c3', status: 'enrolled', registeredAt: '2026-01-11T10:05:00Z' },
  { id: 'r7', studentId: 's2', courseId: 'c9', status: 'waitlisted', registeredAt: '2026-01-11T10:10:00Z' },
  { id: 'r8', studentId: 's2', courseId: 'c13', status: 'enrolled', registeredAt: '2026-01-11T10:15:00Z' },
  // Sofia Rodriguez (s3): PHYS101, CHEM101 (CONFLICT!), CS101, ENG201
  { id: 'r9',  studentId: 's3', courseId: 'c9',  status: 'enrolled', registeredAt: '2026-01-12T11:00:00Z' },
  { id: 'r10', studentId: 's3', courseId: 'c16', status: 'enrolled', registeredAt: '2026-01-12T11:05:00Z' },
  { id: 'r11', studentId: 's3', courseId: 'c1',  status: 'enrolled', registeredAt: '2026-01-12T11:10:00Z' },
  { id: 'r12', studentId: 's3', courseId: 'c12', status: 'enrolled', registeredAt: '2026-01-12T11:15:00Z' },
];

// Utility functions
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function coursesConflict(a: Course, b: Course): boolean {
  const sharedDays = a.schedule.days.filter((d) => b.schedule.days.includes(d));
  if (!sharedDays.length) return false;
  const startA = timeToMinutes(a.schedule.startTime);
  const endA = timeToMinutes(a.schedule.endTime);
  const startB = timeToMinutes(b.schedule.startTime);
  const endB = timeToMinutes(b.schedule.endTime);
  return startA < endB && startB < endA;
}
