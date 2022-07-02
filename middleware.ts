import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getMode, separator } from '@lib/utils';

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/posts/')) {
        const subfix = `${separator()}${getMode(request.cookies)}`;
        request.nextUrl.pathname = `${request.nextUrl.pathname}${subfix}`;

        if (request.nextUrl.searchParams.has('id')) {
            request.nextUrl.searchParams.set('id', `${request.nextUrl.searchParams.get('id')}${subfix}`);
            request.nextUrl.search = request.nextUrl.searchParams.toString();
        }

        return NextResponse.rewrite(request.nextUrl);
    } else if (request.nextUrl.pathname.startsWith('/tags/')) {
        const subfix = `${separator()}${getMode(request.cookies)}`;
        request.nextUrl.pathname = `${request.nextUrl.pathname}${subfix}`;

        if (request.nextUrl.searchParams.has('name')) {
            request.nextUrl.searchParams.set('name', `${request.nextUrl.searchParams.get('name')}${subfix}`);
            request.nextUrl.search = request.nextUrl.searchParams.toString();
        }

        return NextResponse.rewrite(request.nextUrl);
    } else if (['/posts', '/tags'].includes(request.nextUrl.pathname)) {
        const subfix = `${separator()}${getMode(request.cookies)}`;
        request.nextUrl.pathname = `${request.nextUrl.pathname}/${request.nextUrl.pathname.substring(
            1,
        )}-index${subfix}`;
        return NextResponse.rewrite(request.nextUrl);
    }

    return NextResponse.next();
}
