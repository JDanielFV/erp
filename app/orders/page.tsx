
'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// --- STYLES ---
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #2b2b2b;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const ContentCard = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  color: black;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem; 
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const OrderCard = styled.div`
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const OrderHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const ClientName = styled.h3`
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    color: #333;
`;

const DateText = styled.span`
    font-size: 0.8rem;
    color: #888;
`;

const OrderDescription = styled.p`
    font-size: 0.9rem;
    color: #555;
    margin: 0.5rem 0;
    line-height: 1.4;
`;

const Divider = styled.hr`
    border: 0;
    border-top: 1px solid #eee;
    margin: 0.5rem 0;
`;

// --- ACTION BUTTONS (Main View) ---
const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

const ActionButton = styled.button`
    flex: 1;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.6rem;
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 500;
    
    &:hover { opacity: 0.9; }
`;

const SecondaryButton = styled(ActionButton)`
    background-color: #555;
`;

// --- FORMS & LISTS (Expanded Mode) ---
const ModeContainer = styled.div`
    margin-top: 0.5rem;
    animation: fadeIn 0.3s ease;
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const SectionLabel = styled.div`
    font-size: 0.8rem;
    color: #000;
    margin-bottom: 0.25rem;
`;

const ListContainer = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const ListItem = styled.li`
    font-size: 0.85rem;
    color: #444;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    
    &::before {
        content: "•";
        color: #888;
    }
`;

const InputGroup = styled.div`
    margin-bottom: 0.75rem;
`;

const InputLabel = styled.label`
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
`;

const TextInput = styled.input`
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    &:focus { outline: none; border-color: #333; }
`;

const SelectInput = styled.select`
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    background-color: white;
    color: #000;
    &:focus { outline: none; border-color: #333; }
`;

const SaveChangesButton = styled.button`
    width: 100%;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem;
    margin-top: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    &:hover { opacity: 0.9; }
`;

const AddMoreButton = styled.button`
    width: 100%;
    background-color: #2b2b2b;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    margin-top: 0.25rem;
    &:disabled { opacity: 0.5; }
`;

// --- BOTTOM NAV ---
const BottomNav = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 500px;
`;

const NavButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  text-align: center;
  &:hover { opacity: 0.9; }
`;


// --- MODAL (New Order) ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;
const ModalCard = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    // UI State
    const [activeModes, setActiveModes] = useState<{ [key: string]: 'none' | 'assign' | 'purchase' | 'edit' }>({});
    const [assignments, setAssignments] = useState<{ [key: string]: any[] }>({});
    const [purchases, setPurchases] = useState<{ [key: string]: any[] }>({});

    // Form Inputs State (Per Order)
    const [inputs, setInputs] = useState<{ [key: string]: any }>({});

    // New Order Modal
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [newOrderData, setNewOrderData] = useState({ client_id: '', description: '', deadline: '' });

    useEffect(() => {
        fetchData();

        const channel = supabase.channel('realtime_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_assignments' }, (payload) => {
                const orderId = (payload.new as any)?.order_id || (payload.old as any)?.order_id;
                if (orderId) fetchOrderDetails(orderId);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_purchases' }, (payload) => {
                const orderId = (payload.new as any)?.order_id || (payload.old as any)?.order_id;
                if (orderId) fetchOrderDetails(orderId);
            })
            .subscribe((status) => {
                console.log('Realtime status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('Listening for changes...');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, usersRes, clientsRes] = await Promise.all([
                supabase.from('orders').select(`*, clients(name)`).order('created_at', { ascending: false }),
                supabase.from('users').select('id, full_name').order('full_name'),
                supabase.from('clients').select('id, name').order('name')
            ]);

            if (ordersRes.error) throw ordersRes.error;
            setOrders(ordersRes.data || []);
            setUsers(usersRes.data || []);
            setClients(clientsRes.data || []);

            // Prefetch details for all visible orders
            ordersRes.data?.forEach(order => fetchOrderDetails(order.id));

        } catch (e) {
            console.error('Fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId: string) => {
        const [assigns, purchs] = await Promise.all([
            supabase.from('order_assignments').select(`*, users(full_name)`).eq('order_id', orderId),
            supabase.from('order_purchases').select('*').eq('order_id', orderId)
        ]);

        if (assigns.data) setAssignments(prev => ({ ...prev, [orderId]: assigns.data || [] }));
        if (purchs.data) setPurchases(prev => ({ ...prev, [orderId]: purchs.data || [] }));
    };

    const handleInputChange = (orderId: string, field: string, value: string) => {
        setInputs(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], [field]: value }
        }));
    };

    // --- ACTIONS ---

    const handleAssignTask = async (orderId: string) => {
        const data = inputs[orderId];
        if (!data?.user_id || !data?.task_description) return alert('Selecciona personal y escribe la tarea.');

        try {
            const { error } = await supabase.from('order_assignments').insert({
                order_id: orderId,
                user_id: data.user_id,
                task_description: data.task_description
            });
            if (error) throw error;

            await fetchOrderDetails(orderId); // Refresh
            handleInputChange(orderId, 'task_description', ''); // Clear task input
        } catch (e: any) { alert(e.message); }
    };

    const handleAddPurchase = async (orderId: string) => {
        const data = inputs[orderId];
        if (!data?.item_name || !data?.purchase_place) return alert('Escribe el material y el lugar.');

        try {
            const { error } = await supabase.from('order_purchases').insert({
                order_id: orderId,
                item_name: data.item_name,
                purchase_place: data.purchase_place
            });
            if (error) throw error;

            await fetchOrderDetails(orderId);
            handleInputChange(orderId, 'item_name', ''); // Clear inputs
            handleInputChange(orderId, 'purchase_place', '');
        } catch (e: any) { alert(e.message); }
    };

    const handleCreateOrder = async () => {
        if (!newOrderData.client_id || !newOrderData.description) return alert('Faltan datos.');
        try {
            const { error } = await supabase.from('orders').insert({
                client_id: newOrderData.client_id,
                description: newOrderData.description,
                status: 'active'
            });
            if (error) throw error;

            setIsNewOrderOpen(false);
            setNewOrderData({ client_id: '', description: '', deadline: '' });
            fetchData(); // Refresh all
        } catch (e: any) { alert(e.message); }
    };

    // --- DELETE ACTIONS ---
    const handleDeleteAssignment = async (id: string, orderId: string) => {
        if (!confirm('¿Borrar esta tarea?')) return;
        try {
            const { error } = await supabase.from('order_assignments').delete().eq('id', id);
            if (error) throw error;
            fetchOrderDetails(orderId);
        } catch (e: any) { alert(e.message); }
    };

    const handleDeletePurchase = async (id: string, orderId: string) => {
        if (!confirm('¿Borrar esta compra?')) return;
        try {
            const { error } = await supabase.from('order_purchases').delete().eq('id', id);
            if (error) throw error;
            fetchOrderDetails(orderId);
        } catch (e: any) { alert(e.message); }
    };

    const renderAssignments = (orderId: string, isEditing: boolean) => {
        const list = assignments[orderId] || [];
        if (list.length === 0) return <SectionLabel>Sin tareas asignadas</SectionLabel>;
        return (
            <ListContainer>
                {list.map(a => (
                    <ListItem key={a.id}>
                        <span><b>{a.users?.full_name}:</b> {a.task_description}</span>
                        {isEditing && (
                            <button
                                onClick={() => handleDeleteAssignment(a.id, orderId)}
                                style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginLeft: 'auto' }}
                            >
                                ✕
                            </button>
                        )}
                    </ListItem>
                ))}
            </ListContainer>
        );
    };

    const renderPurchases = (orderId: string, isEditing: boolean) => {
        const list = purchases[orderId] || [];
        if (list.length === 0) return <SectionLabel>Sin compras registradas</SectionLabel>;
        return (
            <ListContainer>
                {list.map(p => (
                    <ListItem key={p.id}>
                        <span>{p.item_name} ({p.purchase_place})</span>
                        {isEditing && (
                            <button
                                onClick={() => handleDeletePurchase(p.id, orderId)}
                                style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginLeft: 'auto' }}
                            >
                                ✕
                            </button>
                        )}
                    </ListItem>
                ))}
            </ListContainer>
        );
    };

    const handleUpdateDescription = async (orderId: string) => {
        const newDesc = inputs[orderId]?.description;
        if (newDesc === undefined) return;

        try {
            const { error } = await supabase.from('orders').update({ description: newDesc }).eq('id', orderId);
            if (error) throw error;

            await fetchData(); // Force refresh
            alert('Nota actualizada correctamente');
        } catch (e: any) {
            console.error(e);
            alert('Error al actualizar: ' + e.message);
        }
    };

    const toggleMode = (orderId: string, mode: 'view' | 'assign' | 'purchase' | 'edit' | 'collapsed', currentDesc?: string) => {
        setActiveModes(prev => ({
            ...prev,
            [orderId]: mode
        }));

        if (mode === 'edit' && currentDesc !== undefined) {
            setInputs(prev => ({ ...prev, [orderId]: { description: currentDesc } }));
        } else if (mode !== 'collapsed') {
            // Keep inputs if moving between action modes? No, clear looks safer usually, but maybe unnecessary if just viewing.
            // Clearing inputs on collapse or mode switch.
            setInputs(prev => ({ ...prev, [orderId]: {} }));
        }
    };

    return (
        <PageContainer>
            <Title>Pedidos activos</Title>

            <ContentCard>
                <ScrollArea>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>Cargando pedidos...</p>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <p style={{ color: '#888' }}>No hay pedidos activos.</p>
                        </div>
                    ) : (
                        orders.map(order => {
                            const mode = activeModes[order.id] || 'collapsed';
                            const date = new Date(order.created_at).toLocaleDateString('es-ES');
                            const isExpanded = mode !== 'collapsed';

                            return (
                                <OrderCard
                                    key={order.id}
                                    onClick={() => {
                                        if (!isExpanded) toggleMode(order.id, 'view');
                                        // If already expanded, maybe do nothing or allow collapsing by clicking header?
                                        // User request: "only until clicked shows them". Doesn't explicitly say click to close, but usually toggles.
                                        // Let's allow toggle off if clicking the card background when expanded? 
                                        // Better yet, just open if collapsed. Close via button? Or toggle on header.
                                        // Let's make the Whole Card toggle if collapsed, but if expanded only Header toggles?
                                        // Simpler: expanding is main action. Collapsing can be done by clicking Header or a "Close" button.
                                        // Let's strictly follow: "clicked shows them". I will implement toggle on Header, or whole card if collapsed.
                                    }}
                                    style={{ cursor: isExpanded ? 'default' : 'pointer' }}
                                >
                                    <OrderHeader onClick={(e) => {
                                        if (isExpanded) {
                                            e.stopPropagation();
                                            toggleMode(order.id, 'collapsed');
                                        }
                                    }} style={{ cursor: 'pointer' }}>
                                        <ClientName>{order.clients?.name || 'Cliente desconocido'}</ClientName>
                                        <DateText>Ingresado el {date}</DateText>
                                    </OrderHeader>

                                    {mode !== 'edit' && (
                                        <OrderDescription onClick={(e) => {
                                            if (isExpanded) {
                                                e.stopPropagation();
                                                toggleMode(order.id, 'collapsed');
                                            }
                                        }} style={{ cursor: isExpanded ? 'pointer' : 'inherit' }}>
                                            {order.description}
                                        </OrderDescription>
                                    )}

                                    {/* VIEW MODE: Show Lists & Buttons */}
                                    {mode === 'view' && (
                                        <ModeContainer>
                                            <Divider />
                                            <SectionLabel>Tareas:</SectionLabel>
                                            {renderAssignments(order.id, false)}

                                            <div style={{ marginTop: '0.5rem' }}></div>
                                            <SectionLabel>Compras:</SectionLabel>
                                            {renderPurchases(order.id, false)}

                                            <ButtonGroup>
                                                <ActionButton onClick={(e) => { e.stopPropagation(); toggleMode(order.id, 'assign'); }}>Asignar tarea</ActionButton>
                                                <SecondaryButton onClick={(e) => { e.stopPropagation(); toggleMode(order.id, 'purchase'); }}>Ingresar compra</SecondaryButton>
                                                <SecondaryButton onClick={(e) => { e.stopPropagation(); toggleMode(order.id, 'edit', order.description); }} style={{ backgroundColor: '#777' }}>Editar</SecondaryButton>
                                            </ButtonGroup>
                                        </ModeContainer>
                                    )}

                                    {mode === 'assign' && (
                                        <ModeContainer onClick={e => e.stopPropagation()}>
                                            <Divider />
                                            <SectionLabel>Tareas:</SectionLabel>
                                            {renderAssignments(order.id, false)}

                                            <InputGroup>
                                                <InputLabel>Personal</InputLabel>
                                                <SelectInput
                                                    value={inputs[order.id]?.user_id || ''}
                                                    onChange={e => handleInputChange(order.id, 'user_id', e.target.value)}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {users.map(u => (
                                                        <option key={u.id} value={u.id}>{u.full_name}</option>
                                                    ))}
                                                </SelectInput>
                                            </InputGroup>

                                            <InputGroup>
                                                <InputLabel>Tarea</InputLabel>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <TextInput
                                                        placeholder="Descripción de la tarea"
                                                        value={inputs[order.id]?.task_description || ''}
                                                        onChange={e => handleInputChange(order.id, 'task_description', e.target.value)}
                                                    />
                                                </div>
                                                <AddMoreButton onClick={() => handleAssignTask(order.id)}>
                                                    + Añadir Tarea
                                                </AddMoreButton>
                                            </InputGroup>

                                            <SaveChangesButton onClick={() => toggleMode(order.id, 'view')}>
                                                Listo / Volver
                                            </SaveChangesButton>
                                        </ModeContainer>
                                    )}

                                    {mode === 'purchase' && (
                                        <ModeContainer onClick={e => e.stopPropagation()}>
                                            <Divider />
                                            <SectionLabel>Compras:</SectionLabel>
                                            {renderPurchases(order.id, false)}

                                            <InputGroup>
                                                <InputLabel>Añadir a lista</InputLabel>
                                                <TextInput
                                                    placeholder="Material (ej. Papel)"
                                                    value={inputs[order.id]?.item_name || ''}
                                                    onChange={e => handleInputChange(order.id, 'item_name', e.target.value)}
                                                />
                                            </InputGroup>

                                            <InputGroup>
                                                <InputLabel>Lugar de compra</InputLabel>
                                                <TextInput
                                                    placeholder="Lugar/Proveedor"
                                                    value={inputs[order.id]?.purchase_place || ''}
                                                    onChange={e => handleInputChange(order.id, 'purchase_place', e.target.value)}
                                                />
                                                <AddMoreButton onClick={() => handleAddPurchase(order.id)}>
                                                    + Añadir más
                                                </AddMoreButton>
                                            </InputGroup>

                                            <SaveChangesButton onClick={() => toggleMode(order.id, 'view')}>
                                                Listo / Volver
                                            </SaveChangesButton>
                                        </ModeContainer>
                                    )}

                                    {mode === 'edit' && (
                                        <ModeContainer onClick={e => e.stopPropagation()}>

                                            <InputGroup>
                                                <SectionLabel>Editar Nota:</SectionLabel>
                                                <textarea
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', color: '#000', fontFamily: 'inherit' }}
                                                    rows={3}
                                                    value={inputs[order.id]?.description || ''}
                                                    onChange={e => handleInputChange(order.id, 'description', e.target.value)}
                                                />
                                                <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                                                    <button
                                                        onClick={() => handleUpdateDescription(order.id)}
                                                        style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Guardar Nota
                                                    </button>
                                                </div>
                                            </InputGroup>

                                            <Divider />
                                            <SectionLabel>Editar Tareas:</SectionLabel>
                                            {renderAssignments(order.id, true)}

                                            <div style={{ marginTop: '1rem' }}></div>
                                            <SectionLabel>Editar Compras:</SectionLabel>
                                            {renderPurchases(order.id, true)}

                                            <SaveChangesButton onClick={() => toggleMode(order.id, 'view')}>
                                                Terminar Edición
                                            </SaveChangesButton>
                                        </ModeContainer>
                                    )}

                                </OrderCard>
                            );
                        })
                    )}
                </ScrollArea>
            </ContentCard>

            <BottomNav>
                <NavButton onClick={() => router.push('/dashboard')}>Inicio</NavButton>
                <NavButton onClick={() => setIsNewOrderOpen(true)}>Nuevo Pedido</NavButton>
            </BottomNav>

            {/* NEW ORDER MODAL */}
            {isNewOrderOpen && (
                <ModalOverlay onClick={() => setIsNewOrderOpen(false)}>
                    <ModalCard onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: 'black', margin: 0 }}>Crear Pedido</h2>

                        <InputGroup>
                            <InputLabel>Cliente</InputLabel>
                            <SelectInput
                                value={newOrderData.client_id}
                                onChange={e => setNewOrderData({ ...newOrderData, client_id: e.target.value })}
                            >
                                <option value="">Seleccionar Cliente...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </SelectInput>
                        </InputGroup>

                        <InputGroup>
                            <InputLabel>Nota del Pedido</InputLabel>
                            <textarea
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', color: '#000' }}
                                rows={4}
                                placeholder="Detalles del trabajo..."
                                value={newOrderData.description}
                                onChange={e => setNewOrderData({ ...newOrderData, description: e.target.value })}
                            />
                        </InputGroup>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <NavButton onClick={() => setIsNewOrderOpen(false)} style={{ backgroundColor: '#eee', color: 'black' }}>Cancelar</NavButton>
                            <NavButton onClick={handleCreateOrder}>Crear</NavButton>
                        </div>
                    </ModalCard>
                </ModalOverlay>
            )}

        </PageContainer>
    );
}
