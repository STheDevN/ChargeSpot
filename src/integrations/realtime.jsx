import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from '../hooks/use-toast.jsx';

const RealtimeContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function RealtimeProvider({ children }) {
  const { toast } = useToast();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const saveNotification = (title, message, type = 'info') => {
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = [notification, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Station Events
    socket.on('station-created', (station) => {
      const title = "New Station Added";
      const message = `${station.name} has been added to the network`;
      toast({ title, description: message, variant: "default" });
      saveNotification(title, message, 'success');
    });

    socket.on('station-updated', (station) => {
      toast({
        title: "Station Updated",
        description: `${station.name} information has been updated`,
        variant: "default",
      });
    });

    socket.on('station-deleted', ({ stationId }) => {
      toast({
        title: "Station Removed",
        description: "A charging station has been removed from the network",
        variant: "destructive",
      });
    });

    socket.on('station-availability-changed', ({ stationId, isAvailable }) => {
      toast({
        title: "Station Availability Changed",
        description: `Station is now ${isAvailable ? 'available' : 'occupied'}`,
        variant: isAvailable ? "default" : "destructive",
      });
    });

    // Booking Events
    socket.on('booking-created', (booking) => {
      const title = "Booking Confirmed";
      const message = `Your booking at ${booking.station?.name || 'station'} has been confirmed`;
      toast({ title, description: message, variant: "default" });
      saveNotification(title, message, 'success');
    });

    socket.on('booking-status-changed', ({ bookingId, status }) => {
      const statusMessages = {
        'confirmed': 'Booking confirmed',
        'in-progress': 'Charging session started',
        'completed': 'Charging session completed',
        'cancelled': 'Booking cancelled',
        'no-show': 'Booking marked as no-show'
      };
      
      toast({
        title: "Booking Update",
        description: statusMessages[status] || `Booking status changed to ${status}`,
        variant: status === 'cancelled' || status === 'no-show' ? "destructive" : "default",
      });
    });

    socket.on('booking-cancelled', ({ bookingId }) => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled",
        variant: "destructive",
      });
    });

    // Payment Events
    socket.on('payment-success', (payment) => {
      const title = "Payment Successful";
      const message = `Payment of $${payment.amount} processed successfully`;
      toast({ title, description: message, variant: "default" });
      saveNotification(title, message, 'success');
    });

    socket.on('payment-failed', (payment) => {
      toast({
        title: "Payment Failed",
        description: "Payment could not be processed. Please try again.",
        variant: "destructive",
      });
    });

    // Review Events
    socket.on('review-submitted', (review) => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review is being moderated.",
        variant: "default",
      });
    });

    socket.on('review-approved', (review) => {
      toast({
        title: "Review Approved",
        description: "Your review has been approved and is now visible",
        variant: "default",
      });
    });

    socket.on('review-rejected', (review) => {
      toast({
        title: "Review Not Approved",
        description: "Your review did not meet our guidelines",
        variant: "destructive",
      });
    });

    // Rental Events
    socket.on('rental-requested', (rental) => {
      toast({
        title: "Rental Request Submitted",
        description: "Your charging unit rental request has been submitted for approval",
        variant: "default",
      });
    });

    socket.on('rental-approved', (rental) => {
      toast({
        title: "Rental Approved",
        description: "Your charging unit rental has been approved! Delivery details will be sent soon.",
        variant: "default",
      });
    });

    socket.on('rental-rejected', (rental) => {
      toast({
        title: "Rental Request Declined",
        description: "Your rental request could not be approved at this time",
        variant: "destructive",
      });
    });

    socket.on('rental-delivered', (rental) => {
      toast({
        title: "Rental Delivered",
        description: "Your charging unit has been delivered successfully",
        variant: "default",
      });
    });

    socket.on('rental-picked-up', (rental) => {
      toast({
        title: "Rental Completed",
        description: "Your charging unit has been picked up. Thank you for using our service!",
        variant: "default",
      });
    });

    // Admin Events
    socket.on('station-approved', (station) => {
      toast({
        title: "Station Approved",
        description: `${station.name} has been approved and is now live`,
        variant: "default",
      });
    });

    socket.on('station-rejected', (station) => {
      toast({
        title: "Station Rejected",
        description: `${station.name} could not be approved`,
        variant: "destructive",
      });
    });

    // Generic notifications channel
    socket.on('notification', (payload) => {
      if (!payload) return;
      toast({
        title: payload.title || 'Notification',
        description: payload.message || '',
        variant: payload.variant || 'default',
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [toast]);

  const subscribeToStation = (stationId) => {
    socketRef.current?.emit('join-station', stationId);
    return () => socketRef.current?.emit('leave-station', stationId);
  };

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    // helpers
    subscribeToStation,
    on: (event, handler) => socketRef.current?.on(event, handler),
    off: (event, handler) => socketRef.current?.off(event, handler),
    emit: (event, data) => socketRef.current?.emit(event, data),
  }), [connected]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
}


