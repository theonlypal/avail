'use client';

/**
 * Browser-to-Phone WebRTC Dialer
 *
 * Uses Twilio Voice SDK to establish real WebRTC audio connections between
 * the browser and phone numbers. User can hear and speak to leads through
 * their browser's microphone and speakers.
 *
 * Architecture:
 * 1. Request access token from /api/calls/token
 * 2. Initialize Twilio Device with the token
 * 3. Request microphone permissions
 * 4. Connect to lead's phone number via WebRTC
 * 5. Handle bidirectional audio streaming
 */

import { useState, useEffect, useRef } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import type { Lead } from '@/types';

interface BrowserDialerProps {
  lead: Lead;
  onCallConnected?: (callSid: string) => void;
  onCallDisconnected?: () => void;
  onError?: (error: string) => void;
}

export function BrowserDialer({
  lead,
  onCallConnected,
  onCallDisconnected,
  onError,
}: BrowserDialerProps) {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [error, setError] = useState<string | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);

  /**
   * Initialize Twilio Device on mount
   */
  useEffect(() => {
    let mounted = true;

    const initializeDevice = async () => {
      try {
        console.log('[BrowserDialer] Requesting access token...');

        // Get Twilio access token from backend
        const response = await fetch('/api/calls/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to get access token');
        }

        const { token, identity } = await response.json();
        console.log('[BrowserDialer] Access token received. Identity:', identity);

        // Initialize Twilio Device
        const twilioDevice = new Device(token, {
          logLevel: 'debug',
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
          enableImprovedSignalingErrorPrecision: true,
        });

        // Device ready event
        twilioDevice.on('registered', () => {
          console.log('[BrowserDialer] Device registered and ready');
        });

        // Device error event
        twilioDevice.on('error', (error: Error) => {
          console.error('[BrowserDialer] Device error:', error);
          setError(error.message);
          onError?.(error.message);
        });

        // Incoming call handler (not needed for outgoing-only, but good to have)
        twilioDevice.on('incoming', (incomingCall: Call) => {
          console.log('[BrowserDialer] Incoming call received');
          // For now, we only handle outgoing calls
        });

        // Register the device
        await twilioDevice.register();
        console.log('[BrowserDialer] Device registration complete');

        if (mounted) {
          setDevice(twilioDevice);
          deviceRef.current = twilioDevice;
        }
      } catch (err: any) {
        console.error('[BrowserDialer] Failed to initialize device:', err);
        if (mounted) {
          setError(err.message);
          onError?.(err.message);
        }
      }
    };

    initializeDevice();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (deviceRef.current) {
        console.log('[BrowserDialer] Cleaning up device');
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, [onError]);

  /**
   * Start a call to the lead's phone number
   */
  const startCall = async () => {
    if (!device) {
      setError('Device not initialized');
      onError?.('Device not initialized');
      return;
    }

    if (!lead.phone) {
      setError('Lead has no phone number');
      onError?.('Lead has no phone number');
      return;
    }

    try {
      console.log('[BrowserDialer] Starting call to', lead.phone);
      setCallStatus('connecting');

      // Request microphone permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[BrowserDialer] Microphone access granted');
      } catch (micError: any) {
        console.error('[BrowserDialer] Microphone access denied:', micError);
        throw new Error('Microphone access is required to make calls. Please grant permission and try again.');
      }

      // Connect to the lead's phone via Twilio
      const outgoingCall = await device.connect({
        params: {
          To: lead.phone,
          // Add lead context for backend processing
          leadId: lead.id,
          leadName: lead.business_name,
        },
      });

      console.log('[BrowserDialer] Call initiated');
      setCall(outgoingCall);
      callRef.current = outgoingCall;

      // Call connected event
      outgoingCall.on('accept', (call: Call) => {
        console.log('[BrowserDialer] Call accepted/connected');
        setCallStatus('connected');
        const callSid = call.parameters.CallSid;
        if (callSid) {
          console.log('[BrowserDialer] Call SID:', callSid);
          onCallConnected?.(callSid);
        }
      });

      // Call disconnected event
      outgoingCall.on('disconnect', (call: Call) => {
        console.log('[BrowserDialer] Call disconnected');
        setCallStatus('disconnected');
        onCallDisconnected?.();
      });

      // Call error event
      outgoingCall.on('error', (error: Error) => {
        console.error('[BrowserDialer] Call error:', error);
        setError(error.message);
        onError?.(error.message);
        setCallStatus('disconnected');
      });

      // Call cancelled/rejected event
      outgoingCall.on('cancel', () => {
        console.log('[BrowserDialer] Call cancelled');
        setCallStatus('disconnected');
        onCallDisconnected?.();
      });

      outgoingCall.on('reject', () => {
        console.log('[BrowserDialer] Call rejected');
        setCallStatus('disconnected');
        onCallDisconnected?.();
      });

    } catch (err: any) {
      console.error('[BrowserDialer] Failed to start call:', err);
      setError(err.message);
      onError?.(err.message);
      setCallStatus('disconnected');
    }
  };

  /**
   * End the current call
   */
  const endCall = () => {
    if (callRef.current) {
      console.log('[BrowserDialer] Ending call');
      callRef.current.disconnect();
    }
  };

  /**
   * Mute/unmute the microphone
   */
  const toggleMute = () => {
    if (callRef.current) {
      const isMuted = callRef.current.isMuted();
      callRef.current.mute(!isMuted);
      console.log('[BrowserDialer] Mute toggled:', !isMuted);
      return !isMuted;
    }
    return false;
  };

  return {
    device,
    call,
    callStatus,
    error,
    startCall,
    endCall,
    toggleMute,
  };
}
