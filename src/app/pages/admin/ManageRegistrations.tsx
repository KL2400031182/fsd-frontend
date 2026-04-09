import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, XCircle, Users, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { DEPT_COLORS, formatTime } from '../../data/mockData';

type TabType = 'all' | 'conflicts';

export function ManageRegistrations() {
  const {
    courses,
    registrations,
    students,
    getAllConflicts,
    updateRegistrationStatus,
    dropRegistrationAdmin,
  } = useApp();

  const [tab, setTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const conflicts = getAllConflicts();

  const activeRegs = registrations.filter((r) => r.status !== 'dropped');
  const filtered = activeRegs.filter((r) => {
    const student = students.find((s) => s.id === r.studentId);
    const course = courses.find((c) => c.id === r.courseId);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      student?.name.toLowerCase().includes(q) ||
      course?.name.toLowerCase().includes(q) ||
      course?.code.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (regId: string, newStatus: 'enrolled' | 'waitlisted') => {
    await updateRegistrationStatus(regId, newStatus);
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleDrop = async (regId: string, courseCode: string, studentName: string) => {
    await dropRegistrationAdmin(regId);
    toast.success(`Dropped ${courseCode} for ${studentName}`);
  };

  const handleResolveConflict = async (regId: string, courseCode: string, studentName: string) => {
    await dropRegistrationAdmin(regId);
    toast.success(`Resolved conflict: dropped ${courseCode} for ${studentName}`);
  };

  const statusBadge = (status: string) => {
    if (status === 'enrolled')
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
          <CheckCircle className="w-3 h-3" /> Enrolled
        </span>
      );
    if (status === 'waitlisted')
      return (
        <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
          <Clock className="w-3 h-3" /> Waitlisted
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
        <XCircle className="w-3 h-3" /> Dropped
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-900">Registrations</h1>
        <p className="text-slate-500 text-sm mt-1">
          {activeRegs.length} active registrations · {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('all')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
          style={{ fontWeight: tab === 'all' ? 600 : 400 }}
        >
          <Users className="w-4 h-4" />
          All Registrations
          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{activeRegs.length}</span>
        </button>
        <button
          onClick={() => setTab('conflicts')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === 'conflicts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
          style={{ fontWeight: tab === 'conflicts' ? 600 : 400 }}
        >
          <AlertTriangle className="w-4 h-4" />
          Conflicts
          {conflicts.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
              {conflicts.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'all' && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="enrolled">Enrolled</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>

          {/* Group by student */}
          {students.map((student) => {
            const studentRegs = filtered.filter((r) => r.studentId === student.id);
            if (studentRegs.length === 0) return null;

            return (
              <div key={student.id} className="bg-white border border-slate-200 rounded-xl mb-4 overflow-hidden">
                {/* Student header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
                    {student.initials}
                  </div>
                  <div>
                    <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{student.name}</p>
                    <p className="text-xs text-slate-500">{student.studentId} · {student.major} · Year {student.year}</p>
                  </div>
                  <span className="ml-auto text-xs text-slate-500">{studentRegs.length} registration{studentRegs.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Registrations */}
                <div className="divide-y divide-slate-100">
                  {studentRegs.map((reg) => {
                    const course = courses.find((c) => c.id === reg.courseId);
                    if (!course) return null;
                    const colors = DEPT_COLORS[course.department] || DEPT_COLORS['Computer Science'];

                    return (
                      <div key={reg.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                        <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${colors.bg} ${colors.text}`} style={{ fontWeight: 600 }}>
                          {course.code}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 truncate">{course.name}</p>
                          <p className="text-xs text-slate-500">
                            {course.schedule.days.join('/')} · {formatTime(course.schedule.startTime)}–{formatTime(course.schedule.endTime)} · {course.schedule.room}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {statusBadge(reg.status)}
                          {reg.status === 'waitlisted' && (
                            <button
                              onClick={() => handleStatusChange(reg.id, 'enrolled')}
                              className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {reg.status === 'enrolled' && (
                            <button
                              onClick={() => handleStatusChange(reg.id, 'waitlisted')}
                              className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full transition-colors"
                            >
                              Waitlist
                            </button>
                          )}
                          <button
                            onClick={() => handleDrop(reg.id, course.code, student.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Drop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No registrations found</p>
            </div>
          )}
        </>
      )}

      {tab === 'conflicts' && (
        <div>
          {conflicts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-700" style={{ fontWeight: 600 }}>No Schedule Conflicts</p>
              <p className="text-slate-400 text-sm mt-1">All student schedules are conflict-free</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-amber-800 text-sm">
                  <span style={{ fontWeight: 600 }}>{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}</span> detected across student schedules. 
                  Drop one of the conflicting courses to resolve.
                </p>
              </div>

              {conflicts.map((conflict, i) => {
                const regA = registrations.find(
                  (r) => r.studentId === conflict.student.id && r.courseId === conflict.courseA.id && r.status !== 'dropped'
                );
                const regB = registrations.find(
                  (r) => r.studentId === conflict.student.id && r.courseId === conflict.courseB.id && r.status !== 'dropped'
                );

                const sharedDays = conflict.courseA.schedule.days.filter((d) =>
                  conflict.courseB.schedule.days.includes(d)
                );

                return (
                  <div key={i} className="bg-white border border-amber-200 rounded-xl overflow-hidden">
                    {/* Student */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border-b border-amber-200">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
                        {conflict.student.initials}
                      </div>
                      <div>
                        <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>{conflict.student.name}</p>
                        <p className="text-xs text-amber-700">
                          Conflict on {sharedDays.join(', ')} — overlapping time slots
                        </p>
                      </div>
                      <span className="ml-auto flex items-center gap-1 text-xs text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                        <AlertTriangle className="w-3 h-3" /> Conflict
                      </span>
                    </div>

                    {/* Conflicting courses */}
                    <div className="divide-y divide-slate-100">
                      {[
                        { course: conflict.courseA, reg: regA },
                        { course: conflict.courseB, reg: regB },
                      ].map(({ course, reg }) => {
                        if (!reg) return null;
                        const colors = DEPT_COLORS[course.department] || DEPT_COLORS['Computer Science'];
                        return (
                          <div key={course.id} className="flex items-center gap-3 px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${colors.bg} ${colors.text}`} style={{ fontWeight: 600 }}>
                              {course.code}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800">{course.name}</p>
                              <p className="text-xs text-slate-500">
                                {course.schedule.days.join('/')} · {formatTime(course.schedule.startTime)}–{formatTime(course.schedule.endTime)} · {course.schedule.room}
                              </p>
                            </div>
                            <button
                              onClick={() => handleResolveConflict(reg.id, course.code, conflict.student.name)}
                              className="flex items-center gap-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Drop to Resolve
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
