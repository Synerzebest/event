"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
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
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const lng = useLanguage();
    const router = useRouter();

    const { t } = useTranslation(lng, "auth");

    // Vérifie que le username est unique dans Firestore
    const checkUsernameAvailability = async (username: string) => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    };

    // Inscription avec email et mot de passe
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const isAvailable = await checkUsernameAvailability(username);
            if (!isAvailable) {
                setError(safeTranslate(t, "username_taken"))
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                username: username,
                email: email,
                photoURL: user.photoURL || null,
                eventsCreated: [],
                createdAt: new Date(),
                stripeConfigured: false,
            });

            router.push(`/${lng}/eventlab`);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Inscription avec Google
    const handleGoogleSignup = async () => {
        setError(null);
        setLoading(true);

        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (!userSnapshot.exists()) {
                // Génération d'un username temporaire unique
                const generatedUsername = "user-" + user.uid.substring(0, 6);

                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName || "",
                    username: generatedUsername,
                    email: user.email,
                    photoURL: user.photoURL || null,
                    eventsCreated: [],
                    createdAt: new Date(),
                    stripeConfigured: false,
                });
            }

            router.push(`/${lng}/eventlab`);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
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
                            type="text"
                            placeholder={safeTranslate(t, "username")}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                            loading={loading}
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
                        loading={loading}
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
