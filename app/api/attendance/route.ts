
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('API /api/attendance received:', body);
        const { uuid: code, type, date, timestamp } = body; // Recibimos 'uuid' del cliente, pero lo tratamos como 'code' genérico

        if (!code || !type) {
            return NextResponse.json({ error: 'Missing code or type' }, { status: 400 });
        }

        // Use client-provided date and timestamp
        const today = date || new Date().toISOString().split('T')[0];
        const recordTime = timestamp || new Date().toISOString();

        // 1. Validate User Exists via SHORT CODE or UUID
        // Intentamos buscar por short_code primero
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('id, full_name, short_code')
            .eq('short_code', code)
            .single();

        // Si no encuentra por short_code, intentamos por UUID (si el código parece un UUID)
        if (!user && (String(code).length > 20)) { // Simple check, UUIDs are 36 chars
            const { data: userByUuid } = await supabase
                .from('users')
                .select('id, full_name, short_code')
                .eq('id', code)
                .single();
            user = userByUuid;
        }

        // Fallback Final: Buscar por Nombre (para sesiones antiguas o migración)
        if (!user) {
            const { data: userByName } = await supabase
                .from('users')
                .select('id, full_name, short_code')
                .eq('full_name', code) // Asume que 'code' podría ser el nombre
                .single();
            user = userByName;
        }

        if (!user) {
            console.error('User not found for code:', code);
            return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
        }

        const userId = user.id;
        const fullName = user.full_name || 'Usuario';
        const shortCode = user.short_code || code; // Para devolverlo si se usa

        // 2. Attendance Logic
        const attendanceData = {
            user_id: userId,
            day: today
        };
        console.log('Attendance Upsert Data:', attendanceData);

        if (type === 'login') {
            const { error: upsertError } = await supabase
                .from('attendance')
                .upsert(
                    {
                        ...attendanceData,
                        earliest_login: recordTime
                    },
                    { onConflict: 'user_id,day', ignoreDuplicates: true }
                );

            if (upsertError) console.error('Error upserting login:', upsertError);

        } else if (type === 'logout') {
            const { error: upsertError } = await supabase
                .from('attendance')
                .upsert(
                    {
                        ...attendanceData,
                        latest_logout: recordTime
                    },
                    { onConflict: 'user_id,day' }
                );

            if (upsertError) console.error('Error upserting logout:', upsertError);
        }

        // Fetch updated session to return
        const { data: finalRecord } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('day', today)
            .single();

        // Return session data
        const userSession = {
            userName: fullName,
            uuid: userId,
            shortCode: shortCode,
            earliestLogin: finalRecord?.earliest_login,
            latestLogout: finalRecord?.latest_logout
        };

        console.log('Supabase updated for user:', fullName);
        return NextResponse.json({ success: true, userSession });

    } catch (error) {
        console.error('SERVER ERROR in /api/attendance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
