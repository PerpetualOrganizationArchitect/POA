import React, { use, useEffect, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { useRouter } from "next/router";
import NextLink from 'next/link';
import { useUserContext } from '@/context/UserContext';

const LoginButton = () => {

    const { address, hasMemberRole} = useUserContext();
    
    const router = useRouter();
    const { userDAO } = router.query;



    // const [isMounted, setIsMounted] = useState(false); // new state to track mounting
    const [text, setText] = useState("Connect Wallet");
    const [ route , setRoute] = useState("user");

    // Effect to set text based on accounts, only runs on client side after mount
    useEffect(() => {

        if (hasMemberRole) {
            setText("Profile Hub");
            setRoute("profileHub");
        } else {

            setText("Join or Connect");
        }
    }, [hasMemberRole, address]);


    return (
        <NextLink href={`/${route}/?userDAO=${userDAO}`} passHref>
            <Button
                bgGradient="linear(to-r, teal.300, green.300)"
                color="white"
                _hover={{
                    bgGradient: "linear(to-r, teal.600, green.600)",
                }}
                _active={{
                    bgGradient: "linear(to-r, teal.700, green.700)",
                }}
                borderRadius="full"
                px="6"
                py="2"
                fontSize="lg"
                fontWeight="bold"
                textColor="black"
                onClick={(e) => {
                        // setChecked(false);
                
                }}
            >
                {text}
            </Button>
        </NextLink>
    );
};

export default LoginButton;
