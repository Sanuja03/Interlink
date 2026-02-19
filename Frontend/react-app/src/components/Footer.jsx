import React from 'react';

const Footer = () => {
    const socialLinks = [
        {
            name: 'Facebook',
            href: '#',
            color: 'bg-blue-600',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
            ),
        },
        {
            name: 'Instagram',
            href: '#',
            color: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
            ),
        },
        {
            name: 'WhatsApp',
            href: '#',
            color: 'bg-green-500',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.854a.5.5 0 00.61.61l6.016-1.474A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.66-.52-5.17-1.42l-.37-.22-3.83.94.96-3.73-.24-.38A10 10 0 1112 22z" />
                </svg>
            ),
        },
        {
            name: 'LinkedIn',
            href: '#',
            color: 'bg-blue-700',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            ),
        },
    ];

    return (
        <footer className="w-full bg-gray-800 text-gray-300 pt-10 pb-4">
            <div className="max-w-6xl mx-auto px-6">
                {/* Top section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Contact Info */}
                    <div>
                        <p className="text-sm leading-relaxed">
                            University of Moratuwa, Bandaranayake<br />
                            Mawatha<br />
                            Moratuwa, Sri Lanka<br />
                            Tel: +94 112 388 655<br />
                            Email: info@interlink.com
                        </p>
                    </div>

                    {/* Job Seekers */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">Job Seekers</h3>
                        <ul className="space-y-1 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Register Now</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Search Jobs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Login</a></li>
                        </ul>
                    </div>

                    {/* Employers */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">Employers</h3>
                        <ul className="space-y-1 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Advertise</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">Quick Links</h3>
                        <ul className="space-y-1 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-600 mb-6" />

                {/* Bottom: Social Icons + Copyright + Logo */}
                <div className="flex flex-col items-center gap-4">
                    {/* Social Icons */}
                    <div className="flex items-center gap-3">
                        {socialLinks.map((s) => (
                            <a
                                key={s.name}
                                href={s.href}
                                title={s.name}
                                className={`${s.color} text-white w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow`}
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-gray-400">2025, Interlink.com</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
