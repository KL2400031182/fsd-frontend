import { BookOpen, Users, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { DEPT_COLORS } from '../../data/mockData';

export function AdminOverview() {
  const { courses, registrations, students, getAllConflicts } = useApp();

  const conflicts = getAllConflicts();
  const activeRegs = registrations.filter((r) => r.status !== 'dropped');
  const enrolledCount = activeRegs.filter((r) => r.status === 'enrolled').length;
  const waitlistedCount = activeRegs.filter((r) => r.status === 'waitlisted').length;
  const totalSeats = courses.reduce((sum, c) => sum + c.capacity, 0);
  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolled, 0);
  const availableSeats = totalSeats - totalEnrolled;

  // Enrollment by department
  const deptData = Object.entries(
    courses.reduce<Record<string, { enrolled: number; capacity: number }>>((acc, c) => {
      if (!acc[c.department]) acc[c.department] = { enrolled: 0, capacity: 0 };
      acc[c.department].enrolled += c.enrolled;
      acc[c.department].capacity += c.capacity;
      return acc;
    }, {})
  ).map(([dept, val]) => ({
    name: dept.split(' ')[0], // Short name
    fullName: dept,
    enrolled: val.enrolled,
    capacity: val.capacity,
    fillPct: Math.round((val.enrolled / val.capacity) * 100),
  }));

  const stats = [
    {
      label: 'Total Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      sub: `Spring 2026`,
    },
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: `${enrolledCount} enrollments`,
    },
    {
      label: 'Available Seats',
      value: availableSeats,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      sub: `${Math.round((totalEnrolled / totalSeats) * 100)}% occupancy`,
    },
    {
      label: 'Active Conflicts',
      value: conflicts.length,
      icon: AlertTriangle,
      color: conflicts.length > 0 ? 'text-amber-600' : 'text-slate-400',
      bg: conflicts.length > 0 ? 'bg-amber-50' : 'bg-slate-50',
      sub: conflicts.length > 0 ? 'Needs resolution' : 'All clear',
    },
  ];

  const deptColorHex: Record<string, string> = {
    'Computer Science': '#3B82F6',
    'Mathematics': '#A855F7',
    'Physics': '#F97316',
    'English': '#10B981',
    'History': '#F59E0B',
    'Business': '#14B8A6',
    'Chemistry': '#F43F5E',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Spring 2026 · System Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className={`text-2xl ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Enrollment by Department */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-slate-900 mb-4 text-base">Enrollment by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value} / ${props.payload.capacity}`,
                  'Enrolled',
                ]}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName ?? label}
              />
              <Bar dataKey="enrolled" radius={[4, 4, 0, 0]}>
                {deptData.map((entry) => (
                  <Cell key={entry.name} fill={deptColorHex[entry.fullName] ?? '#6366F1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-slate-900 mb-4 text-base">Registration Overview</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">Enrolled</span>
              </div>
              <span className="text-sm text-emerald-700" style={{ fontWeight: 700 }}>{enrolledCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-slate-700">Waitlisted</span>
              </div>
              <span className="text-sm text-amber-700" style={{ fontWeight: 700 }}>{waitlistedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-sm text-slate-700">Conflicts</span>
              </div>
              <span className="text-sm text-rose-700" style={{ fontWeight: 700 }}>{conflicts.length}</span>
            </div>
          </div>

          {/* Capacity progress */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Overall Capacity</span>
              <span>{totalEnrolled} / {totalSeats} seats</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalEnrolled / totalSeats) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{Math.round((totalEnrolled / totalSeats) * 100)}% capacity used</p>
          </div>
        </div>
      </div>

      {/* Conflicts Table */}
      {conflicts.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-slate-900 text-base">Active Schedule Conflicts</h2>
          </div>
          <div className="space-y-3">
            {conflicts.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-xs text-amber-700 flex-shrink-0" style={{ fontWeight: 700 }}>
                  {c.student.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{c.student.name}</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    <span style={{ fontWeight: 600 }}>{c.courseA.code}</span> ({c.courseA.schedule.days.join('/')} {c.courseA.schedule.startTime}–{c.courseA.schedule.endTime})
                    {' '} conflicts with {' '}
                    <span style={{ fontWeight: 600 }}>{c.courseB.code}</span> ({c.courseB.schedule.days.join('/')} {c.courseB.schedule.startTime}–{c.courseB.schedule.endTime})
                  </p>
                </div>
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontWeight: 500 }}>
                  Unresolved
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Go to <span className="text-indigo-600" style={{ fontWeight: 500 }}>Registrations → Conflicts</span> to resolve these issues.
          </p>
        </div>
      )}

      {/* Course capacity table */}
      <div className="mt-5 bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-slate-900 text-base mb-4">Course Capacity Status</h2>
        <div className="space-y-2">
          {courses
            .sort((a, b) => b.enrolled / b.capacity - a.enrolled / a.capacity)
            .slice(0, 8)
            .map((c) => {
              const pct = c.enrolled / c.capacity;
              const colors = DEPT_COLORS[c.department] || DEPT_COLORS['Computer Science'];
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} flex-shrink-0 w-16 text-center`} style={{ fontWeight: 600 }}>
                    {c.code}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="truncate">{c.name}</span>
                      <span className="flex-shrink-0 ml-2">{c.enrolled}/{c.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 1 ? 'bg-rose-500' : pct >= 0.85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, pct * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
