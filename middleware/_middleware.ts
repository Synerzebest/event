import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin'; 
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Vérifier le token avec Firebase Admin SDK
    await admin.auth().verifyIdToken(token);

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/api/*', '/eventlab'],
};
