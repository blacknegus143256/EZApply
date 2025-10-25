import AppLogoIcon from './app-logo-icon';
import '../../css/easyApply.css';

export default function AppLogo() {
return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md 
                        bg-gradient-to-br from-green-200 via-white to-blue-200
                        text-black">
                <AppLogoIcon className="size-5" /> 
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold ezapply-logo">EZ Apply PH</span>
            </div>
        </>
    );
}