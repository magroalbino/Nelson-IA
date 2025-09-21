import Image from "next/image";
import type { ImageProps } from "next/image";

export const Logo = (props: Omit<ImageProps, 'src' | 'alt'>) => (
    <Image
        src="/assets/logo-eustaquio-2.png"
        alt="Eustáquio IA Logo"
        {...props}
        priority
    />
);
