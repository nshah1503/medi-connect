import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VoiceProvider } from '@humeai/voice-react';
import { AvatarProvider } from './AvatarProvider.js';
import Layout from '../Layout/Layout.js';
import { Button } from '../Button/Button.js';
import ChatStage from './ChatStage.js';
import Avatars from './Avatars.js';
import { fetchAccessToken } from 'hume';

const HumeAISection = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  useEffect(() => {
    const fetchToken = async () => {
        const apiKey = process.env.REACT_APP_HUME_API_KEY || '';
        const secretKey = process.env.REACT_APP_HUME_SECRET_KEY || '';
        console.log({key: apiKey});

      const token = (await fetchAccessToken({ apiKey, secretKey })) || '';

      console.log({token: token});
    

      setAccessToken(token);
    };

    fetchToken();
  }, []);

  return (
    <div>
      <div className="mx-auto px-4 py-8">
        <div className="mt-12 bg-blue-50 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        No doctors available?
      </h2>
      <p className="mb-4 text-gray-700">
        Don't worry! Our AI-powered virtual doctor, Hume AI, is always here to
        help.
      </p>
      <div className="flex items-center space-x-4">
        <img
          src="/api/placeholder/80/80"
          alt="Hume AI Avatar"
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Hume AI</h3>
          <p className="text-gray-600">Virtual Doctor Assistant</p>
        </div>
      </div>
      <Button onClick={handleOpenChat} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white p-4">
        {/* <Link to="/patient/hume-ai-consultation">Consult Hume AI</Link> */}
        Consult Hume AI
      </Button>
    </div>


        {isChatOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-5/6 relative">
              <Button 
                onClick={handleCloseChat}
                className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full"
              >
                Close Chat
              </Button>

              <VoiceProvider 
                    auth={{ type: 'accessToken', value: accessToken }}
                    configId={'6cfcd80d-5e32-44b0-8bcf-48b5e9ed9870'} 
                >
                <AvatarProvider>
                  <div className="h-full">
                    <Avatars />
                    <ChatStage />
                  </div>
                </AvatarProvider>
              </VoiceProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HumeAISection;