export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="12" fill="hsl(var(--primary))"/>
        <path d="M20 44C20 37.3726 25.3726 32 32 32C38.6274 32 44 37.3726 44 44" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round"/>
        <path d="M32 20V32" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="26" cy="26" r="2" fill="hsl(var(--primary-foreground))"/>
        <circle cx="38" cy="26" r="2" fill="hsl(var(--primary-foreground))"/>
        <path d="M28 21C28.5 20 30.5 19 32 19C33.5 19 35.5 20 36 21" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
