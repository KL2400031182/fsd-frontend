import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { User, Mail, ShieldCheck, Save, AlertCircle, Database, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

export function AdminProfile() {
  const { currentUser, courses, students, registrations, getAllConflicts } = useApp();
  const admin = currentUser?.admin;

  const [name, setName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No admin profile found</p>
        </div>
      </div>
    );
  }

  const activeConflicts = getAllConflicts().length;
  const totalCourses = courses.length;
  const totalStudents = students.length;
  const activeRegistrations = registrations.filter((r) => r.status !== 'dropped').length;

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
            Admin Profile
          </h1>
          <p className="text-slate-600 text-sm">Manage your administrator account and system overview</p>
        </div>

        {/* Profile Avatar & Quick Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0" style={{ fontWeight: 700 }}>
                <ShieldCheck className="w-10 h-10" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-slate-900 text-xl mb-1" style={{ fontWeight: 700 }}>
                  {admin.name}
                </h2>
                <p className="text-slate-600 text-sm mb-3">{admin.email}</p>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  System Administrator
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl text-slate-900" style={{ fontWeight: 700 }}>
                    {totalCourses}
                  </p>
                  <p className="text-xs text-slate-600">Courses</p>
                </div>
                <div>
                  <p className="text-2xl text-indigo-600" style={{ fontWeight: 700 }}>
                    {totalStudents}
                  </p>
                  <p className="text-xs text-slate-600">Students</p>
                </div>
                <div>
                  <p className="text-2xl text-emerald-600" style={{ fontWeight: 700 }}>
                    {activeRegistrations}
                  </p>
                  <p className="text-xs text-slate-600">Active Regs</p>
                </div>
                <div>
                  <p className="text-2xl text-amber-500" style={{ fontWeight: 700 }}>
                    {activeConflicts}
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
                    placeholder="admin@university.edu"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-700" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm text-slate-700" style={{ fontWeight: 600 }}>
                    Total Courses
                  </p>
                </div>
                <p className="text-3xl text-indigo-600" style={{ fontWeight: 700 }}>
                  {totalCourses}
                </p>
                <p className="text-xs text-slate-600 mt-1">Active in catalog</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-slate-700" style={{ fontWeight: 600 }}>
                    Total Students
                  </p>
                </div>
                <p className="text-3xl text-emerald-600" style={{ fontWeight: 700 }}>
                  {totalStudents}
                </p>
                <p className="text-xs text-slate-600 mt-1">Registered users</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-slate-700" style={{ fontWeight: 600 }}>
                    Conflicts
                  </p>
                </div>
                <p className="text-3xl text-amber-600" style={{ fontWeight: 700 }}>
                  {activeConflicts}
                </p>
                <p className="text-xs text-slate-600 mt-1">Require attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>
                  Password
                </p>
                <p className="text-xs text-slate-600">Last updated 15 days ago</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-200">
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

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>
                  Admin Access Code
                </p>
                <p className="text-xs text-slate-600">Required for new admin accounts</p>
              </div>
              <Button variant="outline" size="sm">
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
