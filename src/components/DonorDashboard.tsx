import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, MapPin, Clock, CheckCircle } from "lucide-react";

export function DonorDashboard() {
  const currentDonor = useQuery(api.donors.getCurrentDonor);
  const nearbyAlerts = useQuery(api.donors.getNearbyActiveSosAlerts) || [];
  const updateAvailability = useMutation(api.donors.updateAvailability);
  const respondToAlert = useMutation(api.donors.respondToSosAlert);
  const [respondingAlert, setRespondingAlert] = useState<Id<"sosAlerts"> | null>(null);
  const [responseNotes, setResponseNotes] = useState("");

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const handleAvailabilityChange = async (available: boolean) => {
    try {
      await updateAvailability({ available });
      toast.success(available ? "You are now available for donations" : "You are now unavailable for donations");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update availability");
    }
  };

  const handleRespond = async (alertId: Id<"sosAlerts">) => {
    setRespondingAlert(alertId);
    setResponseNotes("");
  };

  const handleSubmitResponse = async (alertId: Id<"sosAlerts">) => {
    try {
      await respondToAlert({ alertId, notes: responseNotes });
      toast.success("Response submitted successfully! The hospital will contact you.");
      setRespondingAlert(null);
      setResponseNotes("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit response");
    }
  };

  if (!currentDonor) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Donor Registration Required</h1>
            <p className="text-lg text-gray-600 mb-6">
              You need to register as a donor to access the dashboard and receive alerts.
            </p>
            <button 
              onClick={() => window.location.href = "/donor-registration"}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Register as Donor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Donor Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {currentDonor.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentDonor.availability 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentDonor.availability ? 'Available' : 'Not Available'}
                </span>
                <button
                  onClick={() => void handleAvailabilityChange(!currentDonor.availability)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentDonor.availability
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {currentDonor.availability ? 'Set Unavailable' : 'Set Available'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Your Blood Group</p>
                  <p className="text-2xl font-bold text-red-600">{currentDonor.bloodGroup}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-lg font-bold text-gray-900 truncate max-w-xs">{currentDonor.location}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Alerts Nearby</p>
                  <p className="text-2xl font-bold text-gray-900">{nearbyAlerts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Donation</p>
                  <p className="text-lg font-bold text-gray-900">
                    {currentDonor.lastDonation 
                      ? new Date(currentDonor.lastDonation).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby SOS Alerts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Blood Requests Near You</h2>

            {nearbyAlerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts Nearby</h3>
                <p className="text-gray-600">Great news! No hospitals in your area currently need your blood type.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {nearbyAlerts.map((alert) => (
                  <div key={alert._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl font-bold text-red-600">{alert.bloodGroup}</span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(alert.urgency)}`}>
                            {alert.urgency.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {alert.hospital?.name || alert.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTimeRemaining(alert.expiresAt)}
                          </span>
                          <span>•</span>
                          <span>{alert.unitsNeeded} units needed</span>
                        </div>
                      </div>
                      <button
                        onClick={() => void handleRespond(alert._id)}
                        disabled={respondingAlert === alert._id}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {respondingAlert === alert._id ? 'Responding...' : 'Respond'}
                      </button>
                    </div>

                    {respondingAlert === alert._id && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Your Response</h4>
                        <textarea
                          value={responseNotes}
                          onChange={(e) => setResponseNotes(e.target.value)}
                          rows={3}
                          placeholder="Any notes for the hospital? (e.g., 'I can come in 30 minutes', 'I have O- blood type')"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setRespondingAlert(null)}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => void handleSubmitResponse(alert._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Submit Response
                          </button>
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
    </div>
  );
}