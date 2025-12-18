
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ERP Notarías',
        short_name: 'ERP',
        description: 'Sistema ERP para gestión de notarías',
        start_url: '/',
        display: 'standalone',
        background_color: '#2b2b2b',
        theme_color: '#2b2b2b',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
