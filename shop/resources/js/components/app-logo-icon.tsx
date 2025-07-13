import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.8" />
            <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">
                M
            </text>
        </svg>
    );
}
