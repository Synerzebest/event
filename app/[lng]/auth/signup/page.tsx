"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input, Button, Alert, Typography, Divider } from "antd";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import useLanguage from "@/lib/useLanguage";
import { BackgroundLines } from "@/components/ui/background-lines";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";

const { Title } = Typography;

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const lng = useLanguage();
    const router = useRouter();

    const { t } = useTranslation(lng, "auth");

    // Inscription avec email et mot de passe
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Crée l'utilisateur dans Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Met à jour le profil de l'utilisateur avec le nom
            await updateProfile(user, { displayName: name });

            // Enregistre les informations de l'utilisateur dans Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date(),
                stripeConfigured: false,
            });

            // Redirige vers le tableau de bord
            router.push(`/${lng}/eventlab`);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    // Inscription avec Google
    const handleGoogleSignup = async () => {
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const user = userCredential.user;

            // Enregistre les informations de l'utilisateur dans Firestore s'il s'agit d'une première connexion
            const userDocRef = doc(db, "users", user.uid);
            const userSnapshot = await getDoc(userDocRef);
            if (!userSnapshot.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName || "",
                    email: user.email,
                    createdAt: new Date(),
                    stripeConfigured: false,
                });
            }

            router.push(`/${lng}/eventlab`);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <BackgroundLines className="flex items-center justify-center">                
            <div className="flex items-center justify-center min-h-screen relative z-10">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                    <Title level={2} className="text-center">
                        EaseEvent
                    </Title>

                    {error && <Alert message={error} type="error" showIcon />}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input
                            type="text"
                            placeholder={safeTranslate(t, "name")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full"
                            size="large"
                        />
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
                            {safeTranslate(t, "signup")}
                        </Button>
                    </form>

                    <Divider>Or</Divider>

                    <Button
                        onClick={handleGoogleSignup}
                        type="default"
                        className="w-full flex items-center justify-center space-x-2"
                        size="large"
                    >
                        <FcGoogle className="text-xl" />
                        <span>{safeTranslate(t, "signup_google")}</span>
                    </Button>

                    <p className="text-center text-gray-500">
                        {safeTranslate(t, "already_member")}{" "}
                        <Link href="/auth/signin" className="text-blue-500 hover:underline hover:text-blue-700">
                            {safeTranslate(t, "signin")}
                        </Link>
                    </p>
                </div>
            </div>
        </BackgroundLines>
    );
};

export default Signup;
