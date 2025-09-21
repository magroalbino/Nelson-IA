import Image from "next/image";
import type { SVGProps } from "react";

export const Logo = (props: SVGProps<SVGSVGElement> & { width?: number, height?: number }) => (
    <Image
        src="/assets/logo-eustaquio.png"
        alt="Eustáquio IA Logo"
        width={props.width || 64}
        height={props.height || 64}
        // Remove className from props to avoid conflict with Image component
        {...{...props, className: undefined}}
    />
);
