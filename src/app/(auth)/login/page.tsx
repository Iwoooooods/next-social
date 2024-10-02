"use client"

import LoginForm from "./LoginForm";

export default function Page() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div className="flex h-[560px] w-full max-w-4xl flex-col items-center justify-center md:flex-row border-b-2 border-border">
        
        <div className="h-full flex-1 w-full bg-card-foreground text-card">
          <LoginForm />
        </div>
        <div className="relative hidden h-full w-full flex-1 flex-col items-end justify-start bg-card py-10 text-card-foreground md:flex border-r-2 border-border">
          <div className="text-4xl font-bold px-10">Sign In Here</div>
          <div className="absolute max-w-sm text-5xl top-36 right-10 text-right">
            Greetings <br /> from <br /> the world!
          </div>
        </div>
      </div>
    </main>
  );
}
