"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { loginUser } from "@/actions/login";
import styles from "@/app/component/Auth/Auth.module.scss";
import Link from "next/link";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";

type LoginFormInputs = {
  email: string;
  password: string;
};

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    const res = await loginUser(data.email, data.password);

    if (!res.success) {
      setServerError(res.error);
      return;
    }

    // Успішний логін — редіректимо на клієнті
    router.push("/dashboard");
  };

  return (
    <div className={styles.Container}>
      <h1 className={styles.Title}>Welcome Back</h1>

      <form className={styles.Form} onSubmit={handleSubmit(onSubmit)}>
        {serverError && <p className={styles.Error}>{serverError}</p>}

        <div className={styles.Field}>
          <label>Email</label>
          <div className={styles.InputWrapper}>
            <FaEnvelope className={styles.Icon} />
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className={styles.Error}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.Field}>
          <label>Password</label>
          <div className={styles.InputWrapper}>
            <FaLock className={styles.Icon} />
            <input
              type="password"
              {...register("password")}
              placeholder="Your password"
            />
          </div>
          {errors.password && (
            <p className={styles.Error}>{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className={styles.Submit} disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <div className={styles.RegisterBlock}>
          <p>Don't have an account?</p>
          <Link href="/register">Register</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
