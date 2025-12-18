
'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => console.log('SW Registered scope: ', registration.scope))
                .catch((err) => console.log('SW Registration failed: ', err));
        }
    }, [])

    return null
}
