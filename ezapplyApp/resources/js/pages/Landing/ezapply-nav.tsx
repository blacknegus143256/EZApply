import React, { useState, useEffect, useRef } from "react";
import "../../../css/easyApply.css";
import { Link, router } from "@inertiajs/react";
import AppLogoIcon from '../../components/app-logo-icon';
import { Button } from "@headlessui/react";
import { Menu, X } from "lucide-react";

const EzNav = ({ user }: { user?: any }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const navRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isVerified =
        !!user && typeof user === "object" && Object.keys(user).length > 0;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                navRef.current &&
                !navRef.current.contains(event.target as Node) &&
                isMenuOpen
            ) {
                setIsMenuOpen(false);
            }
        };

        // Close menu on ESC key
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        // Prevent body scroll when menu is open
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    // Track active section for highlighting
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["services", "about", "contact"];
            const scrollPosition = window.scrollY + 150; // Offset for navbar
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const isNearBottom = scrollPosition + windowHeight >= documentHeight - 150; // Near bottom threshold

            // Check if we're near the bottom - if so, contact is active
            if (isNearBottom) {
                setActiveSection("contact");
                return;
            }

            // Otherwise, check each section from bottom to top
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop } = element;
                    // If we've scrolled past this section's start, it's active
                    if (scrollPosition >= offsetTop - 100) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Check on mount

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        setIsMenuOpen(false);

        if (href.startsWith("#")) {
            // Smooth scroll to section with offset for fixed navbar
            const element = document.getElementById(href.substring(1));
            if (element) {
                const navHeight = 80; // Approximate navbar height
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        } else {
            // Navigate to page
            router.visit(href);
        }
    };

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (window.location.pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            setIsMenuOpen(false);
        }
    };

    const navLinks = [
        { href: "/", label: "Home", id: "home" },
        { href: "#services", label: "Services", id: "services" },
        { href: "#about", label: "About", id: "about" },
        { href: "#contact", label: "Contact", id: "contact" },
    ];

    return (
        <nav 
            ref={navRef}
            className={`ezapply-nav ${isMenuOpen ? 'mobile-open' : ''}`}
            role="navigation"
            aria-label="Main navigation"
        > 
            <div className="ezapply-logo">
                <a 
                    href="/" 
                    className="flex items-center gap-2"
                    onClick={handleLogoClick}
                    aria-label="EZ Apply PH Home"
                > 
                    <AppLogoIcon className="size-6" /> 
                    <div className="flex flex-col">
                        <span className="leading-tight font-semibold">EZ Apply PH</span>
                        <span className="text-xs text-gray-500 font-normal leading-tight">Franchise</span>
                    </div>
                </a>
            </div>

            <div 
                ref={menuRef}
                className={`ezapply-navlinks ${isMenuOpen ? 'mobile-open' : ''}`}
                id="nav-menu"
                role="menu"
            > 
                {navLinks.map((link) => (
                    <div key={link.id} className="ezapply-navlink" role="none">
                        <a 
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link.href)}
                            className={activeSection === link.id ? "active" : ""}
                            role="menuitem"
                            aria-current={activeSection === link.id ? "page" : undefined}
                        >
                            {link.label}
                        </a>
                    </div>
                ))}

                <div className="ezapply-login-container mobile-only">
                    {!isVerified ? (
                        <div className="flex flex-col gap-2 w-full"> 
                            <Link 
                                href="/login" 
                                className="btn-outline w-full text-center" 
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link 
                                href="/register" 
                                className="btn-outline w-full text-center" 
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </div>
                    ) : (
                        <Link 
                            href="/dashboard" 
                            className="btn-outline w-full text-center" 
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                    )}
                </div>
            </div>

            <div className="ezapply-login-container desktop-only">
                {!isVerified ? (
                    <div className="flex gap-2 items-center">
                        <Link href="/login" className="btn-outline">
                            Login
                        </Link>
                        <Link href="/register" className="btn-outline">
                            Register
                        </Link>
                    </div>
                ) : (
                    <Link href="/dashboard" className="btn-outline">
                        Dashboard
                    </Link>
                )}
            </div>

            <Button 
                className="menu-toggle" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-controls="nav-menu"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                type="button"
            >
                {isMenuOpen ? (
                    <X className="size-6" aria-hidden="true" />
                ) : (
                    <Menu className="size-6" aria-hidden="true" />
                )}
            </Button>

            {/* Backdrop for mobile menu */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[998] lg:hidden transition-opacity duration-300"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </nav>
    )
}

export default EzNav;
