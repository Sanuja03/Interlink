import "./Footer.css";

import logo from "../../../assets/logo.png";
import facebook from "../../../assets/facebook.png";
import instagram from "../../../assets/instagram.png";
import whatsapp from "../../../assets/whatsapp.png";
import linkedin from "../../../assets/linkedin.png";

export default function Footer() {
    return (
        <footer className="il-footer">
            <div className="il-footer__container">
                <div className="il-footer__col">
                    <p className="il-footer__text">
                        University of Moratuwa, Bandaranayake Mawatha
                        <br />
                        Moratuwa, Sri Lanka
                        <br />
                        Tel: +94 112 388 655
                        <br />
                        Email: info@interlink.com
                    </p>
                </div>

                <div className="il-footer__col">
                    <h4 className="il-footer__title">Job Seekers</h4>
                    <ul className="il-footer__links">
                        <li><a href="#">Register Now</a></li>
                        <li><a href="#">Search Jobs</a></li>
                        <li><a href="#">Login</a></li>
                    </ul>
                </div>

                <div className="il-footer__col">
                    <h4 className="il-footer__title">Employers</h4>
                    <ul className="il-footer__links">
                        <li><a href="#">Post a Job</a></li>
                        <li><a href="#">Advertise</a></li>
                        <li><a href="#">Terms of Service</a></li>
                    </ul>
                </div>

                <div className="il-footer__col il-footer__right">
                    <h4 className="il-footer__title">Quick Links</h4>
                    <ul className="il-footer__links">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>

                    <div className="il-footer__brand">
                        <img className="il-footer__brandLogo" src={logo} alt="Interlink" />
                        <p className="il-footer__copyright">2025, Interlink.com</p>
                    </div>
                </div>
            </div>

            <div className="il-footer__socialRow">
                <a className="il-footer__social" href="#" aria-label="Facebook">
                    <img src={facebook} alt="Facebook" />
                </a>
                <a className="il-footer__social" href="#" aria-label="Instagram">
                    <img src={instagram} alt="Instagram" />
                </a>
                <a className="il-footer__social" href="#" aria-label="WhatsApp">
                    <img src={whatsapp} alt="WhatsApp" />
                </a>
                <a className="il-footer__social" href="#" aria-label="LinkedIn">
                    <img src={linkedin} alt="LinkedIn" />
                </a>
            </div>
        </footer>
    );
}
