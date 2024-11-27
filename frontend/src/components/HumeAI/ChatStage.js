import React from 'react';
import { useVoice } from '@humeai/voice-react';
import { match } from 'ts-pattern';
import { Button } from '../Button/Button.js';

const ChatStage = () => {
  const { connect, disconnect, status } = useVoice();

  const handleConnect = () => {
    if (status.value === 'connected') {
      disconnect();
      return;
    }
    void connect()
      .then(() => {})
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {match(status.value)
        .with('error', () => (
          <div className="text-center text-red-500">
            <p>Something went wrong</p>
            <Button 
              onClick={handleConnect} 
              className="mt-4 bg-red-500 text-white px-6 py-3 rounded-full"
            >
              Try again
            </Button>
          </div>
        ))
        .with('disconnected', 'connecting', () => (
          <div className="text-center">
            <p>Preparing connection...</p>
          </div>
        ))
        .with('connected', () => (
          <div className="text-center">
            <p>Connected and ready to chat!</p>
          </div>
        ))
        .exhaustive()}

      <Button 
        onClick={handleConnect}
        className="mt-4 bg-blue-500 text-white px-6 py-4 rounded-full hover:bg-blue-600 transition"
      >
        {status.value === 'connected' ? 'End chat' : 'Start chat!'}
      </Button>
    </div>
  );
};

export default ChatStage;