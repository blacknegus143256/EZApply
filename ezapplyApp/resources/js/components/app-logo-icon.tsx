import { SVGAttributes } from 'react';
import ezAppLogo from '../../../public/ezapply model 1.png'; 

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img 
            src={ezAppLogo} 
            alt="EZApply Logo" 
            {...props as any} 
        />
    );
}