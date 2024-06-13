import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/signin", "/signup", "/"]);

export default clerkMiddleware((auth, req) => {
  //user logged in and trying to access public route, redirect to dashboard
  if (auth().userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
    //user logged out and trying to access private route, redirect to signin
  } else if (!auth().userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
