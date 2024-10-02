import SignUpForm from "./SignupForm";

export default function Page() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div className="flex h-[560px] w-full max-w-4xl flex-col items-center justify-center md:flex-row border-b-2 border-border">
        <div className="relative hidden h-full w-full flex-1 flex-col items-start justify-start bg-card-foreground py-10 text-card md:flex">
          <div className="text-4xl font-bold px-10">Sign Up Here</div>
          <div className="absolute max-w-sm text-5xl top-36 left-10 text-left">
          Join the Community. <br /> Connect. <br /> Share. <br /> Inspire.
          </div>
        </div>
        <div className="h-full flex-1 w-full bg-card text-card-foreground border-r-2 border-border">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}
