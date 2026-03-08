"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle, IconMail } from "@tabler/icons-react";

export default function SignupFormDemo() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-[#0d0d0d] border border-[#242424] p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
      <h2 className="text-xl font-bold text-white">
        Create your account
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[#707070]">
        Sign up to get your personalized AI learning path.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname" className="text-[#a0a0a0]">First name</Label>
            <Input
              id="firstname"
              placeholder="Alex"
              type="text"
              className="bg-[#141414] border-[#242424] text-white placeholder:text-[#404040] focus:border-primary focus:ring-0"
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname" className="text-[#a0a0a0]">Last name</Label>
            <Input
              id="lastname"
              placeholder="Johnson"
              type="text"
              className="bg-[#141414] border-[#242424] text-white placeholder:text-[#404040] focus:border-primary focus:ring-0"
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email" className="text-[#a0a0a0]">Email address</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            type="email"
            className="bg-[#141414] border-[#242424] text-white placeholder:text-[#404040] focus:border-primary focus:ring-0"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="password" className="text-[#a0a0a0]">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            className="bg-[#141414] border-[#242424] text-white placeholder:text-[#404040] focus:border-primary focus:ring-0"
          />
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-primary font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          type="submit"
        >
          Create account &rarr;
          <BottomGradient />
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#242424]" />
          <span className="text-xs text-[#505050] uppercase tracking-widest">or continue with</span>
          <div className="h-px flex-1 bg-[#242424]" />
        </div>

        <div className="flex flex-col space-y-3">
          <button
            className="group/btn relative flex h-10 w-full items-center justify-start space-x-3 rounded-md bg-[#141414] border border-[#242424] px-4 font-medium text-[#c0c0c0] hover:border-[#3a3a3a] hover:text-white transition-colors"
            type="button"
          >
            <IconBrandGoogle className="h-4 w-4 text-[#80b8f5]" />
            <span className="text-sm">Continue with Google</span>
            <BottomGradient />
          </button>
          <button
            className="group/btn relative flex h-10 w-full items-center justify-start space-x-3 rounded-md bg-[#141414] border border-[#242424] px-4 font-medium text-[#c0c0c0] hover:border-[#3a3a3a] hover:text-white transition-colors"
            type="button"
          >
            {/* Outlook icon */}
            <svg className="h-4 w-4 text-[#80b8f5]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V12zm-7.85-3.53q-.64-.31-1.37-.31-.81 0-1.45.32-.62.32-1.03.87-.4.55-.6 1.27-.2.72-.2 1.52 0 .75.19 1.44.2.7.58 1.23.4.53 1 .84.6.3 1.44.3.74 0 1.4-.3.65-.32 1.05-.87.4-.55.62-1.28.2-.73.2-1.57 0-.8-.21-1.49-.2-.7-.6-1.22-.38-.52-1.02-.75z"/>
            </svg>
            <span className="text-sm">Continue with Outlook</span>
            <BottomGradient />
          </button>
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
