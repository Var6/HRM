'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, LogIn, LogOut, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EmployeeCheckinPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [checkinStatus, setCheckinStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);

  useEffect(() => {
    const employeeData = localStorage.getItem('employee');
    if (employeeData) {
      const emp = JSON.parse(employeeData);
      setEmployee(emp);
      fetchCheckinStatus(emp._id);
      fetchRecentCheckins(emp._id);
    }
  }, []);

  const fetchCheckinStatus = async (employeeId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/checkins?employeeId=${employeeId}&date=${today}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setCheckinStatus(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching checkin status:', error);
    }
  };

  const fetchRecentCheckins = async (employeeId: string) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await fetch(
        `/api/checkins?employeeId=${employeeId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      
      if (data.success) {
        setRecentCheckins(data.data);
      }
    } catch (error) {
      console.error('Error fetching recent checkins:', error);
    }
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
            });
          },
          (error) => reject(error)
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  const handleCheckin = async () => {
    if (!employee) return;

    setLoading(true);
    try {
      const loc: any = await getLocation();
      setLocation(loc);

      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee._id,
          action: 'checkin',
          location: loc,
          deviceInfo: navigator.userAgent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Checked in successfully!');
        setCheckinStatus(data.data);
        fetchRecentCheckins(employee._id);
      } else {
        alert(data.error || 'Failed to check in');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!employee) return;

    setLoading(true);
    try {
      const loc: any = await getLocation();

      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee._id,
          action: 'checkout',
          location: loc,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Checked out successfully!');
        setCheckinStatus(data.data);
        fetchRecentCheckins(employee._id);
      } else {
        alert(data.error || 'Failed to check out');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Check-in</h1>
          <p className="text-gray-600">Welcome, {employee.name}</p>
        </div>

        {/* Check-in Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Today's Status</p>
              <h2 className="text-3xl font-bold">
                {checkinStatus ? (checkinStatus.status === 'Checked In' ? 'Checked In' : 'Checked Out') : 'Not Checked In'}
              </h2>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              {checkinStatus?.status === 'Checked In' ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : (
                <Clock className="w-12 h-12" />
              )}
            </div>
          </div>

          {checkinStatus && (
            <div className="grid grid-cols-2 gap-4 mb-6 bg-white/10 rounded-lg p-4">
              <div>
                <p className="text-blue-100 text-sm">Check-in Time</p>
                <p className="text-lg font-semibold">
                  {new Date(checkinStatus.checkInTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {checkinStatus.checkOutTime && (
                <div>
                  <p className="text-blue-100 text-sm">Check-out Time</p>
                  <p className="text-lg font-semibold">
                    {new Date(checkinStatus.checkOutTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              {checkinStatus.totalHours > 0 && (
                <div className="col-span-2">
                  <p className="text-blue-100 text-sm">Total Hours</p>
                  <p className="text-2xl font-bold">{checkinStatus.totalHours} hrs</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {!checkinStatus || checkinStatus.status === 'Checked Out' ? (
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="flex-1 bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                {loading ? 'Getting Location...' : 'Check In'}
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                {loading ? 'Getting Location...' : 'Check Out'}
              </button>
            )}
          </div>

          {checkinStatus?.checkInLocation && (
            <div className="mt-4 flex items-start gap-2 text-sm bg-white/10 p-3 rounded-lg">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-blue-100">Location: {checkinStatus.checkInLocation.address}</span>
            </div>
          )}
        </div>

        {/* Recent Checkins */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Last 7 Days
          </h3>
          <div className="space-y-3">
            {recentCheckins.length > 0 ? (
              recentCheckins.map((checkin) => (
                <div key={checkin._id} className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(checkin.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(checkin.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {checkin.checkOutTime && ` - ${new Date(checkin.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      checkin.status === 'Checked Out' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {checkin.status}
                    </span>
                    {checkin.totalHours > 0 && (
                      <p className="text-sm text-gray-600 mt-1">{checkin.totalHours} hours</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No check-in records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
