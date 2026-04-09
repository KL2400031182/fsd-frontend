import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPT_COLORS, formatTime, coursesConflict, Course } from '../../data/mockData';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const START_HOUR = 8; // 8 AM
const END_HOUR = 21;  // 9 PM
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT = 64; // px per hour
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function getTopPx(time: string) {
  return ((timeToMinutes(time) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

function getHeightPx(start: string, end: string) {
  return ((timeToMinutes(end) - timeToMinutes(start)) / 60) * HOUR_HEIGHT;
}

function formatHour(hour: number) {
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

export function MySchedule() {
  const { currentUser, getEnrolledCourses, getConflictsForStudent } = useApp();
  const student = currentUser?.student;
  if (!student) return null;

  const enrolledCourses = getEnrolledCourses(student.id);
  const conflicts = getConflictsForStudent(student.id);
  const conflictIds = new Set(conflicts.flatMap((c) => [c.courseA.id, c.courseB.id]));

  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);

  // Group courses by day
  const coursesByDay: Record<string, Course[]> = {};
  DAYS.forEach((day) => {
    coursesByDay[day] = enrolledCourses.filter((c) => c.schedule.days.includes(day));
  });

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-900">My Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">
            Spring 2026 · {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} · {totalCredits} credits
          </p>
        </div>
        <div className="text-right">
          {conflicts.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-full" style={{ fontWeight: 600 }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
            </span>
          ) : enrolledCourses.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded-full" style={{ fontWeight: 600 }}>
              No Conflicts
            </span>
          ) : null}
        </div>
      </div>

      {/* Conflict Banners */}
      {conflicts.map((c, i) => (
        <div
          key={i}
          className="mb-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm" style={{ fontWeight: 600 }}>Schedule Conflict</p>
            <p className="text-amber-700 text-xs mt-0.5">
              <span style={{ fontWeight: 600 }}>{c.courseA.code}</span> ({c.courseA.schedule.days.join('/')} {formatTime(c.courseA.schedule.startTime)})
              {' '}overlaps with{' '}
              <span style={{ fontWeight: 600 }}>{c.courseB.code}</span> ({c.courseB.schedule.days.join('/')} {formatTime(c.courseB.schedule.startTime)})
            </p>
          </div>
        </div>
      ))}

      {enrolledCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600">No enrolled courses yet</p>
          <p className="text-slate-400 text-sm">Register for courses from the Course Catalog</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Day headers */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div className="w-14 flex-shrink-0" />
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="flex-1 text-center py-3 border-l border-slate-200 text-sm text-slate-600"
                style={{ fontWeight: 600 }}
              >
                <span className="hidden sm:block">{DAY_FULL[i]}</span>
                <span className="sm:hidden">{day}</span>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="flex overflow-x-auto">
            {/* Time labels */}
            <div className="w-14 flex-shrink-0 relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-2 text-xs text-slate-400"
                  style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT - 7}px` }}
                >
                  {hour <= END_HOUR ? formatHour(hour) : ''}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex-1 relative border-l border-slate-200 min-w-[120px]"
                style={{ height: `${TOTAL_HEIGHT}px` }}
              >
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-slate-100"
                    style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                  />
                ))}
                {/* Half-hour lines */}
                {hours.slice(0, -1).map((hour) => (
                  <div
                    key={`${hour}-half`}
                    className="absolute w-full border-t border-slate-50"
                    style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                  />
                ))}

                {/* Course blocks */}
                {coursesByDay[day].map((course) => {
                  const colors = DEPT_COLORS[course.department] || DEPT_COLORS['Computer Science'];
                  const isConflict = conflictIds.has(course.id);
                  const top = getTopPx(course.schedule.startTime);
                  const height = getHeightPx(course.schedule.startTime, course.schedule.endTime);

                  return (
                    <div
                      key={course.id}
                      className={`absolute left-0.5 right-0.5 rounded-lg p-1.5 text-white shadow-sm overflow-hidden ${
                        isConflict ? 'ring-2 ring-amber-400 ring-offset-1' : ''
                      }`}
                      style={{
                        top: `${top + 1}px`,
                        height: `${height - 2}px`,
                        backgroundColor: (() => {
                          const scheduleColor = colors.schedule;
                          const colorMap: Record<string, string> = {
                            'bg-blue-500': '#3B82F6',
                            'bg-purple-500': '#A855F7',
                            'bg-orange-500': '#F97316',
                            'bg-emerald-500': '#10B981',
                            'bg-amber-500': '#F59E0B',
                            'bg-teal-500': '#14B8A6',
                            'bg-rose-500': '#F43F5E',
                          };
                          return colorMap[scheduleColor] || '#6366F1';
                        })(),
                      }}
                    >
                      <p className="text-xs leading-tight truncate" style={{ fontWeight: 700 }}>{course.code}</p>
                      {height > 40 && (
                        <p className="text-xs opacity-90 truncate leading-tight">{course.name}</p>
                      )}
                      {height > 56 && (
                        <p className="text-xs opacity-80 leading-tight">
                          {course.schedule.room}
                        </p>
                      )}
                      {isConflict && (
                        <AlertTriangle className="absolute top-1 right-1 w-3 h-3 text-amber-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {enrolledCourses.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {enrolledCourses.map((c) => {
            const colors = DEPT_COLORS[c.department] || DEPT_COLORS['Computer Science'];
            const isConflict = conflictIds.has(c.id);
            const colorMap: Record<string, string> = {
              'bg-blue-500': '#3B82F6',
              'bg-purple-500': '#A855F7',
              'bg-orange-500': '#F97316',
              'bg-emerald-500': '#10B981',
              'bg-amber-500': '#F59E0B',
              'bg-teal-500': '#14B8A6',
              'bg-rose-500': '#F43F5E',
            };
            const hex = colorMap[colors.schedule] || '#6366F1';
            return (
              <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                {c.code} — {c.name}
                {isConflict && <AlertTriangle className="w-3 h-3 text-amber-500 ml-0.5" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
