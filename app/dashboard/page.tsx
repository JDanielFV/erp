
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { supabase } from '@/lib/supabase';
import { sessionService } from '../utils/sessionService';

// --- STYLES FOR MAIN DASHBOARD (Kept from approved step) ---
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #2b2b2b; /* Dark gray background */
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Header = styled.div`
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const Greeting = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const DateDisplay = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  color: #e5e5e5;
  line-height: 1.3;
`;

const MainCard = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  color: black;
  display: flex;
  flex-direction: column;
  height: 600px; 
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const UpdatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UpdateItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const Badge = styled.div`
  background-color: #2b2b2b;
  color: white;
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0 0.25rem;
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemTitle = styled.div`
  font-weight: 600;
  color: #333;
`;

const ItemDesc = styled.div`
  font-size: 0.85rem;
  color: #888;
`;

const BottomActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto; 
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  text-align: center;
  &:hover { opacity: 0.9; }
`;

// --- NEW MENU OVERLAY STYLES (Matching Reference Image) ---
const OverlayContainer = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7); /* Dark dimmed background */
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${props => props.$isClosing ? 'fadeOut 0.2s forwards' : 'fadeIn 0.2s forwards'};

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;

const MenuCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 380px;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 Columns */
  gap: 1.5rem 1rem; /* Gap between items */
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @keyframes scaleUp {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const MenuItemContainer = styled.button`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0;
`;

const IconWrapper = styled.div`
  width: 65px;
  height: 65px;
  background-color: #2b2b2b; /* Dark/Black rounded square */
  border-radius: 16px; 
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;

  /* Optional: Add a subtle grid pattern overlay if desired to match specific aesthetic */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    background-image: 
      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 10px 10px;
    opacity: 0.3;
  }
`;

const MenuLabel = styled.span`
  font-size: 0.8rem;
  color: #000;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const CircleCloseButton = styled.button`
  margin-top: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: rgba(255,255,255,0.3);
  }
`;

// Simple Icons (white strokes)
const Icons = {
  New: () => <span>+</span>,
  Orders: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  Clients: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  Staff: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Inventory: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Status: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
  Truck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  Plane: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [userName, setUserName] = useState<string>('Usuario');
  const [userId, setUserId] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);

  // Check for session expiry on mount
  useEffect(() => {
    // ... Session expiry logic
    const arrivalTime = localStorage.getItem('arrivalTimestamp');
    if (arrivalTime) {
      const loginTime = new Date(arrivalTime).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

      if (hoursDiff >= 8) {
        console.log('Session expired on dashboard, logging out...');
        localStorage.clear();
        router.push('/');
      }
    }
  }, [router]);

  useEffect(() => {
    // Recuperar usuario
    const storedUser = localStorage.getItem('currentUser');
    const storedUuid = localStorage.getItem('currentUserId');
    if (storedUser) setUserName(storedUser);
    if (storedUuid) setUserId(storedUuid);

    // Reloj
    const updateTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long' };
      const dateStr = now.toLocaleDateString('es-ES', dateOptions);
      const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setCurrentDate(formattedDate);
      setCurrentTime(timeStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Fetch Active Orders
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, clients(name)')
          .order('created_at', { ascending: false }) // Newest first
          .limit(10); // Show last 10

        if (error) console.error('Error fetching dashboard orders:', error);
        else setOrders(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();

    // Subscribe for changes (keep dashboard updated)
    const channel = supabase.channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    if (userId) await sessionService.registerLogout(userId);
    else await sessionService.registerLogout(userName);

    const departureTime = new Date();
    localStorage.setItem('departureTimestamp', departureTime.toLocaleString());
    router.push('/Login');
  };

  const handleMenuClick = (id: string) => {
    if (id === 'logout') {
      handleLogout();
    } else if (id === 'orders') {
      router.push('/orders');
    } else if (id === 'new') {
      router.push('/orders?new=true');
    } else if (id === 'clients') {
      router.push('/clients');
    } else if (id === 'staff') {
      router.push('/staff');
    } else {
      console.log('Nav:', id);
    }
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const menuItems = [
    { id: 'new', label: 'Nuevo', icon: Icons.New },
    { id: 'orders', label: 'Pedidos', icon: Icons.Orders },
    { id: 'clients', label: 'Clientes', icon: Icons.Clients },
    { id: 'staff', label: 'Personal', icon: Icons.Staff },
    { id: 'inventory', label: 'Inventario', icon: Icons.Inventory },
    { id: 'approvals', label: 'Vistos Bnos', icon: Icons.Check },
    { id: 'status', label: 'Estatus', icon: Icons.Status },
    { id: 'purchases', label: 'Compras', icon: Icons.Cart },
    { id: 'transfers', label: 'Traslados', icon: Icons.Truck },
    { id: 'shipping', label: 'Envíos', icon: Icons.Plane },
    { id: 'logout', label: 'Cerrar sesión', icon: Icons.Logout },
  ];

  return (
    <PageContainer>
      <Header>
        <Greeting>Hola {userName.split(' ')[0]},</Greeting>
        <DateDisplay>{currentDate} <br /> {currentTime}</DateDisplay>
      </Header>

      <MainCard>
        <ContentArea>
          <SectionTitle>Actualizaciones</SectionTitle>
          <UpdatesList>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                <p>No hay pedidos activos.</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <UpdateItem key={order.id}>
                  {/* Use index+1 as badge or maybe first letter of client? Let's use index+1 for now */}
                  <Badge>{index + 1}</Badge>
                  <ItemContent>
                    <ItemTitle>{order.clients?.name || 'Cliente desconocido'}</ItemTitle>
                    <ItemDesc>{order.description ? (order.description.length > 30 ? order.description.substring(0, 30) + '...' : order.description) : 'Sin descripción'}</ItemDesc>
                  </ItemContent>
                </UpdateItem>
              ))
            )}
          </UpdatesList>
        </ContentArea>

        <BottomActions>
          <ActionRow>
            <ActionButton onClick={() => router.push('/orders')}>Pedidos activos</ActionButton>
            <ActionButton onClick={() => router.push('/orders?new=true')}>
              Pedido nuevo
            </ActionButton>
          </ActionRow>
          <ActionButton onClick={() => setIsMenuOpen(true)}>Menú</ActionButton>
        </BottomActions>
      </MainCard>

      {/* MENU OVERLAY */}
      {isMenuOpen && (
        <OverlayContainer $isClosing={isClosing}>
          <MenuCard>
            {menuItems.map(item => (
              <MenuItemContainer key={item.id} onClick={() => handleMenuClick(item.id)}>
                <IconWrapper>
                  <item.icon />
                </IconWrapper>
                <MenuLabel>{item.label}</MenuLabel>
              </MenuItemContainer>
            ))}
          </MenuCard>

          <CircleCloseButton onClick={closeMenu}>
            <Icons.Close />
          </CircleCloseButton>
        </OverlayContainer>
      )}

    </PageContainer>
  );
}
