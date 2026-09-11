import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const navigate = useNavigate();
  const currentHospital = useQuery(api.hospitals.getCurrentHospital);
  const sosAlerts = useQuery(api.hospitals.getHospitalSosAlerts) || [];
  const updateAlertStatus = useMutation(api.hospitals.updateSosAlertStatus);
  const createSosAlert = useMutation(api.hospitals.createSosAlert);
  const [updatingAlert, setUpdatingAlert] = useState<Id<"sosAlerts"> | null>(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alertForm, setAlertForm] = useState({
    bloodGroup: "",
    urgency: "normal",
    unitsNeeded: 1,
    contactNumber: "",
    description: "",
    hoursValid: 24,
    targetArea: "",
    radiusKm: 50,
  });
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  const handleStatusUpdate = async (alertId: Id<"sosAlerts">, status: string) => {
    setUpdatingAlert(alertId);
    try {
      await updateAlertStatus({ alertId, status });
      toast.success(`Alert status updated to ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setUpdatingAlert(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "fulfilled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAlert(true);
    try {
      await createSosAlert({
        bloodGroup: alertForm.bloodGroup,
        urgency: alertForm.urgency,
        unitsNeeded: alertForm.unitsNeeded,
        contactNumber: alertForm.contactNumber,
        description: alertForm.description,
        hoursValid: alertForm.hoursValid,
        targetArea: alertForm.targetArea || undefined,
        radiusKm: alertForm.radiusKm,
      });
      toast.success("SOS Alert created successfully!");
      setShowCreateAlert(false);
      setAlertForm({
        bloodGroup: "",
        urgency: "normal",
        unitsNeeded: 1,
        contactNumber: "",
        description: "",
        hoursValid: 24,
        targetArea: "",
        radiusKm: 50,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create alert");
    } finally {
      setIsCreatingAlert(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (!currentHospital) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Hospital Registration Required</h1>
            <p className="text-lg text-gray-600 mb-6">
              You need to register as a hospital to access the dashboard.
            </p>
            <button 
              onClick={() => void navigate("/hospital-registration")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Register Hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeAlerts = sosAlerts.filter(alert => alert.status === "active");
  const totalResponses = sosAlerts.reduce((sum, alert) => sum + alert.responses.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hospital Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {currentHospital.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{sosAlerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{activeAlerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${currentHospital.verified ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                {currentHospital.verified ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-sm font-bold ${currentHospital.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {currentHospital.verified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SOS Alerts */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your SOS Alerts</h2>
            <button 
              onClick={() => setShowCreateAlert(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Create New Alert
            </button>
          </div>

          {showCreateAlert && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Create New SOS Alert</h3>
                    <button
                      onClick={() => setShowCreateAlert(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                      &times;
                    </button>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); void handleCreateAlert(e); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group *</label>
                      <select
                        required
                        value={alertForm.bloodGroup}
                        onChange={(e) => setAlertForm({...alertForm, bloodGroup: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
                      <select
                        required
                        value={alertForm.urgency}
                        onChange={(e) => setAlertForm({...alertForm, urgency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="critical">Critical</option>
                        <option value="urgent">Urgent</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={alertForm.unitsNeeded}
                        onChange={(e) => setAlertForm({...alertForm, unitsNeeded: parseInt(e.target.value) || 1})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                      <input
                        type="tel"
                        required
                        value={alertForm.contactNumber}
                        onChange={(e) => setAlertForm({...alertForm, contactNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={alertForm.description}
                        onChange={(e) => setAlertForm({...alertForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Describe the emergency situation..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours Valid *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="168"
                        value={alertForm.hoursValid}
                        onChange={(e) => setAlertForm({...alertForm, hoursValid: parseInt(e.target.value) || 24})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Area (Optional)</label>
                      <input
                        type="text"
                        value={alertForm.targetArea}
                        onChange={(e) => setAlertForm({...alertForm, targetArea: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g., Downtown, Sector 5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="200"
                        value={alertForm.radiusKm}
                        onChange={(e) => setAlertForm({...alertForm, radiusKm: parseInt(e.target.value) || 50})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateAlert(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingAlert}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isCreatingAlert ? "Creating..." : "Create Alert"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {sosAlerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SOS Alerts</h3>
              <p className="text-gray-600">You haven't created any SOS alerts yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sosAlerts.map((alert) => (
                <div key={alert._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold text-red-600">{alert.bloodGroup}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(alert.urgency)}`}>
                          {alert.urgency.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{alert.unitsNeeded} units needed</span>
                        <span>•</span>
                        <span>{formatTimeRemaining(alert.expiresAt)}</span>
                        <span>•</span>
                        <span>{alert.responses.length} responses</span>
                      </div>
                    </div>
                    {alert.status === "active" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => void handleStatusUpdate(alert._id, "fulfilled")}
                          disabled={updatingAlert === alert._id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Mark Fulfilled
                        </button>
                        <button
                          onClick={() => void handleStatusUpdate(alert._id, "expired")}
                          disabled={updatingAlert === alert._id}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {alert.responses.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Donor Responses ({alert.responses.length})</h4>
                      <div className="space-y-3">
                        {alert.responses.map((response) => (
                          <div key={response._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="font-semibold text-gray-900">{response.donor?.name}</span>
                                  <span className="text-sm text-gray-600">{response.donor?.bloodGroup}</span>
                                  <span className="text-sm text-gray-600">•</span>
                                  <span className="text-sm text-gray-600">{response.donor?.location}</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Phone: <span className="font-medium">{response.donor?.phone}</span>
                                </div>
                                {response.notes && (
                                  <p className="text-sm text-gray-700 italic">"{response.notes}"</p>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(response.responseTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
