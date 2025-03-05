"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Input, Button, Alert, Typography, Divider } from "antd";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { BackgroundLines } from "@/components/ui/background-lines";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";


const { Title } = Typography;

const Signin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const lng = useLanguage();

    const { t } = useTranslation(lng, "auth");

    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirige vers la page d'accueil ou le tableau de bord après connexion réussie
            router.push(`/${lng}/eventlab`);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleGoogleSignin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            router.push(`/${lng}/eventlab`);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <BackgroundLines className="flex items-center justify-center">                
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg relative z-10">
                    <Title level={2} className="text-center">
                    {safeTranslate(t, "welcome_back")}
                    </Title>

                    {error && <Alert message={error} type="error" showIcon />}

                    <form onSubmit={handleSignin} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full"
                            size="large"
                        />
                        <Input.Password
                            placeholder={safeTranslate(t, "password")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full"
                            size="large"
                        />

                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full mt-4"
                            size="large"
                        >
                            {safeTranslate(t, "signin")}
                        </Button>
                    </form>

                    <Divider>Or</Divider>

                    <Button
                        onClick={handleGoogleSignin}
                        type="default"
                        className="w-full flex items-center justify-center space-x-2"
                        size="large"
                    >
                        <FcGoogle className="text-xl" />
                        <span>{safeTranslate(t, "signin_google")}</span>
                    </Button>


                    <p className="text-center text-gray-500">
                    {safeTranslate(t, "not_member")}{" "}
                    <Link href="/auth/signup" className="text-blue-500 hover:underline hover:text-blue-700">{safeTranslate(t, "signup")}</Link>
                    </p>
                </div>
        </BackgroundLines>
    );
};

export default Signin;
