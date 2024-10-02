"use client";

import { login } from "./action";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginValues } from "@/lib/validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PasswordInput from "@/components/PasswordInput";
import { Input } from "@/components/ui/input";
import LoginButton from "@/components/LoginButton";
import Link from "next/link";

export default function LoginForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await login(values);
      if (error) setError(error);
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col items-center gap-4 p-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Username"
                  {...field}
                  className="max-w-64 rounded-sm border-2 md:w-80 lg:w-96 bg-card text-card-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  type="password"
                  placeholder="Password"
                  {...field}
                  className="max-w-64 rounded-sm md:w-80 lg:w-96 bg-card text-card-foreground"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-destructive">{error}</p>}
        <LoginButton
          type="submit"
          loading={isPending}
          className="mt-auto rounded-sm max-w-64 border-2 md:w-80 lg:w-96 bg-card text-card-foreground"
        >
          Sign In
        </LoginButton>
        <div className="text-md">
          Don't have an account?{" "}
          <Link href="/signup" className="underline">
            Sign Up
          </Link>
        </div>
      </form>
    </Form>
  );
}
