
import { getCookie, deleteCookie } from 'cookies-next';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    id: string;
    role: 'admin' | 'user';
    exp: number;
}

const roleRoutes: { [key: string]: string[] } = {
    basics: ['login', 'register'],
    super_admin: ['dashboard'],
    user: ['dashboard'],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/_next") || pathname.startsWith("/static")) {
        return NextResponse.next();
    }
    if (pathname.includes("forbidden"))
        return NextResponse.next();
    const jwt = request.cookies.get('jwt')?.value
    if (jwt && typeof jwt === "string") {
        try {
            const decoded: JwtPayload = jwtDecode(jwt as string);
            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp < currentTime) {
                const response = NextResponse.redirect(new URL(`/login`, request.url));
                response.cookies.delete('jwt');
                return response;
            }

            const userRole = decoded.role;

            // Vérifier si l'utilisateur a accès à la route
            const allowedRoutes = roleRoutes[userRole].concat(roleRoutes["basics"]) || roleRoutes["basics"];
            const route = pathname.replace('/', '');

            console.log(route)

            const routeOfUser = route.split('/')[0];
            console.log(routeOfUser)

            if (!allowedRoutes.includes(routeOfUser)) {
                console.log("forbidden", routeOfUser);
                console.log(allowedRoutes);
                console.log(request.url);
                return NextResponse.redirect(new URL(`/forbidden`, request.url)); // Rediriger vers une page d'erreur si l'accès est refusé
            }

            if (pathname === '/' || pathname === '/login' || pathname === '/register') {
                return NextResponse.redirect(new URL(`/dashboard`, request.url));
            }
            return NextResponse.next();

        } catch (error) {
            console.error("Erreur lors du décodage du JWT", error);
            return NextResponse.redirect(new URL(`/login`, request.url));
        }
    }
    console.log("pas de jwt")
    if (pathname === '/login' || pathname === '/register') {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL(`/login`, request.url));
}

export const config = {
    matcher: ['/:path*']
};