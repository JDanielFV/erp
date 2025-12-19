
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image';

import { sessionService } from '../utils/sessionService';

// --- STYLES MATCHING USER IMAGE ---

const Container = styled.div`
  min-height: 100vh;
  background-color: #2b2b2b; /* Dark gray background */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
  width: 150px; 
  height: auto;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
  margin-bottom: 2rem;
  margin-top: 0;
`;

const ScanButton = styled.button`
  background-color: #2b2b2b; 
  color: white;
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 400;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const ViewContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: black;
`;

export default function QRLoginPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedUserId = localStorage.getItem('currentUserId');
    const arrivalTime = localStorage.getItem('arrivalTimestamp');

    if (storedUser && storedUserId && arrivalTime) {
      // Check Valid for TODAY (One login per day)
      // If arrival date is same as today, auto-login.
      // If arrival date is old, force re-scan (but dashboard may have cleared it already).

      const arrivalDate = new Date(arrivalTime).toDateString();
      const today = new Date().toDateString();

      if (arrivalDate === today) {
        console.log('Session valid for today, redirecting...');
        router.push('/dashboard');
      } else {
        console.log('New day, scan required.');
        // Optional: clear to be safe, though dashboard did it already.
        // localStorage.clear(); 
      }
    }
  }, [router]);

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0 && !isProcessing) {
      const data = detectedCodes[0].rawValue;
      if (data) {
        setIsProcessing(true);
        setScanResult(data);
        console.log('Code detected:', data);

        try {
          // Send Code (short or UUID) to verify and login
          const session = await sessionService.registerLogin(data);

          if (session) {
            // Login successful
            localStorage.setItem('currentUser', session.userName);

            // Important: Store the UUID as primary ID for database operations
            const stableId = session.uuid || data;
            localStorage.setItem('currentUserId', stableId);

            // Optional: Store ShortCode separately if needed for display
            if (session.shortCode) {
              localStorage.setItem('userShortCode', session.shortCode);
            }

            // Save timestamp visual helper
            const now = new Date();
            localStorage.setItem('arrivalTimestamp', now.toLocaleString());

            setIsScanning(false);
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          } else {
            setErrorMessage("Usuario no encontrado.");
            setIsProcessing(false);
            setScanResult(null);
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Error de conexión.");
          setIsProcessing(false);
          setScanResult(null);
        }
      }
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  return (
    <Container>
      <LogoContainer>
        <Image src="/logo-a&g.svg" alt="A&G Logo" width={150} height={150} priority />
      </LogoContainer>

      <Card>
        <Title>Bienvenid@ de vuelta</Title>

        {!isScanning ? (
          <ScanButton onClick={startScan}>
            <span>Escanea tu QR para <br /> iniciar sesión</span>
            <CameraIcon />
          </ScanButton>
        ) : (
          <>
            <ViewContainer>
              <Scanner
                onScan={handleScan}
                components={{ finder: false }}
                styles={{ container: { width: '100%', height: '100%' } }}
                sound={false}
              />
            </ViewContainer>
            {scanResult ? (
              <p style={{ color: '#10b981', fontWeight: 'bold' }}>Validando Código...</p>
            ) : (
              <button
                onClick={() => setIsScanning(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #ddd',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
          </>
        )}

        {errorMessage && (
          <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>{errorMessage}</p>
        )}

      </Card>
    </Container>
  );
}
