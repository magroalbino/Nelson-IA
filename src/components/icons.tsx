export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="12" fill="hsl(var(--primary))"/>
        <path d="M20 46C20 38.268 25.3726 32 32 32C38.6274 32 44 38.268 44 46" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round"/>
        <path d="M24 24C24.5 22 28.5 19 32 19C35.5 19 39.5 22 40 24" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="26" cy="30" r="2.5" fill="hsl(var(--primary-foreground))"/>
        <circle cx="38" cy="30" r="2.5" fill="hsl(var(--primary-foreground))"/>
    </svg>
);
