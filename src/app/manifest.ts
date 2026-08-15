import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cielo & Yani — Date Planner & Wishlist',
    short_name: 'Cielo & Yani',
    description: 'A private space for Cielo and Yani to plan dates, share wishlists, and write love letters.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
