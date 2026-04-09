import { useState } from 'react';
import { Search, Filter, Users, Clock, MapPin, BookOpen, CheckCircle, AlertCircle, PlusCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS, DEPT_COLORS, formatTime, coursesConflict } from '../../data/mockData';

export function CourseCatalog() {
  const { courses, currentUser, registerCourse, getStudentRegistrations, getEnrolledCourses } = useApp();
  const student = currentUser?.student;
  const studentRegs = student ? getStudentRegistrations(student.id) : [];
  const enrolledCourses = student ? getEnrolledCourses(student.id) : [];

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [creditsFilter, setCreditsFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q);
    const matchDept = deptFilter === 'All' || c.department === deptFilter;
    const matchCredits = creditsFilter === 'All' || c.credits.toString() === creditsFilter;
    return matchSearch && matchDept && matchCredits;
  });

  const getRegStatus = (courseId: string) => {
    return studentRegs.find((r) => r.courseId === courseId)?.status ?? null;
  };

  const getConflictWith = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return null;
    return enrolledCourses.find((ec) => ec.id !== courseId && coursesConflict(course, ec));
  };

  const handleRegister = async (courseId: string) => {
    const result = await registerCourse(courseId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const seatColor = (c: typeof courses[0]) => {
    const pct = c.enrolled / c.capacity;
    if (pct >= 1) return 'text-rose-600';
    if (pct >= 0.85) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-900">Course Catalog</h1>
        <p className="text-slate-500 text-sm mt-1">Spring 2026 · {courses.length} courses available</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${
            showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {(deptFilter !== 'All' || creditsFilter !== 'All') && (
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white border border-slate-200 rounded-xl">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Credits</label>
            <select
              value={creditsFilter}
              onChange={(e) => setCreditsFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="All">All Credits</option>
              <option value="3">3 Credits</option>
              <option value="4">4 Credits</option>
            </select>
          </div>
          {(deptFilter !== 'All' || creditsFilter !== 'All') && (
            <div className="flex items-end">
              <button
                onClick={() => { setDeptFilter('All'); setCreditsFilter('All'); }}
                className="text-xs text-indigo-600 hover:underline pb-1.5"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-slate-400 mb-3">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Course List */}
      <div className="space-y-3">
        {filtered.map((course) => {
          const colors = DEPT_COLORS[course.department] || DEPT_COLORS['Computer Science'];
          const regStatus = getRegStatus(course.id);
          const conflictCourse = !regStatus ? getConflictWith(course.id) : null;
          const isFull = course.enrolled >= course.capacity;
          const isExpanded = expandedId === course.id;

          return (
            <div
              key={course.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Main Row */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 px-2.5 py-1 rounded-lg text-xs flex-shrink-0 ${colors.bg} ${colors.text}`} style={{ fontWeight: 600 }}>
                    {course.code}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-slate-900 text-sm leading-snug">{course.name}</h3>
                        <p className="text-slate-500 text-xs mt-0.5">{course.instructor}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status badge */}
                        {regStatus === 'enrolled' && (
                          <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Enrolled
                          </span>
                        )}
                        {regStatus === 'waitlisted' && (
                          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Waitlisted
                          </span>
                        )}
                        {regStatus === 'dropped' && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            Dropped
                          </span>
                        )}
                        {!regStatus && isFull && (
                          <span className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Full</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {course.schedule.days.join('/')} {formatTime(course.schedule.startTime)}–{formatTime(course.schedule.endTime)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" /> {course.schedule.room}
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${seatColor(course)}`}>
                        <Users className="w-3 h-3" />
                        {course.enrolled}/{course.capacity} seats
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <BookOpen className="w-3 h-3" /> {course.credits} cr
                      </span>
                    </div>

                    {conflictCourse && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Conflicts with {conflictCourse.code}: {conflictCourse.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : course.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {isExpanded ? 'Hide details' : 'View details'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {!regStatus && (
                    <button
                      onClick={() => handleRegister(course.id)}
                      className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      {isFull ? 'Join Waitlist' : 'Register'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-3">{course.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span><span className="text-slate-700" style={{ fontWeight: 600 }}>Department:</span> {course.department}</span>
                    <span><span className="text-slate-700" style={{ fontWeight: 600 }}>Semester:</span> {course.semester}</span>
                    {course.prerequisites.length > 0 && (
                      <span>
                        <span className="text-slate-700" style={{ fontWeight: 600 }}>Prerequisites:</span> {course.prerequisites.join(', ')}
                      </span>
                    )}
                  </div>
                  {/* Enrollment bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Enrollment</span>
                      <span>{Math.round((course.enrolled / course.capacity) * 100)}% full</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          course.enrolled / course.capacity >= 1
                            ? 'bg-rose-500'
                            : course.enrolled / course.capacity >= 0.85
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (course.enrolled / course.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No courses found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
