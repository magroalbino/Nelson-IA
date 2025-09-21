import Image from "next/image";

export const Logo = (props: { width?: number, height?: number, className?: string }) => (
    <Image
        src="/assets/logo-eustaquio-2.png"
        alt="Eustáquio IA Logo"
        width={props.width || 64}
        height={props.height || 64}
        className={props.className}
        style={{ height: 'auto' }}
        priority
    />
);
