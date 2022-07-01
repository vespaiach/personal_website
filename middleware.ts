import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getThemeModes, separator } from '@lib/utils';

export function middleware(request: NextRequest, a, b, c) {
    if (request.nextUrl.pathname.startsWith('/posts/')) {
        const subfix = `${separator()}${getMode(request)}`;
        request.nextUrl.pathname = `${request.nextUrl.pathname}${subfix}`;

        if (request.nextUrl.searchParams.has('id')) {
            request.nextUrl.searchParams.set('id', `${request.nextUrl.searchParams.get('id')}${subfix}`);
            request.nextUrl.search = request.nextUrl.searchParams.toString();
        }

        return NextResponse.rewrite(request.nextUrl);
    }

    return NextResponse.next();
}

function getMode(request: NextRequest) {
    const modes = getThemeModes();
    return request.cookies.has('theme-mode') && modes.includes(request.cookies.get('theme-mode'))
        ? request.cookies.get('theme-mode')
        : modes[0];
}
