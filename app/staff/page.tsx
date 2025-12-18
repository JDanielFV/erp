
'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

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

const UserCard = styled.div`
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const AvatarPlaceholder = styled.div<{ $bgImage?: string }>`
  width: 80px;
  height: 80px;
  background-color: #555; 
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;
  flex-shrink: 0;
  background-image: ${props => props.$bgImage ? `url(${props.$bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  
  svg {
    display: ${props => props.$bgImage ? 'none' : 'block'};
    width: 60%;
    height: 60%;
    color: #ccc;
    fill: currentColor;
    margin-bottom: -5px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  gap: 0.2rem;
`;

const InfoLine = styled.div`
  color: #333;
  span {
    font-weight: 400;
    color: #666;
  }
  b {
    font-weight: 700;
    color: #000;
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

const SectionHeader = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
`;

const ScheduleItem = styled.div`
  font-size: 0.9rem;
  color: #333;
`;

const CardActions = styled.div`
  display: flex;
  gap: 1rem;
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
  
  &:hover {
    opacity: 0.9;
  }
`;

// --- MODALS STYLES ---
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
  max-width: 350px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 90vh;
  overflow-y: auto;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
  margin: 0;
  text-align: center;
`;

const ModalText = styled.p`
  color: #555;
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
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
  
  &:focus {
    outline: none;
    border-color: #333;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  color: #000;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #333;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
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

// Dangerous Delete Button
const DeleteConfirmButton = styled.button<{ $progress: boolean }>`
  flex: 1;
  padding: 0.75rem;
  background-color: #ffcccc;
  color: #d32f2f;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0%;
    background-color: #d32f2f;
    z-index: -1;
    transition: width 5s linear;
    width: ${props => props.$progress ? '100%' : '0%'};
  }

  &:not(:disabled) {
    background-color: #d32f2f;
    color: white;
  }
`;

// --- AVATAR UPLOAD STYLES ---
const AvatarUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const AvatarPreview = styled.div<{ $previewUrl?: string }>`
    width: 100px;
    height: 100px;
    border-radius: 50%;
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
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;

    &:hover {
        background-color: #444;
    }
`;

const HiddenInput = styled.input`
    display: none;
`;


const UserIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

export default function StaffPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Expand State
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit / Add State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    role: 'digital',
    contact_info: '',
    avatar_url: '' // New field
  });

  // Avatar handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // QR Result Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatedName, setGeneratedName] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState(false);


  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('full_name');

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // --- DELETE TIMER LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDeleteOpen) {
      setCanDelete(false);
      setTimeout(() => setCanDelete(false), 0);
      timer = setTimeout(() => {
        setCanDelete(true);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isDeleteOpen]);


  const toggleExpand = async (id: string) => {
    if (expandedUserId === id) {
      setExpandedUserId(null);
      setAttendanceHistory([]);
      return;
    }

    setExpandedUserId(id);
    setLoadingHistory(true);

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', id)
        .order('day', { ascending: false })
        .limit(10);

      if (error) throw error;

      const rawHistory = data || [];
      let processedHistory: any[] = [];

      if (rawHistory.length > 0) {
        const latestRecord = rawHistory[0];
        const latestDate = new Date(latestRecord.day + "T00:00:00");
        const dayOfWeek = latestDate.getDay();
        const distanceToMonday = (dayOfWeek + 6) % 7;
        const mondayDate = new Date(latestDate);
        mondayDate.setDate(latestDate.getDate() - distanceToMonday);

        const weekDates = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(mondayDate);
          d.setDate(mondayDate.getDate() + i);
          weekDates.push(d.toISOString().split('T')[0]);
        }

        processedHistory = weekDates.map(dateStr => {
          const found = rawHistory.find(r => r.day === dateStr);
          return {
            day: dateStr,
            earliest_login: found?.earliest_login || null,
            latest_logout: found?.latest_logout || null,
            exists: !!found
          };
        });
      }

      setAttendanceHistory(processedHistory);

    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    try {
      const timePart = isoString.split('T')[1];
      if (!timePart) return '--:--';
      return timePart.substring(0, 5);
    } catch (e) {
      return '--:--';
    }
  };

  const getDayName = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  };

  // --- HANDLERS ---
  const handleEditClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setEditingId(user.id);
    setFormData({
      full_name: user.full_name || '',
      role: user.role || 'digital',
      contact_info: user.contact_info || '',
      avatar_url: user.avatar_url || ''
    });
    setPreviewUrl(user.avatar_url || null);
    setSelectedFile(null);
    setIsEditOpen(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      role: 'digital',
      contact_info: '',
      avatar_url: ''
    });
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsAddOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setDeletingId(user.id);
    setIsDeleteOpen(true);
  };

  // Avatar Upload Helper
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Helper: Compress Image
  const compressImage = async (file: File): Promise<File> => {
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
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/jpeg', 0.7); // 0.7 Quality
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const uploadAvatar = async (userId: string, file: File) => {
    try {
      // Compress before upload
      const compressedFile = await compressImage(file);

      const fileName = `${userId}-${Date.now()}.jpg`; // Force jpg extension
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };


  const handleSaveUser = async () => {
    if (!editingId) return; // Only for edits
    setIsSaving(true);

    try {
      let avatarUrl = formData.avatar_url;

      // Upload image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadAvatar(editingId, selectedFile);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          contact_info: formData.contact_info,
          avatar_url: avatarUrl
        })
        .eq('id', editingId);

      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...formData, avatar_url: avatarUrl } : u));
      setIsEditOpen(false);
      setEditingId(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async () => {
    setIsSaving(true);
    try {
      const newUserId = crypto.randomUUID();

      // 1. Determine new short_code
      let prefix = '';
      if (formData.role === 'admin') prefix = 'ADMIN-';
      else if (formData.role === 'digital') prefix = 'DIG-';
      else if (formData.role === 'producción') prefix = 'PROD-';
      else prefix = 'GEN-';

      const { data: existing, error: fetchError } = await supabase
        .from('users')
        .select('short_code')
        .ilike('short_code', `${prefix}%`);

      if (fetchError) throw fetchError;

      let maxNum = 0;
      if (existing) {
        existing.forEach((u: any) => {
          if (u.short_code) {
            const part = u.short_code.replace(prefix, '');
            const num = parseInt(part, 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
      }

      const nextNum = maxNum + 1;
      const shortCode = `${prefix}${String(nextNum).padStart(3, '0')}`;

      // 2. Upload Avatar if present
      let avatarUrl = '';
      if (selectedFile) {
        const uploadedUrl = await uploadAvatar(newUserId, selectedFile);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      // 3. Insert User
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          full_name: formData.full_name,
          role: formData.role,
          contact_info: formData.contact_info,
          short_code: shortCode,
          avatar_url: avatarUrl
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Generate QR
      const qrDataUrl = await QRCode.toDataURL(shortCode, { width: 300, margin: 2 });

      // 5. Update UI
      setUsers(prev => [...prev, newUser]);

      setIsAddOpen(false);
      setGeneratedCode(shortCode);
      setGeneratedName(newUser.full_name);
      setGeneratedQR(qrDataUrl);
      setIsQRModalOpen(true);

    } catch (err: any) {
      console.error('Error creating user:', err);
      alert('Error al crear usuario: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;
    const link = document.createElement('a');
    link.href = generatedQR;
    link.download = `QR_${generatedCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const executeDelete = async () => {
    if (!deletingId) return;
    try {
      // 1. Delete attendance records first (Manual Cascade)
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('user_id', deletingId);

      if (attendanceError) throw attendanceError;

      // 2. Delete user
      const { error } = await supabase.from('users').delete().eq('id', deletingId);
      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== deletingId));
      setIsDeleteOpen(false);
      setDeletingId(null);
      setExpandedUserId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Error al borrar: ' + err.message);
    }
  };

  return (
    <PageContainer>
      <Title>Usuarios</Title>

      <ContentCard>
        <ScrollArea>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>Cargando personal...</p>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>No hay usuarios registrados.</p>
          ) : (
            users.map(user => (
              <div key={user.id}>
                <UserCard onClick={() => toggleExpand(user.id)}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <AvatarPlaceholder $bgImage={user.avatar_url}>
                      <UserIcon />
                    </AvatarPlaceholder>
                    <UserInfo>
                      <InfoLine><span>Nombre:</span> <b>{user.full_name || 'Sin Nombre'}</b></InfoLine>
                      <InfoLine><span>Área:</span> <b>{user.role || 'General'}</b></InfoLine>
                      <InfoLine><span>Contacto:</span> <b>{user.contact_info || '--'}</b></InfoLine>
                      <InfoLine><span>Faltas:</span> <b>{user.faults_count || 0}</b></InfoLine>
                    </UserInfo>
                  </div>

                  {expandedUserId === user.id && (
                    <ExpandedDetails onClick={(e) => e.stopPropagation()}>
                      <SectionHeader>Historial de Asistencia</SectionHeader>
                      <ScheduleList>
                        {loadingHistory ? (
                          <p style={{ fontSize: '0.8rem', color: '#888' }}>Cargando...</p>
                        ) : attendanceHistory.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: '#888' }}>Sin registros recientes.</p>
                        ) : (
                          attendanceHistory.map(record => (
                            <ScheduleItem key={record.day}>
                              <span style={{ minWidth: '70px', display: 'inline-block' }}>{getDayName(record.day)}</span>:
                              {record.exists ? (
                                <span> {formatTime(record.earliest_login)} - {formatTime(record.latest_logout)}</span>
                              ) : (
                                <span style={{ color: '#999' }}> -- </span>
                              )}
                            </ScheduleItem>
                          ))
                        )}
                      </ScheduleList>

                      <CardActions>
                        <DarkButton onClick={(e) => handleEditClick(e, user)}>Editar usuario</DarkButton>
                        <DarkButton onClick={(e) => handleDeleteClick(e, user)}>Borrar usuario</DarkButton>
                      </CardActions>
                    </ExpandedDetails>
                  )}
                </UserCard>
              </div>
            ))
          )}
        </ScrollArea>
      </ContentCard>

      <BottomActions>
        <ActionButton onClick={() => router.push('/dashboard')}>Inicio</ActionButton>
        <ActionButton onClick={handleAddClick}>Añadir usuario</ActionButton>
      </BottomActions>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <ModalOverlay onClick={() => setIsEditOpen(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalTitle>Editar Usuario</ModalTitle>

            <AvatarUploadContainer>
              <AvatarPreview $previewUrl={previewUrl || undefined}>
                {!previewUrl && <UserIcon />}
              </AvatarPreview>
              <UploadLabel>
                <CameraIcon /> Tomar Foto / Subir
                <HiddenInput
                  type="file"
                  accept="image/*"
                  capture="environment" // Hint for mobile camera
                  onChange={handleImageChange}
                />
              </UploadLabel>
            </AvatarUploadContainer>

            <FormGroup>
              <Label>Nombre completo</Label>
              <Input
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ej. Juan Pérez"
              />
            </FormGroup>

            <FormGroup>
              <Label>Área / Rol</Label>
              <Select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="digital">Digital</option>
                <option value="producción">Producción</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Contacto</Label>
              <Input
                value={formData.contact_info}
                onChange={e => setFormData({ ...formData, contact_info: e.target.value })}
                placeholder="Ej. 555-123-4567"
              />
            </FormGroup>

            <ButtonRow>
              <CancelButton onClick={() => setIsEditOpen(false)}>Cancelar</CancelButton>
              <SaveButton onClick={handleSaveUser} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </SaveButton>
            </ButtonRow>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* ADD MODAL */}
      {isAddOpen && (
        <ModalOverlay onClick={() => setIsAddOpen(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalTitle>Nuevo Usuario</ModalTitle>
            <ModalText>Se generará automáticamente un Código QR y un ID según el área seleccionada.</ModalText>

            <AvatarUploadContainer>
              <AvatarPreview $previewUrl={previewUrl || undefined}>
                {!previewUrl && <UserIcon />}
              </AvatarPreview>
              <UploadLabel>
                <CameraIcon /> Tomar Foto / Subir
                <HiddenInput
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                />
              </UploadLabel>
            </AvatarUploadContainer>

            <FormGroup>
              <Label>Nombre completo</Label>
              <Input
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Ej. Juan Pérez"
              />
            </FormGroup>

            <FormGroup>
              <Label>Área / Rol</Label>
              <Select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="digital">Digital</option>
                <option value="admin">Admin</option>
                <option value="producción">Producción</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Contacto</Label>
              <Input
                value={formData.contact_info}
                onChange={e => setFormData({ ...formData, contact_info: e.target.value })}
                placeholder="Ej. 555-123-4567"
              />
            </FormGroup>

            <ButtonRow>
              <CancelButton onClick={() => setIsAddOpen(false)}>Cancelar</CancelButton>
              <SaveButton onClick={handleCreateUser} disabled={isSaving}>
                {isSaving ? 'Crear' : 'Crear'}
              </SaveButton>
            </ButtonRow>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* QR SUCCESS MODAL */}
      {isQRModalOpen && generatedQR && (
        <ModalOverlay onClick={() => setIsQRModalOpen(false)}>
          <ModalCard onClick={e => e.stopPropagation()} style={{ alignItems: 'center' }}>
            <ModalTitle>¡Usuario Creado!</ModalTitle>
            <ModalText>Asignado a: <b>{generatedName}</b></ModalText>
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <img src={generatedQR} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px' }} />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>{generatedCode}</div>

            <ButtonRow style={{ width: '100%' }}>
              <SaveButton onClick={downloadQR}>Descargar QR</SaveButton>
            </ButtonRow>
            <ButtonRow style={{ width: '100%' }}>
              <CancelButton onClick={() => setIsQRModalOpen(false)}>Cerrar</CancelButton>
            </ButtonRow>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <ModalOverlay onClick={() => setIsDeleteOpen(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalTitle>¿Borrar Usuario?</ModalTitle>
            <ModalText>Esta acción no se puede deshacer. Todos los datos de asistencia relacionados también serán eliminados.</ModalText>

            <ButtonRow>
              <CancelButton onClick={() => setIsDeleteOpen(false)}>Cancelar</CancelButton>
              <DeleteConfirmButton
                onClick={executeDelete}
                disabled={!canDelete}
                $progress={!canDelete}
              >
                <span style={{ position: 'relative', zIndex: 2 }}>
                  {canDelete ? 'Borrar' : 'Espera...'}
                </span>
              </DeleteConfirmButton>
            </ButtonRow>
          </ModalCard>
        </ModalOverlay>
      )}

    </PageContainer>
  );
}
