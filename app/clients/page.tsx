
'use client';

import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
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
  width: 100%;
  max-width: 500px;
  padding: 1.5rem;
  color: black;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 600px; 
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

const ClientCard = styled.div`
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const CardHeader = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

const LogoPlaceholder = styled.div<{ $bgImage?: string }>`
  width: 60px;
  height: 60px;
  background-color: #f0f0f0; 
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
  background-image: ${props => props.$bgImage ? `url(${props.$bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  border: 1px solid #eee;
  
  svg {
    display: ${props => props.$bgImage ? 'none' : 'block'};
    width: 50%;
    height: 50%;
    color: #ccc;
    fill: currentColor;
  }
`;

const ClientInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const ClientName = styled.div`
    font-weight: 700;
    font-size: 1rem;
    color: #000;
`;

const ClientDetail = styled.div`
    font-size: 0.85rem;
    color: #666;
`;

const StarIcon = styled.div<{ $active: boolean }>`
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: ${props => props.$active ? '#FFD700' : '#e0e0e0'}; // Gold or Gray
    
    svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
    }
`;


// --- EXPANDED DETAILS ---
const ExpandedDetails = styled.div`
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const CardActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const DarkButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  flex: 1;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

// --- BOTTOM ACTIONS ---
const BottomActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 500px;
`;

const ActionButton = styled.button`
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


// --- MODAL STYLES ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s;
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
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
  margin: 0;
  text-align: center;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  color: #000;
  &:focus { outline: none; border-color: #333; }
`;

const ToggleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  &:hover { background-color: #eee; }
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; }
`;


// --- AVATAR UPLOAD STYLES (Reused) ---
const AvatarUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const AvatarPreview = styled.div<{ $previewUrl?: string }>`
    width: 80px;
    height: 80px;
    border-radius: 12px; /* Square for businesses */
    background-color: #eee;
    background-image: ${props => props.$previewUrl ? `url(${props.$previewUrl})` : 'none'};
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #ddd;
    position: relative;
    overflow: hidden;
`;

const UploadLabel = styled.label`
    background-color: #333;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover { background-color: #444; }
`;


// --- ICONS ---
const BuildingIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </svg>
);

const StarIconSVG = () => (
    <svg viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

const CameraIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);


export default function ClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null); // null = Add, string = Edit
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        contact_name: '',
        address: '',
        rfc: '',
        phone: '',
        receiver_name: '',
        is_vip: false,
        logo_url: ''
    });

    // File Upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('name');
            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- FORM HANDLERS ---
    const handleAddClick = () => {
        setEditingId(null);
        setFormData({
            name: '',
            contact_name: '',
            address: '',
            rfc: '',
            phone: '',
            receiver_name: '',
            is_vip: false,
            logo_url: ''
        });
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (e: React.MouseEvent, client: any) => {
        e.stopPropagation();
        setEditingId(client.id);
        setFormData({
            name: client.name || '',
            contact_name: client.contact_name || '',
            address: client.address || '',
            rfc: client.rfc || '',
            phone: client.phone || '',
            receiver_name: client.receiver_name || '',
            is_vip: client.is_vip || false,
            logo_url: client.logo_url || ''
        });
        setPreviewUrl(client.logo_url || null);
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const compressImage = async (file: File): Promise<File> => {
        // Reusing compression logic (max 800px, 0.7 quality)
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg', lastModified: Date.now() }));
                        } else reject(new Error('Canvas blob failed'));
                    }, 'image/jpeg', 0.7);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const uploadLogo = async (clientId: string, file: File) => {
        try {
            const compressed = await compressImage(file);
            const fileName = `client-${clientId}-${Date.now()}.jpg`;
            const { error } = await supabase.storage.from('avatars').upload(fileName, compressed);
            if (error) throw error;
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            return data.publicUrl;
        } catch (e) {
            console.error('Upload failed:', e);
            return null;
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // If new, generate ID first allows consistent file naming, but standard is UUID from DB.
            // For updates, we have ID. For inserts, we can trust DB or gen client side. 
            // Let's generate client side ID for new records to use in filename if needed, or better, just use Date.now for uniqueness.
            // Actually, best to Insert -> Get ID -> Upload -> Update if needed.
            // Or just use random filename: `logo-${Date.now()}.jpg`

            let logoUrl = formData.logo_url;

            // Upload if file selected
            if (selectedFile) {
                // We don't have ID for new users yet if we rely on DB, but that's fine for filename
                const fileName = `logo-${Date.now()}.jpg`;
                const compressed = await compressImage(selectedFile);
                const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, compressed);
                if (upErr) throw upErr;
                const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
                logoUrl = data.publicUrl;
            }

            const payload = { ...formData, logo_url: logoUrl };

            if (editingId) {
                const { error } = await supabase.from('clients').update(payload).eq('id', editingId);
                if (error) throw error;
                setClients(prev => prev.map(c => c.id === editingId ? { ...c, ...payload } : c));
            } else {
                const { data, error } = await supabase.from('clients').insert(payload).select().single();
                if (error) throw error;
                setClients(prev => [...prev, data]);
            }

            setIsModalOpen(false);
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <PageContainer>
            <Title>Clientes</Title>

            <ContentCard>
                <ScrollArea>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>Cargando...</p>
                    ) : clients.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>No hay clientes registrados.</p>
                    ) : (
                        clients.map(client => (
                            <div key={client.id}>
                                <ClientCard onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}>
                                    <StarIcon $active={client.is_vip}>
                                        <StarIconSVG />
                                    </StarIcon>

                                    <CardHeader>
                                        <LogoPlaceholder $bgImage={client.logo_url}>
                                            <BuildingIcon />
                                        </LogoPlaceholder>
                                        <ClientInfo>
                                            <ClientName>{client.name}</ClientName>
                                            <ClientDetail>{client.contact_name || 'Sin contacto'}</ClientDetail>
                                            <ClientDetail>{client.phone || '--'}</ClientDetail>
                                        </ClientInfo>
                                    </CardHeader>

                                    {expandedClientId === client.id && (
                                        <ExpandedDetails>
                                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                <b>RFC:</b> {client.rfc || 'N/A'}<br />
                                                <b>Dirección:</b> {client.address || 'N/A'}<br />
                                                <b>Quien recibe:</b> {client.receiver_name || 'N/A'}
                                            </p>
                                            <CardActions>
                                                <DarkButton onClick={(e) => handleEditClick(e, client)}>Editar información</DarkButton>
                                            </CardActions>
                                        </ExpandedDetails>
                                    )}
                                </ClientCard>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </ContentCard>

            <BottomActions>
                <ActionButton onClick={() => router.push('/dashboard')}>Inicio</ActionButton>
                <ActionButton onClick={handleAddClick}>Añadir cliente</ActionButton>
            </BottomActions>

            {/* ADD/EDIT MODAL */}
            {isModalOpen && (
                <ModalOverlay onClick={() => setIsModalOpen(false)}>
                    <ModalCard onClick={e => e.stopPropagation()}>
                        <ModalTitle>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</ModalTitle>

                        <AvatarUploadContainer>
                            <AvatarPreview $previewUrl={previewUrl || undefined}>
                                {!previewUrl && <BuildingIcon />}
                            </AvatarPreview>
                            <UploadLabel>
                                <CameraIcon /> Logo
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </UploadLabel>
                        </AvatarUploadContainer>

                        <FormGroup>
                            <Label>Nombre Fiscal / Empresa</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ej. Notaría Publica 1" />
                        </FormGroup>

                        <FormGroup>
                            <Label>Nombre de contacto</Label>
                            <Input value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })} placeholder="Ej. José Luis Guerra" />
                        </FormGroup>

                        <ToggleRow>
                            <Label>¿Es cliente prioritario? (V.I.P.)</Label>
                            <input type="checkbox" checked={formData.is_vip} onChange={e => setFormData({ ...formData, is_vip: e.target.checked })} style={{ transform: 'scale(1.5)', accentColor: '#333' }} />
                        </ToggleRow>

                        <FormGroup>
                            <Label>Domicilio de entrega</Label>
                            <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </FormGroup>

                        <FormGroup>
                            <Label>RFC (Para envío)</Label>
                            <Input value={formData.rfc} onChange={e => setFormData({ ...formData, rfc: e.target.value })} />
                        </FormGroup>

                        <FormGroup>
                            <Label>Quien recibe</Label>
                            <Input value={formData.receiver_name} onChange={e => setFormData({ ...formData, receiver_name: e.target.value })} />
                        </FormGroup>

                        <FormGroup>
                            <Label>Número de contacto</Label>
                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </FormGroup>

                        <ButtonRow>
                            <CancelButton onClick={() => setIsModalOpen(false)}>Cancelar</CancelButton>
                            <SaveButton onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </SaveButton>
                        </ButtonRow>
                    </ModalCard>
                </ModalOverlay>
            )}

        </PageContainer>
    );
}
