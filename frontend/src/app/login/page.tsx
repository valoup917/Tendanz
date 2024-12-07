"use client"
import React, { useState } from "react";

import { motion } from "framer-motion";
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

/* Components */
import { LampContainer } from "@/components/ui/lamp";
import { Input } from "@nextui-org/input";

/* Requests */
import { userLoginRequest } from "@/services/usersRequests";

/* Models */
import { LoginRequestModel } from "@/services/models/AuthRequestModel";
import ErrorResponseModel from "../models/ErrorResponseModel";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function Login() {
        try {
            const jwt = await userLoginRequest({ email: email, password: password } as LoginRequestModel);
            console.log(jwt)
            setCookie("jwt", jwt);
            router.push(`/dashboard`);
        } catch (e : any) {
            const error = e as ErrorResponseModel;
            console.log(error.code);
            console.log(error.message);
        }
    }

    return (
        <div className="w-screen h-screen">
            <LampContainer className="w-full">
                <motion.div
                    initial={{ opacity: 0.5, y: 150 }}
                    whileInView={{ opacity: 1, y: 75 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="w-full flex flex-col space-y-10"
                    >
                    <Input type="email" label="Email" value={email} onValueChange={setEmail} className="w-72" />
                    <Input type="password" label="Password" value={password} onValueChange={setPassword} className="w-72" />
                    <div className="flex pt-16 items-center justify-center">
                        <button
                            onClick={Login}
                            className="relative inline text-xl font-medium before:bg-cyan-500 text-white before:absolute before:-bottom-1 before:block before:h-[2px] before:w-full before:origin-bottom-right before:scale-x-0 before:transition before:duration-300 before:ease-in-out hover:before:origin-bottom-left hover:before:scale-x-100">
                            Login
                        </button>
                    </div>
                </motion.div>
            </LampContainer>
        </div>
    );
}