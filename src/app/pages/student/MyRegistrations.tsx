import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, BookOpen, Trash2, ClipboardList, X, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { Course, DEPT_COLORS, formatTime } from '../../data/mockData';

type TabType = 'all' | 'enrolled' | 'waitlisted';

export function MyRegistrations() {
  const { currentUser, courses, getStudentRegistrations, dropCourse, getConflictsForStudent } = useApp();
  const [tab, setTab] = useState<TabType>('all');
  const [dropping, setDropping] = useState<string | null>(null);
  const [syllabusSlide, setSyllabusSlide] = useState<Course | null>(null);

  const student = currentUser?.student;
  if (!student) return null;

  const registrations = getStudentRegistrations(student.id);
  const conflicts = getConflictsForStudent(student.id);
  const conflictCourseIds = new Set(conflicts.flatMap((c) => [c.courseA.id, c.courseB.id]));

  const enriched = registrations
    .map((reg) => ({
      reg,
      course: courses.find((c) => c.id === reg.courseId),
    }))
    .filter((e) => e.course);

  const filtered = enriched.filter((e) => {
    if (tab === 'enrolled') return e.reg.status === 'enrolled';
    if (tab === 'waitlisted') return e.reg.status === 'waitlisted';
    return true;
  });

  const totalCredits = enriched
    .filter((e) => e.reg.status === 'enrolled')
    .reduce((sum, e) => sum + (e.course?.credits ?? 0), 0);

  const handleDrop = async (courseId: string, courseCode: string) => {
    await dropCourse(courseId);
    toast.success(`Dropped ${courseCode}`);
    setDropping(null);
  };

  const tabCounts = {
    all: enriched.length,
    enrolled: enriched.filter((e) => e.reg.status === 'enrolled').length,
    waitlisted: enriched.filter((e) => e.reg.status === 'waitlisted').length,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-900">My Registrations</h1>
        <p className="text-slate-500 text-sm mt-1">
          Spring 2026 · {tabCounts.enrolled} enrolled · {totalCredits} credits
        </p>
      </div>

      {/* Conflict alerts */}
      {conflicts.length > 0 && (
        <div className="mb-4 space-y-2">
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm" style={{ fontWeight: 600 }}>Schedule Conflict Detected</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  <span style={{ fontWeight: 600 }}>{c.courseA.code}</span> and{' '}
                  <span style={{ fontWeight: 600 }}>{c.courseB.code}</span> overlap on{' '}
                  {c.courseA.schedule.days.filter((d) => c.courseB.schedule.days.includes(d)).join(', ')}.
                  Please drop one of these courses.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl text-emerald-600" style={{ fontWeight: 700 }}>{tabCounts.enrolled}</p>
          <p className="text-slate-500 text-xs mt-0.5">Enrolled</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl text-amber-600" style={{ fontWeight: 700 }}>{tabCounts.waitlisted}</p>
          <p className="text-slate-500 text-xs mt-0.5">Waitlisted</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl text-indigo-600" style={{ fontWeight: 700 }}>{totalCredits}</p>
          <p className="text-slate-500 text-xs mt-0.5">Credits</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
        {(['all', 'enrolled', 'waitlisted'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg transition-colors capitalize ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            style={{ fontWeight: tab === t ? 600 : 400 }}
          >
            {t}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>
              {tabCounts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Course cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No registrations in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ reg, course }) => {
            if (!course) return null;
            const colors = DEPT_COLORS[course.department] || DEPT_COLORS['Computer Science'];
            const hasConflict = conflictCourseIds.has(course.id);

            return (
              <div
                key={reg.id}
                className={`bg-white border rounded-xl p-4 transition-shadow hover:shadow-md ${
                  hasConflict ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 px-2.5 py-1 rounded-lg text-xs flex-shrink-0 ${colors.bg} ${colors.text}`} style={{ fontWeight: 600 }}>
                    {course.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-slate-900 text-sm">{course.name}</h3>
                        <p className="text-slate-500 text-xs mt-0.5">{course.instructor}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {reg.status === 'enrolled' && (
                          <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                            <CheckCircle className="w-3 h-3" /> Enrolled
                          </span>
                        )}
                        {reg.status === 'waitlisted' && (
                          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                            <Clock className="w-3 h-3" /> Waitlisted
                          </span>
                        )}
                        {hasConflict && (
                          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                            <AlertTriangle className="w-3 h-3" /> Conflict
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span>{course.schedule.days.join('/')} · {formatTime(course.schedule.startTime)} – {formatTime(course.schedule.endTime)}</span>
                      <span>{course.schedule.room}</span>
                      <span>{course.credits} credits</span>
                      <span>{course.department}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          Registered {new Date(reg.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {/* Syllabus button */}
                        <button
                          onClick={() => setSyllabusSlide(course)}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Syllabus
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {dropping === course.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Confirm drop?</span>
                          <button
                            onClick={() => handleDrop(course.id, course.code)}
                            className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Yes, drop
                          </button>
                          <button
                            onClick={() => setDropping(null)}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDropping(course.id)}
                          className="flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Drop Course
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Syllabus Slide Panel ── */}
      {/* Backdrop */}
      {syllabusSlide && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setSyllabusSlide(null)}
        />
      )}

      {/* Slide panel from right */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          syllabusSlide ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {syllabusSlide && (() => {
          const colors = DEPT_COLORS[syllabusSlide.department] || DEPT_COLORS['Computer Science'];
          return (
            <>
              {/* Slide Header */}
              <div className={`flex items-start justify-between p-5 border-b border-slate-100 ${colors.bg}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl bg-white/70 border ${colors.border}`}>
                    <BookOpen className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-white/70 ${colors.text} border ${colors.border}`} style={{ fontWeight: 600 }}>
                      {syllabusSlide.code}
                    </span>
                    <h2 className="text-slate-900 text-base mt-1 leading-snug" style={{ fontWeight: 700 }}>
                      {syllabusSlide.name}
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">{syllabusSlide.instructor} · {syllabusSlide.credits} credits</p>
                  </div>
                </div>
                <button
                  onClick={() => setSyllabusSlide(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/70 rounded-xl transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slide Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Course meta */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Department', value: syllabusSlide.department },
                    { label: 'Semester', value: syllabusSlide.semester },
                    { label: 'Schedule', value: `${syllabusSlide.schedule.days.join('/')} · ${formatTime(syllabusSlide.schedule.startTime)}–${formatTime(syllabusSlide.schedule.endTime)}` },
                    { label: 'Room', value: syllabusSlide.schedule.room || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                      <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {syllabusSlide.description && (
                  <div>
                    <h3 className="text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Course Description</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{syllabusSlide.description}</p>
                  </div>
                )}

                {/* Prerequisites */}
                {syllabusSlide.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Prerequisites</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {syllabusSlide.prerequisites.map((p) => (
                        <span key={p} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Syllabus content */}
                <div>
                  <h3 className="text-sm text-slate-700 mb-2 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Syllabus
                  </h3>
                  {syllabusSlide.syllabus && syllabusSlide.syllabus.trim() ? (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {syllabusSlide.syllabus}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No syllabus has been added for this course yet.</p>
                      <p className="text-slate-300 text-xs mt-1">Check back later or contact your instructor.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setSyllabusSlide(null)}
                  className="w-full py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
