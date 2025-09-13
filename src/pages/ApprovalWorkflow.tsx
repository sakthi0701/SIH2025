import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, MessageCircle, Send, Eye } from 'lucide-react';

const ApprovalWorkflow: React.FC = () => {
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const [timetables, setTimetables] = useState([
    {
      id: 'tt1',
      department: 'Computer Science',
      status: 'pending',
      submittedBy: 'Dr. Admin',
      submittedOn: '2024-01-15',
      version: 'v1.2',
      conflicts: 0,
      approver: 'Dr. Smith',
      comments: []
    },
    {
      id: 'tt2',
      department: 'Electronics',
      status: 'approved',
      submittedBy: 'Dr. Manager',
      submittedOn: '2024-01-14',
      version: 'v1.1',
      conflicts: 0,
      approver: 'Dr. Johnson',
      approvedOn: '2024-01-14',
      comments: [
        { author: 'Dr. Johnson', text: 'Looks good, approved.', date: '2024-01-14' }
      ]
    },
    {
      id: 'tt3',
      department: 'Mathematics',
      status: 'rejected',
      submittedBy: 'Dr. Coordinator',
      submittedOn: '2024-01-13',
      version: 'v1.0',
      conflicts: 3,
      approver: 'Dr. Wilson',
      rejectedOn: '2024-01-13',
      comments: [
        { author: 'Dr. Wilson', text: 'Please resolve room conflicts in Monday morning slots.', date: '2024-01-13' }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleApprove = (id: string) => {
    setTimetables(prev => prev.map(tt => 
      tt.id === id 
        ? { 
            ...tt, 
            status: 'approved', 
            approvedOn: new Date().toISOString().split('T')[0],
            comments: [...tt.comments, {
              author: 'Current User',
              text: 'Approved',
              date: new Date().toISOString().split('T')[0]
            }]
          }
        : tt
    ));
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      setTimetables(prev => prev.map(tt => 
        tt.id === id 
          ? { 
              ...tt, 
              status: 'rejected', 
              rejectedOn: new Date().toISOString().split('T')[0],
              comments: [...tt.comments, {
                author: 'Current User',
                text: reason,
                date: new Date().toISOString().split('T')[0]
              }]
            }
          : tt
      ));
    }
  };

  const addComment = (id: string) => {
    if (comment.trim()) {
      setTimetables(prev => prev.map(tt => 
        tt.id === id 
          ? { 
              ...tt, 
              comments: [...tt.comments, {
                author: 'Current User',
                text: comment.trim(),
                date: new Date().toISOString().split('T')[0]
              }]
            }
          : tt
      ));
      setComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Workflow</h1>
          <p className="text-gray-600 mt-1">Review and approve department timetables</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">3</p>
            </div>
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">17</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timetables List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Timetable Submissions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {timetables.map((timetable) => (
            <div key={timetable.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">{timetable.department}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(timetable.status)}`}>
                    {getStatusIcon(timetable.status)}
                    <span className="ml-1 capitalize">{timetable.status}</span>
                  </span>
                  <span className="text-sm text-gray-500">{timetable.version}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </button>
                  {timetable.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(timetable.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(timetable.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-gray-600">Submitted by:</span>
                  <span className="font-medium text-gray-900 ml-1">{timetable.submittedBy}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900 ml-1">{timetable.submittedOn}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Conflicts:</span>
                  <span className={`font-medium ml-1 ${timetable.conflicts === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {timetable.conflicts}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Approver:</span>
                  <span className="font-medium text-gray-900 ml-1">{timetable.approver}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comments ({timetable.comments.length})
                  </h4>
                  <button
                    onClick={() => setSelectedTimetable(selectedTimetable === timetable.id ? null : timetable.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedTimetable === timetable.id ? 'Hide' : 'Show'} Comments
                  </button>
                </div>

                {selectedTimetable === timetable.id && (
                  <div className="space-y-3">
                    {timetable.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))}

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => addComment(timetable.id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;