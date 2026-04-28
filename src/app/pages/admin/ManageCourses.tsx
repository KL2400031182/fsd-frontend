import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, Clock, MapPin, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog';
import { useApp } from '../../context/AppContext';
import { Course, DEPARTMENTS, DEPT_COLORS, formatTime } from '../../data/mockData';

const DAYS_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const emptyCourse: Omit<Course, 'id'> = {
  code: '',
  name: '',
  instructor: '',
  credits: 3,
  department: 'Computer Science',
  description: '',
  capacity: 30,
  enrolled: 0,
  schedule: { days: ['Mon', 'Wed', 'Fri'], startTime: '09:00', endTime: '10:00', room: '' },
  semester: 'Spring 2026',
  prerequisites: [],
  syllabus: '',
};

export function ManageCourses() {
  const { courses, addCourse, updateCourse, deleteCourse } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id'>>(emptyCourse);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [prereqInput, setPrereqInput] = useState('');

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    const matchDept = deptFilter === 'All' || c.department === deptFilter;
    return matchSearch && matchDept;
  });

  const openAdd = () => {
    setEditingCourse(null);
    setForm(emptyCourse);
    setPrereqInput('');
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ ...course });
    setPrereqInput(course.prerequisites.join(', '));
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.code.trim() || !form.name.trim() || !form.instructor.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.schedule.days.length === 0) {
      toast.error('Please select at least one day');
      return;
    }
    const prereqs = prereqInput.split(',').map((p) => p.trim()).filter(Boolean);
    const courseData = { ...form, prerequisites: prereqs };

    if (editingCourse) {
      updateCourse({ ...courseData, id: editingCourse.id });
      toast.success(`Updated ${form.code}`);
    } else {
      addCourse(courseData);
      toast.success(`Added ${form.code} to catalog`);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    deleteCourse(id);
    toast.success(`Deleted ${code}`);
    setDeleteConfirm(null);
  };

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter((d) => d !== day)
          : [...prev.schedule.days, day],
      },
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900">Manage Courses</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} courses in catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">Course</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide hidden md:table-cell">Schedule</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide hidden sm:table-cell">Enrollment</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide hidden lg:table-cell">Credits</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((course) => {
                const colors = DEPT_COLORS[course.department] || DEPT_COLORS['Computer Science'];
                const pct = course.enrolled / course.capacity;
                return (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} flex-shrink-0`} style={{ fontWeight: 600 }}>
                          {course.code}
                        </span>
                        <div>
                          <p className="text-sm text-slate-900" style={{ fontWeight: 500 }}>{course.name}</p>
                          <p className="text-xs text-slate-500">{course.instructor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Clock className="w-3 h-3" />
                          {course.schedule.days.join('/')} · {formatTime(course.schedule.startTime)}–{formatTime(course.schedule.endTime)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" /> {course.schedule.room}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className={pct >= 1 ? 'text-rose-600' : pct >= 0.85 ? 'text-amber-600' : 'text-emerald-600'} style={{ fontWeight: 500 }}>
                            {course.enrolled}/{course.capacity}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 1 ? 'bg-rose-500' : pct >= 0.85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, pct * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{course.credits}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(course)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === course.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(course.id, course.code)}
                              className="p-1.5 text-white bg-rose-600 hover:bg-rose-500 rounded-lg text-xs transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(course.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No courses found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? `Edit ${editingCourse.code}` : 'Add New Course'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="text-sm text-slate-600 block mb-1">Course Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CS101"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Credits *</label>
              <select
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value={1}>1 Credit</option>
                <option value={2}>2 Credits</option>
                <option value={3}>3 Credits</option>
                <option value={4}>4 Credits</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600 block mb-1">Course Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Introduction to Computer Science"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Instructor *</label>
              <input
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                placeholder="e.g. Dr. Jane Smith"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description..."
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
              />
            </div>

            {/* Schedule */}
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600 block mb-2">Meeting Days</label>
              <div className="flex gap-2">
                {DAYS_OPTIONS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${form.schedule.days.includes(day)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Start Time</label>
              <input
                type="time"
                value={form.schedule.startTime}
                onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, startTime: e.target.value } })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">End Time</label>
              <input
                type="time"
                value={form.schedule.endTime}
                onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, endTime: e.target.value } })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Room</label>
              <input
                value={form.schedule.room}
                onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, room: e.target.value } })}
                placeholder="e.g. CS-101"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Capacity</label>
              <input
                type="number"
                value={form.capacity}
                min={1}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600 block mb-1">Prerequisites (comma-separated codes)</label>
              <input
                value={prereqInput}
                onChange={(e) => setPrereqInput(e.target.value)}
                placeholder="e.g. CS101, MATH101"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600 block mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Syllabus
              </label>
              <textarea
                value={form.syllabus ?? ''}
                onChange={(e) => setForm({ ...form, syllabus: e.target.value })}
                placeholder="Enter the course syllabus — topics covered, weekly plan, grading policy, required textbooks, etc."
                rows={6}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-y"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"
            >
              {editingCourse ? 'Save Changes' : 'Add Course'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
