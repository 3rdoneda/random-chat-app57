import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Check, 
  X,
  Search,
  Filter,
  Clock,
  TrendingUp
} from "lucide-react";
import { Button } from "../components/ui/button";
import { db } from "../firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";

interface Report {
  id: string;
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  action?: string;
}

interface UserProfile {
  userId: string;
  username: string;
  reportCount: number;
  isBlocked: boolean;
  lastSeen: any;
  joinDate: any;
}

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'analytics'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');

  // Check admin access (you should implement proper admin authentication)
  const checkAdminAccess = () => {
    // Implement proper admin authentication check here
    const isAdmin = localStorage.getItem('admin-access') === 'true';
    if (!isAdmin) {
      navigate('/');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkAdminAccess()) return;
    loadReports();
    loadUsers();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('reportCount', '>', 0),
        orderBy('reportCount', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as UserProfile[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss', userAction?: 'block' | 'warn') => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: action === 'approve' ? 'resolved' : 'dismissed',
        reviewedAt: serverTimestamp(),
        reviewedBy: 'admin', // Replace with actual admin ID
        action: userAction || 'none'
      });

      // If blocking user, update user document
      if (userAction === 'block') {
        const report = reports.find(r => r.id === reportId);
        if (report) {
          const userRef = doc(db, 'users', report.reportedUserId);
          await updateDoc(userRef, {
            isBlocked: true,
            blockedAt: serverTimestamp(),
            blockedReason: report.reason
          });
        }
      }

      // Reload reports
      loadReports();
      loadUsers();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (!checkAdminAccess()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">Content Moderation</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reports' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Analytics
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports found</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : report.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {report.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Reason: {report.reason}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {report.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Reported User: {report.reportedUserId} | Reporter: {report.reporterUserId}
                        </div>
                      </div>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => handleReportAction(report.id, 'approve', 'block')}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Block User
                        </Button>
                        <Button
                          onClick={() => handleReportAction(report.id, 'approve', 'warn')}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1"
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Warn User
                        </Button>
                        <Button
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                          variant="outline"
                          className="text-sm px-3 py-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reported Users</h2>
              
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.username}</h3>
                          <p className="text-sm text-gray-600">
                            {user.reportCount} reports | 
                            Joined: {user.joinDate?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {user.isBlocked ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                          Blocked
                        </span>
                      ) : (
                        <Button
                          onClick={() => {/* Implement block user */}}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                        >
                          Block
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reported users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pending Reports</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {reports.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Ban className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Blocked Users</h3>
                    <p className="text-2xl font-bold text-red-600">
                      {users.filter(u => u.isBlocked).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Resolved Reports</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {reports.filter(r => r.status === 'resolved').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
