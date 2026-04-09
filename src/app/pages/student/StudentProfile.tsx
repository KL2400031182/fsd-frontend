import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { User, Mail, GraduationCap, Hash, Calendar, Save, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

export function StudentProfile() {
  const { currentUser, getConflictsForStudent, getStudentRegistrations } = useApp();
  const student = currentUser?.student;

  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No student profile found</p>
        </div>
      </div>
    );
  }

  const conflicts = getConflictsForStudent(student.id);
  const registrations = getStudentRegistrations(student.id);
  const enrolledCount = registrations.filter((r) => r.status === 'enrolled').length;
  const waitlistedCount = registrations.filter((r) => r.status === 'waitlisted').length;

  const handleSave = () => {
    // In a real app, this would save to the database
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-slate-900 text-2xl mb-1" style={{ fontWeight: 700 }}>
            My Profile
          </h1>
          <p className="text-slate-600 text-sm">Manage your account information and preferences</p>
        </div>

        {/* Profile Avatar & Quick Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0" style={{ fontWeight: 700 }}>
                {student.initials}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-slate-900 text-xl mb-1" style={{ fontWeight: 700 }}>
                  {student.name}
                </h2>
                <p className="text-slate-600 text-sm mb-3">{student.studentId}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {student.major}
                  </Badge>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                    <Calendar className="w-3 h-3 mr-1" />
                    Year {student.year}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl text-slate-900" style={{ fontWeight: 700 }}>
                    {enrolledCount}
                  </p>
                  <p className="text-xs text-slate-600">Enrolled</p>
                </div>
                <div>
                  <p className="text-2xl text-amber-500" style={{ fontWeight: 700 }}>
                    {waitlistedCount}
                  </p>
                  <p className="text-xs text-slate-600">Waitlisted</p>
                </div>
                <div>
                  <p className="text-2xl text-red-500" style={{ fontWeight: 700 }}>
                    {conflicts.length}
                  </p>
                  <p className="text-xs text-slate-600">Conflicts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-700" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="studentId" value={student.studentId} className="pl-9 bg-slate-50" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="major" value={student.major} className="pl-9 bg-slate-50" disabled />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>
                  Password
                </p>
                <p className="text-xs text-slate-600">Last updated 30 days ago</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>
                  Email Notifications
                </p>
                <p className="text-xs text-slate-600">Receive updates about your courses</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-slate-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
