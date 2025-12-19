'use client';

/**
 * Unified Call Wrapper with WebRTC Browser-to-Phone Calling
 *
 * This wrapper:
 * 1. Initializes Twilio Device with WebRTC support (browser can hear/speak)
 * 2. Establishes real audio connection via browser microphone/speakers
 * 3. Gets the callSid when connected
 * 4. Renders UnifiedCallView with that callSid for transcription
 *
 * FULL WEBRTC PRODUCTION IMPLEMENTATION - NO DEMOS
 */

import { useState, useEffect, useRef } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { ImmersiveCallScreen } from '@/components/copilot/immersive-call-screen';
import type { Lead } from '@/types';

interface UnifiedCallWrapperProps {
  lead: Lead;
  onClose: () => void;
}

export function UnifiedCallWrapper({ lead, onClose }: UnifiedCallWrapperProps) {
  const [callSid, setCallSid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'initializing' | 'ready' | 'connecting' | 'connected' | 'failed'>('initializing');

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);

  // DEBUG: Log every render
  console.log('[UnifiedCallWrapper] 🎨 RENDER CALLED', {
    callStatus,
    callSid,
    error,
    leadId: lead.id,
    leadName: lead.business_name,
  });

  /**
   * Initialize Twilio Device and start the call immediately
   */
  useEffect(() => {
    let mounted = true;

    const initializeAndCall = async () => {
      try {
        console.log('[UnifiedCallWrapper] Step 1: Requesting Twilio access token...');

        // Get access token for browser WebRTC connection
        const tokenResponse = await fetch('/api/calls/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to get Twilio access token');
        }

        const { token, identity } = await tokenResponse.json();
        console.log('[UnifiedCallWrapper] Step 2: Access token received. Identity:', identity);

        // Initialize Twilio Device for WebRTC
        const twilioDevice = new Device(token, {
          logLevel: 'debug',
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
          enableImprovedSignalingErrorPrecision: true,
        });

        // Device ready event
        twilioDevice.on('registered', () => {
          console.log('[UnifiedCallWrapper] Twilio Device registered successfully');
        });

        // Device error event
        twilioDevice.on('error', (deviceError: Error) => {
          console.error('[UnifiedCallWrapper] Device error:', deviceError);
          if (mounted) {
            setError(`Device error: ${deviceError.message}`);
            setCallStatus('failed');
          }
        });

        // Register the device
        await twilioDevice.register();
        deviceRef.current = twilioDevice;

        if (!mounted) return;

        console.log('[UnifiedCallWrapper] Step 3: Device registered. Requesting microphone permission...');
        setCallStatus('ready');

        // Request microphone permissions
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('[UnifiedCallWrapper] Step 4: Microphone access granted');
        } catch (micError: any) {
          console.error('[UnifiedCallWrapper] Microphone access denied:', micError);
          throw new Error('Microphone access is required. Please grant permission and try again.');
        }

        if (!mounted) return;

        console.log('[UnifiedCallWrapper] Step 5: Starting WebRTC call to', lead.phone);
        setCallStatus('connecting');

        // Validate phone number
        if (!lead.phone) {
          throw new Error('No phone number available for this lead');
        }

        // Connect to the lead's phone via WebRTC
        const outgoingCall = await twilioDevice.connect({
          params: {
            To: lead.phone,
            leadId: lead.id,
            leadName: lead.business_name,
          },
        });

        callRef.current = outgoingCall;
        console.log('[UnifiedCallWrapper] Step 6: Call initiated, waiting for connection...');

        // Call accepted/connected event
        outgoingCall.on('accept', () => {
          console.log('[UnifiedCallWrapper] Step 7: Call CONNECTED! Audio is live.');
          console.log('[UnifiedCallWrapper] Call object parameters:', JSON.stringify(outgoingCall.parameters, null, 2));

          // Get CallSid from the outgoingCall object (already available in closure)
          const connectedCallSid = outgoingCall.parameters.CallSid;

          console.log('[UnifiedCallWrapper] Extracted CallSid:', connectedCallSid);
          console.log('[UnifiedCallWrapper] Current mounted state:', mounted);
          console.log('[UnifiedCallWrapper] Current callStatus:', callStatus);

          if (connectedCallSid && mounted) {
            console.log('[UnifiedCallWrapper] ✅ Setting callSid and callStatus=connected');
            setCallSid(connectedCallSid);
            setCallStatus('connected');
          } else {
            console.error('[UnifiedCallWrapper] ❌ Failed to set UI state. callSid:', connectedCallSid, 'mounted:', mounted);
          }
        });

        // Call disconnected event
        outgoingCall.on('disconnect', () => {
          console.log('[UnifiedCallWrapper] Call disconnected');
          if (mounted) {
            onClose();
          }
        });

        // Call error event
        outgoingCall.on('error', (callError: Error) => {
          console.error('[UnifiedCallWrapper] Call error:', callError);
          if (mounted) {
            setError(`Call error: ${callError.message}`);
            setCallStatus('failed');
          }
        });

        // Call cancelled/rejected events
        outgoingCall.on('cancel', () => {
          console.log('[UnifiedCallWrapper] Call cancelled');
          if (mounted) onClose();
        });

        outgoingCall.on('reject', () => {
          console.log('[UnifiedCallWrapper] Call rejected');
          if (mounted) onClose();
        });

      } catch (err: any) {
        console.error('[UnifiedCallWrapper] Initialization/call failed:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize call');
          setCallStatus('failed');
        }
      }
    };

    initializeAndCall();

    // Cleanup on unmount
    return () => {
      mounted = false;
      console.log('[UnifiedCallWrapper] Cleaning up...');

      if (callRef.current) {
        callRef.current.disconnect();
      }

      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
    };
  }, [lead.id, lead.phone, lead.business_name, onClose]);

  // Show loading state while initializing
  if (callStatus === 'initializing' || callStatus === 'ready' || callStatus === 'connecting') {
    console.log('[UnifiedCallWrapper] 📍 RENDERING: Loading spinner (status:', callStatus, ')');
    const statusMessages = {
      initializing: 'Initializing WebRTC connection...',
      ready: 'Requesting microphone access...',
      connecting: 'Connecting call...',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {statusMessages[callStatus]}
              </h3>
              <p className="text-slate-400">
                Calling {lead.business_name} at {lead.phone}
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Setting up browser audio connection
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if call failed
  if (callStatus === 'failed' || error) {
    console.log('[UnifiedCallWrapper] 📍 RENDERING: Error UI (error:', error, ')');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Call Failed
              </h3>
              <p className="text-slate-400 mb-4">
                {error || 'Unable to establish call'}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show ImmersiveCallScreen once connected with real audio
  if (callStatus === 'connected' && callSid) {
    console.log('[UnifiedCallWrapper] 📍 RENDERING: ImmersiveCallScreen (callSid:', callSid, ')');
    return (
      <ImmersiveCallScreen
        lead={lead}
        callSid={callSid}
        onCallEnd={(callData) => {
          console.log('[UnifiedCallWrapper] onCallEnd callback - disconnecting Twilio Device', callData);
          if (callRef.current) {
            callRef.current.disconnect();
          }
          onClose();
        }}
        onClose={() => {
          console.log('[UnifiedCallWrapper] onClose - user closed the call screen');
          if (callRef.current) {
            callRef.current.disconnect();
          }
          onClose();
        }}
      />
    );
  }

  // Should never reach here - if we do, something is wrong!
  console.error('[UnifiedCallWrapper] 📍 RENDERING: DEBUG FALLBACK - This should never happen!');
  console.error('[UnifiedCallWrapper] CRITICAL BUG: Reached fallback null render!');
  console.error('[UnifiedCallWrapper] Current state:', { callStatus, callSid, error });

  // EMERGENCY FALLBACK: Show debug info
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-red-900 border border-red-500 rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl">
        <div className="text-white">
          <h3 className="text-xl font-bold mb-4">🐛 DEBUG: Unexpected State</h3>
          <div className="space-y-2 font-mono text-sm">
            <p>callStatus: {callStatus}</p>
            <p>callSid: {callSid || 'null'}</p>
            <p>error: {error || 'null'}</p>
            <p className="mt-4 text-yellow-300">Check browser console for logs!</p>
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-white text-red-900 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
